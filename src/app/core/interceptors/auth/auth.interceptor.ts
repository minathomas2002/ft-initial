import type { HttpInterceptorFn } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthApiService } from '../../../shared/api/auth/auth-api-service';
import { AuthStore } from '../../../shared/stores/auth/auth.store';
import { IAuthData, IRefreshTokenRequest } from '../../../shared/interfaces';
import { API_ENDPOINTS } from '../../../shared/api/api-endpoints';
import { LocalStorage } from 'src/app/shared/services/local-storage/local-storage';

const AUTH_STORAGE_KEY = 'auth_data';

const isRefreshTokenEndpoint = (url: string): boolean => {
  return url.includes(API_ENDPOINTS.auth.refreshToken);
};

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authApiService = inject(AuthApiService);
  const authStore = inject(AuthStore);
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
      debugger
      // Don't try to refresh token if the request is to the refresh token endpoint itself
      if (error.status === 401 && authData && !isRefreshTokenEndpoint(req.url)) {
        // Token expired, try to refresh
        const refreshRequest: IRefreshTokenRequest = {
          accessToken: authData.token,
          refreshToken: authData.refreshToken,
        };

        return authApiService.refreshToken(refreshRequest).pipe(
          switchMap((response) => {
            if (response.success && response.body) {
              // Save new tokens to storage
              authStore.updateAuthDataInStorage(response);
              // Retry the original request with new token
              const retryRequest = req.clone({
                setHeaders: { Authorization: `Bearer ${response.body.token}` },
              });
              return next(retryRequest);
            }
            return throwError(() => error);
          }),
          catchError((refreshError) => {
            debugger;
            // Refresh failed, clear storage and return error
            if (typeof window !== 'undefined' && window.localStorage) {
              localStorage.cleanAuthData()
            }
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
