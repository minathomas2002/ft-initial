import { patchState, signalStore, withComputed, withMethods, withState } from "@ngrx/signals";
import { IUser, IUserRecord, IUsersFilterRequest } from "../../interfaces";
import { UsersApiService } from "../../api/users/users-api-service";
import { inject } from "@angular/core";
import { catchError, finalize, tap, throwError } from "rxjs";


const initialState: {
  loading: boolean;
  error: string | null;
  count: number;
  list: IUserRecord[]
} = {
  loading: false,
  error: null,
  count: 0,
  list: [],
}
export const UsersStore = signalStore(
  { providedIn: "root" },
  withState(initialState),
  withComputed((store) => {
    return {};
  }),
  withMethods((store) => {
    const usersApiService = inject(UsersApiService);


    return {
      getUsers(filter: IUsersFilterRequest) {
        patchState(store, { loading: true });
        return usersApiService.getUsers(filter).pipe(
          tap((res) => {
            patchState(store, { list: res.data, count: res.data.length });
          }),
          catchError((error) => {
            patchState(store, { error: error.errorMessage });
            return throwError(() => new Error("error fetching data"));
          }),
          finalize(() => {
            patchState(store, { loading: false });
          }),
        );
      }
    }
  }),
);
