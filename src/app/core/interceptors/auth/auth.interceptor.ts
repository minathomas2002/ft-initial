import type { HttpInterceptorFn } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError, Observable, shareReplay, tap, finalize } from 'rxjs';
import { AuthApiService } from '../../../shared/api/auth/auth-api-service';
import { AuthStore } from '../../../shared/stores/auth/auth.store';
import { IAuthData, IRefreshTokenRequest, IBaseApiResponse } from '../../../shared/interfaces';
import { API_ENDPOINTS } from '../../../shared/api/api-endpoints';
import { LocalStorage } from 'src/app/shared/services/local-storage/local-storage';
import { ERoutes } from 'src/app/shared/enums';
import { Router } from '@angular/router';

const AUTH_STORAGE_KEY = 'auth_data';

// Shared refresh token observable to prevent multiple refresh calls
let refreshTokenInProgress: Observable<IBaseApiResponse<IAuthData>> | null = null;

const isRefreshTokenEndpoint = (url: string): boolean => {
  return url.includes(API_ENDPOINTS.auth.refreshToken);
};

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authApiService = inject(AuthApiService);
  const authStore = inject(AuthStore);
  const router = inject(Router);
  const localStorage = inject(LocalStorage);

  const authData = localStorage.getAuthData();
  let clonedRequest = req;

  if (authData?.token) {
    clonedRequest = req.clone({
      setHeaders: { Authorization: `Bearer ${authData.token}` },
    });
  }

  return next(clonedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      // Don't try to refresh token if the request is to the refresh token endpoint itself
      if (error.status === 401 && authData && !isRefreshTokenEndpoint(req.url)) {
        // Token expired, try to refresh
        const refreshRequest: IRefreshTokenRequest = {
          accessToken: authData.token,
          refreshToken: authData.refreshToken,
        };

        // If refresh is already in progress, reuse that observable
        if (!refreshTokenInProgress) {
          refreshTokenInProgress = authApiService.refreshToken(refreshRequest).pipe(
            shareReplay(1), // Share the result with all subscribers
            tap((response) => {
              if (response.success && response.body) {
                // Save new tokens to storage
                authStore.updateAuthDataInStorage(response);
              }
            }),
            finalize(() => {
              // Clear the in-progress flag after completion (success or error)
              refreshTokenInProgress = null;
            }),
            catchError((refreshError) => {
              // Refresh failed, clear storage
              if (typeof window !== 'undefined' && window.localStorage) {
                localStorage.cleanAuthData();
              }
              return throwError(() => refreshError);
            })
          );
        }

        return refreshTokenInProgress.pipe(
          switchMap((response) => {
            if (response.success && response.body) {
              // Retry the original request with new token
              const retryRequest = req.clone({
                setHeaders: { Authorization: `Bearer ${response.body.token}` },
              });
              return next(retryRequest);
            }
            return throwError(() => error);
          }),
          catchError((refreshError) => {
            // Refresh failed, return error
            authStore.logout();
            router.navigate(['/', ERoutes.auth, ERoutes.login])
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
