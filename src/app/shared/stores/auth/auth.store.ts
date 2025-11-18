import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { type Observable, type Subscription, finalize, tap } from 'rxjs';
import { IAuthResponse, IAuthData, IRegisterRequest, IResetPasswordRequest } from '../../interfaces';
import { AuthApiService } from '../../api/auth/auth-api-service';
import { LocalStorage } from '../../services/local-storage/local-storage';

const initialState: {
  user: IAuthData | null;
  loading: boolean;
  _inactivityTimeout$: Subscription | null;
} = {
  user: null,
  loading: false,
  _inactivityTimeout$: null,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  //Load user from localstorage automatically
  withHooks({
    onInit(store) {
      const localStorage = inject(LocalStorage);
      const stored = localStorage.getAuthData();

      if (stored) {
        patchState(store, { user: stored });
      }
    },
  }),
  withComputed((store) => {
    return {
      isAuthenticated: computed(() => store.user() !== null),
    };
  }),
  withMethods((store) => {
    const authApiService = inject(AuthApiService);
    const localStorage = inject(LocalStorage);

    return {
      logout(): void {
        localStorage.cleanAuthData();
        patchState(store, { user: null });
        authApiService.logout();
      },

      login(email: string, password: string): Observable<IAuthResponse> {
        patchState(store, { loading: true });
        return this.handleLoginMethod(authApiService.login(email, password));
      },

      windowsLogin(): Observable<IAuthResponse> {
        patchState(store, { loading: true });
        return this.handleLoginMethod(authApiService.windowsLogin());
      },

      fakeWindowsLogin(userName: string): Observable<IAuthResponse> {
        patchState(store, { loading: true });
        return this.handleLoginMethod(authApiService.fakeWindowsLogin(userName));
      },

      updateAuthDataInStorage(authResponse: IAuthResponse): void {
        patchState(store, { user: authResponse.data });
        localStorage.saveAuthDataToStorage(authResponse);
      },

      handleLoginMethod(login$: Observable<IAuthResponse>): Observable<IAuthResponse> {
        return login$.pipe(
          tap((response: IAuthResponse) => {
            if (response.succeeded && response.data) {              
              this.updateAuthDataInStorage(response);
            }
          }),
          finalize(() => {
            patchState(store, { loading: false });
          })
        );
      },

      register(registerRequest: IRegisterRequest): Observable<IAuthResponse> {
        patchState(store, { loading: true });
        return authApiService.register(registerRequest);
      },

      resetPassword(request: IResetPasswordRequest): Observable<IAuthResponse> {
        patchState(store, { loading: true });
        return authApiService.resetPassword(request).pipe(
          finalize(() => {
            patchState(store, { loading: false });
          })
        );
      },

    };
  })
);
