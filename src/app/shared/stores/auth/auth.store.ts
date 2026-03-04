import { computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { type Observable, type Subscription, catchError, finalize, throwError, tap, pipe, take } from 'rxjs';
import { IAuthData, IRegisterRequest, IResetPasswordRequest, IBaseApiResponse, IJwtUserDetails, IUserProfile, } from '../../interfaces';
import { AuthApiService } from '../../api/auth/auth-api-service';
import { UsersApiService } from '../../api/users/users-api-service';
import { LocalStorage } from '../../services/local-storage/local-storage';
import { HttpErrorResponse } from '@angular/common/http';
import { JwtService } from '../../services/auth/jwt-service';
import { ERoutes } from '../../enums';
import type { SupportedLanguage } from '../../services/i18n/i18n.service';

const REFRESH_BEFORE_EXPIRY_MS = 2 * 60 * 1000; // 2 minutes before expiry

const initialState: {
  authResponse: IAuthData | null;
  jwtUserDetails: IJwtUserDetails | null;
  loading: boolean;
  _inactivityTimeout$: Subscription | null;
  _refreshTimerId: ReturnType<typeof setTimeout> | null;
  userProfile: IUserProfile | null;
} = {
  authResponse: null,
  jwtUserDetails: null,
  loading: false,
  _inactivityTimeout$: null,
  _refreshTimerId: null,
  userProfile: null,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => {
    return {
      isAuthenticated: computed(() => store.authResponse() !== null),
      userCode: computed(
        () => store.userProfile()?.employeeID ?? store.userProfile()?.investorCode ?? ''
      ),
    };
  }),
  withMethods((store) => {
    const authApiService = inject(AuthApiService);
    const usersApiService = inject(UsersApiService);
    const localStorage = inject(LocalStorage);
    const jwtService = inject(JwtService);
    const router = inject(Router);

    function getRefreshDelayMs(authData: IAuthData): number | null {
      if (!authData.expiresAt) {
        return null;
      }
      const expiresAtMs = new Date(authData.expiresAt).getTime();
      if (Number.isNaN(expiresAtMs)) {
        return null;
      }
      const refreshAtMs = expiresAtMs - REFRESH_BEFORE_EXPIRY_MS;
      const delayMs = refreshAtMs - Date.now();
      return delayMs > 0 ? delayMs : null;
    }

    function isRefreshTokenValid(authData: IAuthData): boolean {
      if (!authData.refreshToken || !authData.refreshTokenExpiresAt) {
        return false;
      }
      const refreshTokenExpiresAtMs = new Date(authData.refreshTokenExpiresAt).getTime();
      if (Number.isNaN(refreshTokenExpiresAtMs)) {
        return false;
      }
      return refreshTokenExpiresAtMs > Date.now();
    }

    return {
      clearRefreshTimer(): void {
        const timerId = store._refreshTimerId();
        if (timerId !== null) {
          clearTimeout(timerId);
          patchState(store, { _refreshTimerId: null });
        }
      },

      scheduleTokenRefresh(): void {
        this.clearRefreshTimer();
        const authData = localStorage.getAuthData();
        if (!authData?.token || !authData.refreshToken || !authData.expiresAt) {
          return;
        }
        if (!isRefreshTokenValid(authData)) {
          return;
        }
        const delayMs = getRefreshDelayMs(authData);
        if (delayMs === null) {
          return;
        }
        const timerId = setTimeout(() => {
          this.refreshTokenProactively();
        }, delayMs);
        patchState(store, { _refreshTimerId: timerId });
      },

      refreshTokenProactively(): void {
        const authData = localStorage.getAuthData();
        if (!authData?.token || !authData.refreshToken) {
          this.logout();
          return;
        }
        const refreshRequest = {
          accessToken: authData.token,
          refreshToken: authData.refreshToken,
        };
        authApiService.refreshToken(refreshRequest).subscribe({
          next: (response) => {
            if (response.success && response.body) {
              this.updateAuthDataInStorage(response);
              this.scheduleTokenRefresh();
            } else {
              this.logout();
              router.navigate(['/', ERoutes.auth, ERoutes.login]);
            }
          },
          error: () => {
            this.logout();
            router.navigate(['/', ERoutes.auth, ERoutes.login]);
          },
        });
      },

      logout(): void {
        this.clearRefreshTimer();
        localStorage.cleanAll();
        patchState(store, { authResponse: null, jwtUserDetails: null, userProfile: null });
        authApiService.logout();
      },

      login(email: string, password: string): Observable<IBaseApiResponse<IAuthData>> {
        patchState(store, { loading: true });
        return this.handleLoginMethod(authApiService.login(email, password));
      },

      windowsLogin(): Observable<IBaseApiResponse<IAuthData>> {
        patchState(store, { loading: true });
        return this.handleLoginMethod(authApiService.windowsLogin());
      },

      fakeWindowsLogin(userName: string): Observable<IBaseApiResponse<IAuthData>> {
        patchState(store, { loading: true });
        return this.handleLoginMethod(authApiService.fakeWindowsLogin(userName));
      },

      updateAuthDataInStorage(authResponse: IBaseApiResponse<IAuthData>): void {
        patchState(store, {
          authResponse: authResponse.body,
          jwtUserDetails: jwtService.decodeJwt(authResponse.body?.token ?? ''),
        });
        localStorage.saveAuthDataToStorage(authResponse);
        this.scheduleTokenRefresh();
      },

      handleLoginMethod(
        login$: Observable<IBaseApiResponse<IAuthData>>
      ): Observable<IBaseApiResponse<IAuthData>> {
        return login$.pipe(
          tap((response: IBaseApiResponse<IAuthData>) => {
            const hasValidToken = Boolean(response.body?.token);
            const isEmailVerified = response.body?.isEmailVerified !== false;

            if (response.success && response.body && hasValidToken && isEmailVerified) {
              this.updateAuthDataInStorage(response);
              this.getUserProfile()
                .pipe(take(1))
                .subscribe();
              this.syncLanguageToServer();
            }
          }),
          finalize(() => {
            patchState(store, { loading: false });
          })
        );
      },

      syncLanguageToServer(): void {
        const lang = (typeof window !== 'undefined' && window.localStorage?.getItem('preferred-language')) as SupportedLanguage | null;
        const supportedLang = lang === 'en' || lang === 'ar' ? lang : 'en';
        usersApiService.changeLanguage(supportedLang).pipe(take(1)).subscribe();
      },

      getUserProfile(): Observable<IBaseApiResponse<IUserProfile>> {
        patchState(store, { loading: true });
        return authApiService.getUserProfile().pipe(
          tap((response: IBaseApiResponse<IUserProfile>) => {
            if (response.success && response.body) {
              patchState(store, { userProfile: response.body });
              localStorage.saveUserProfileToStorage(response.body);
            }
          }),
          finalize(() => {
            patchState(store, { loading: false });
          })
        );
      },

      register(registerRequest: IRegisterRequest): Observable<IBaseApiResponse<IAuthData>> {
        patchState(store, { loading: true });
        return authApiService.register(registerRequest).pipe(
          finalize(() => {
            patchState(store, { loading: false });
          })
        );
      },

      resetPassword(request: IResetPasswordRequest): Observable<IBaseApiResponse<IAuthData>> {
        patchState(store, { loading: true });
        return authApiService.resetPassword(request).pipe(
          finalize(() => {
            patchState(store, { loading: false });
          })
        );
      },

      forgotPassword(email: string): Observable<IBaseApiResponse<void>> {
        patchState(store, { loading: true });
        return authApiService.forgotPassword(email).pipe(
          finalize(() => {
            patchState(store, { loading: false });
          })
        );
      },

      resentVerifyEmail(email: string): Observable<IBaseApiResponse<void>> {
        patchState(store, { loading: true });
        return authApiService.resendVerifyEmail(email).pipe(
          finalize(() => {
            patchState(store, { loading: false });
          })
        );
      },

      verifyEmail(token: string): Observable<IBaseApiResponse<void>> {
        patchState(store, { loading: true });
        return authApiService.verifyEmail(token).pipe(
          catchError((error: HttpErrorResponse) => {
            const errors = error.error.errors;
            return throwError(() => new Error(errors));
          }),
          finalize(() => {
            console.log('finalize');
            patchState(store, { loading: false });
          })
        );
      },

      passwordResetTokenExpiry(token: string): Observable<IBaseApiResponse<boolean>> {
        patchState(store, { loading: true });
        return authApiService.passwordResetTokenExpiry(token).pipe(
          finalize(() => {
            patchState(store, { loading: false });
          })
        );
      },
    };
  }),
  //Load user from localstorage automatically
  withHooks({
    onInit(store) {
      const localStorage = inject(LocalStorage);
      const stored = localStorage.getAuthData();
      const jwtService = inject(JwtService);
      if (stored) {
        patchState(store, {
          authResponse: stored,
          jwtUserDetails: jwtService.decodeJwt(stored?.token ?? ''),
        });
        const userProfile = localStorage.getUserProfile();
        if (userProfile) {
          patchState(store, { userProfile: userProfile });
        }
        store.scheduleTokenRefresh();
        store.syncLanguageToServer();
      }
    },
  })
);
