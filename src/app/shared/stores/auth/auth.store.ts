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
		// const authService = inject(AuthService);

		// Helper to clear and restart inactivity timer

		const logout = (): void => {
			patchState(store, {
				user: null,
				loading: false,
				isFlightHub: false,
				_inactivityTimeout$: null,
			});
			// authService.logout();
		};
		return {
			logout(): void {
			},

			login(): void {
			},

		};
	}),
);
