import { patchState, signalStore, withComputed, withMethods, withState } from "@ngrx/signals";
import { ISelectItem, IUser } from "../../interfaces";
import { UsersApiService } from "../../api/users/users-api-service";
import { inject } from "@angular/core";
import { catchError, finalize, tap, throwError } from "rxjs";
import { ToasterService } from "../../services/toaster/toaster.service";


const initialState: {
  isLoading: boolean;
} = {
  isLoading: false,
}
export const UsersLookupsStore = signalStore(
  { providedIn: "root" },
  withState(initialState),
  withMethods((store) => {
    const usersApiService = inject(UsersApiService);
    const toaster = inject(ToasterService);


    return {
      
    }
  }),
);
