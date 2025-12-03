import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { type Observable, type Subscription, catchError, finalize, throwError, tap } from 'rxjs';
import { IAuthData, IRegisterRequest, IResetPasswordRequest, IBaseApiResponse, IJwtUserDetails, IUserProfile, } from '../../interfaces';
import { AuthApiService } from '../../api/auth/auth-api-service';
import { LocalStorage } from '../../services/local-storage/local-storage';
import { HttpErrorResponse } from '@angular/common/http';
import { JwtService } from '../../services/auth/jwt-service';

const initialState: {
  authResponse: IAuthData | null;
  jwtUserDetails: IJwtUserDetails | null;
  loading: boolean;
  _inactivityTimeout$: Subscription | null;
  userProfile: IUserProfile | null;
} = {
  authResponse: null,
  jwtUserDetails: null,
  loading: false,
  _inactivityTimeout$: null,
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
    const localStorage = inject(LocalStorage);
    const jwtService = inject(JwtService);

    return {
      logout(): void {
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
      },

      handleLoginMethod(
        login$: Observable<IBaseApiResponse<IAuthData>>
      ): Observable<IBaseApiResponse<IAuthData>> {
        return login$.pipe(
          tap((response: IBaseApiResponse<IAuthData>) => {
            if (response.success && response.body) {
              this.updateAuthDataInStorage(response);
              this.getUserProfile().subscribe();
            }
          }),
          finalize(() => {
            patchState(store, { loading: false });
          })
        );
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
      }
    },
  })
);
