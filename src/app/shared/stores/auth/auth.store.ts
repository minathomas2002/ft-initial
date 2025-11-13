import { computed, inject } from "@angular/core";
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from "@ngrx/signals";
import { type Observable, type Subscription, finalize, tap, timer } from "rxjs";
import { IUser, IAuthResponse } from "../../interfaces";
import { AuthApiService } from "../../api/auth/auth-api-service";

const AUTH_STORAGE_KEY = 'auth_data';

const initialState: {
  user: IUser | null;
  loading: boolean;
  _inactivityTimeout$: Subscription | null;
} = {
  user: null,
  loading: false,
  _inactivityTimeout$: null,
};

export const AuthStore = signalStore(
  { providedIn: "root" },
  withState(initialState),
  withComputed((store) => {
    return {
      isAuthenticated: computed(() => store.user() !== null),
    };
  }),
  withMethods((store) => {
    const authApiService = inject(AuthApiService);

    const saveAuthDataToStorage = (authResponse: IAuthResponse): void => {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authResponse.data));
      }
    };

    return {
      logout(): void {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
        authApiService.logout();
      },

      login(email: string, password: string): Observable<IAuthResponse> {
        patchState(store, { loading: true });
        return authApiService.login(email, password).pipe(
          tap((response: IAuthResponse) => {
            if (response.succeeded && response.data) {
              saveAuthDataToStorage(response);
            }
          }),
          finalize(() => {
            patchState(store, { loading: false });
          })
        );
      },

      getAuthDataFromStorage() {
        if (typeof window !== 'undefined' && window.localStorage) {
          const stored = localStorage.getItem(AUTH_STORAGE_KEY);
          return stored ? JSON.parse(stored) : null;
        }
        return null;
      },

      updateAuthDataInStorage(authResponse: IAuthResponse): void {
        saveAuthDataToStorage(authResponse);
      },
    };
  }),
);
