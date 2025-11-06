import { patchState, signalStore, withComputed, withMethods, withState } from "@ngrx/signals";
import { ISelectItem, IUser } from "../../interfaces";
import { UsersApiService } from "../../api/users/users-api-service";
import { inject } from "@angular/core";
import { catchError, finalize, tap, throwError } from "rxjs";
import { ToasterService } from "../../services/toaster/toaster.service";


const initialState: {
  userTitles: ISelectItem[],
  isLoading: boolean;
} = {
  userTitles: [],
  isLoading: false,
}
export const UsersLookupsStore = signalStore(
  { providedIn: "root" },
  withState(initialState),
  withMethods((store) => {
    const usersApiService = inject(UsersApiService);
    const toaster = inject(ToasterService);


    return {
      getUserTitles() {
        patchState(store, { isLoading: true });
        return usersApiService.getUserTitles().pipe(
          tap((res) => {
            console.log(res.data);
            patchState(store, {
              userTitles: res.data,
            });
          }),
          catchError((error) => {
            toaster.error("failed to fetch user titles.");
            patchState(store, {
              userTitles: [],
            });
            return throwError(() => new Error("error fetching data"));
          }),
          finalize(() => patchState(store, { isLoading: false })),
        );
      }
    }
  }),
);
