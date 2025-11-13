import { computed, inject } from "@angular/core";
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from "@ngrx/signals";
import { type Observable, type Subscription, finalize, tap, timer } from "rxjs";
import { IUser } from "../../interfaces";
import { AuthApiService } from "../../api/auth/auth-api-service";

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


    return {
      logout(): void {
        authApiService.logout();
      },

      login(email: string, password: string): void {
        authApiService.login(email, password);
      },

    };
  }),
);
