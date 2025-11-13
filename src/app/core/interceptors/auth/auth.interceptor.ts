import type { HttpInterceptorFn } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthApiService } from '../../../shared/api/auth/auth-api-service';
import { AuthStore } from '../../../shared/stores/auth/auth.store';
import { IAuthData, IRefreshTokenRequest } from '../../../shared/interfaces';
import { API_ENDPOINTS } from '../../../shared/api/api-endpoints';

const AUTH_STORAGE_KEY = 'auth_data';

const getAuthDataFromStorage = (): IAuthData | null => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  }
  return null;
};

const saveAuthDataToStorage = (authData: IAuthData): void => {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
  }
};

const isRefreshTokenEndpoint = (url: string): boolean => {
  return url.includes(API_ENDPOINTS.auth.refreshToken);
};

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authApiService = inject(AuthApiService);
  const authStore = inject(AuthStore);

  const authData = getAuthDataFromStorage();
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

        return authApiService.refreshToken(refreshRequest).pipe(
          switchMap((response) => {
            if (response.succeeded && response.data) {
              // Save new tokens to storage
              saveAuthDataToStorage(response.data);
              authStore.updateAuthDataInStorage(response);

              // Retry the original request with new token
              const retryRequest = req.clone({
                setHeaders: { Authorization: `Bearer ${response.data.token}` },
              });
              return next(retryRequest);
            }
            return throwError(() => error);
          }),
          catchError((refreshError) => {
            // Refresh failed, clear storage and return error
            if (typeof window !== 'undefined' && window.localStorage) {
              localStorage.removeItem(AUTH_STORAGE_KEY);
            }
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
