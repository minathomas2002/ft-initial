import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { IRole } from '../../interfaces';
import { RolesApiService } from '../../api/roles/roles-api-service';
import { inject } from '@angular/core';
import { catchError, finalize, tap, throwError } from 'rxjs';

const initialState: {
  loading: boolean;
  error: string | null;
  list: IRole[];
} = {
  loading: false,
  error: null,
  list: [],
};

export const RolesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => {
    return {};
  }),
  withMethods((store) => {
    const rolesApiService = inject(RolesApiService);

    return {
      getUserRoles() { //without investor role
        patchState(store, { loading: true, error: null });
        return rolesApiService.getRoles().pipe(
          tap((res) => {
            patchState(store, { list: res.body || [] });
          }),
          catchError((error) => {
            patchState(store, { error: error.errorMessage || 'Error fetching roles' });
            return throwError(() => new Error('Error fetching roles'));
          }),
          finalize(() => {
            patchState(store, { loading: false });
          }),
        );
      },
    };
  }),
);

