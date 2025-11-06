import { inject } from "@angular/core";
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
	isFlightHub: boolean;
	_inactivityTimeout$: Subscription | null;
} = {
	user: null,
	loading: false,
	isFlightHub: false,
	_inactivityTimeout$: null,
};

export const AuthStore = signalStore(
	{ providedIn: "root" },
	withState(initialState),
	withComputed((store) => {
		return {};
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
