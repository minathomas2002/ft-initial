import type { HttpInterceptorFn } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injector } from '@angular/core';
import { catchError, switchMap, throwError, Observable, shareReplay, tap, finalize } from 'rxjs';
import { AuthApiService } from '../../../shared/api/auth/auth-api-service';
import { AuthStore } from '../../../shared/stores/auth/auth.store';
import { IAuthData, IRefreshTokenRequest, IBaseApiResponse } from '../../../shared/interfaces';
import { API_ENDPOINTS } from '../../../shared/api/api-endpoints';
import { LocalStorage } from 'src/app/shared/services/local-storage/local-storage';
import { JwtService } from 'src/app/shared/services/auth/jwt-service';
import { EImpersonationStatus, ERoutes } from 'src/app/shared/enums';
import { Router } from '@angular/router';

// Shared refresh token observable to prevent multiple refresh calls
let refreshTokenInProgress: Observable<IBaseApiResponse<IAuthData>> | null = null;

const isRefreshTokenEndpoint = (url: string): boolean => {
  return url.includes(API_ENDPOINTS.auth.refreshToken);
};

/** Login/auth endpoints that must not receive the Bearer token */
const isLoginEndpoint = (url: string): boolean => {
  const loginPaths = [
    API_ENDPOINTS.auth.investorLogin,
    API_ENDPOINTS.auth.windowsLogin,
    API_ENDPOINTS.auth.fakeWindowsLogin,
    API_ENDPOINTS.auth.register,
    API_ENDPOINTS.auth.forgotPassword,
    API_ENDPOINTS.auth.resetPassword,
    API_ENDPOINTS.auth.passwordResetTokenExpiry,
    API_ENDPOINTS.auth.verifyEmail,
    API_ENDPOINTS.auth.resendVerifyEmail,
    'assets'
  ];
  return loginPaths.some((path) => url.includes(path));
};

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const injector = inject(Injector);
  const authApiService = inject(AuthApiService);
  const router = inject(Router);
  const localStorage = inject(LocalStorage);
  const jwtService = inject(JwtService);

  const authData = localStorage.getAuthData();
  let clonedRequest = req;

  if (authData?.token && !isLoginEndpoint(req.url)) {
    clonedRequest = req.clone({
      setHeaders: { Authorization: `Bearer ${authData.token}` },
    });
  }

  return next(clonedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      // Don't try to refresh token if the request is to the refresh token endpoint itself
      if (error.status === 401 && authData && !isRefreshTokenEndpoint(req.url)) {
        // Decode JWT to get isImpersonating without injecting AuthStore (avoids circular dependency)
        const jwtDetails = jwtService.decodeJwt(authData.token);
        const isImpersonating = jwtDetails?.ImpersonationStatus === EImpersonationStatus.DELEGATEE;

        const refreshRequest: IRefreshTokenRequest = {
          accessToken: authData.token,
          refreshToken: authData.refreshToken,
          isImpersonating: isImpersonating ?? false,
        };

        // If refresh is already in progress, reuse that observable
        if (!refreshTokenInProgress) {
          refreshTokenInProgress = authApiService.refreshToken(refreshRequest).pipe(
            shareReplay(1), // Share the result with all subscribers
            tap((response) => {
              if (response.success && response.body) {
                // Lazy-inject AuthStore only when needed (after app bootstrap, breaks circular dependency)
                const authStore = injector.get(AuthStore);
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
            // Refresh failed, return error - lazy-inject AuthStore for logout
            const authStore = injector.get(AuthStore);
            authStore.logout();
            router.navigate(['/', ERoutes.auth, ERoutes.login]);
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
