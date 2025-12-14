import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { IRole } from '../../interfaces';
import { RolesApiService } from '../../api/roles/roles-api-service';
import { inject } from '@angular/core';
import { catchError, finalize, map, tap, throwError } from 'rxjs';
import { I18nService } from '../../services/i18n';

const initialState: {
  loading: boolean;
  error: string | null;
  allRoles: IRole[];
  systemRoles: IRole[];
  filteredRoles: IRole[];
} = {
  loading: false,
  error: null,
  allRoles: [],
  systemRoles: [],
  filteredRoles: []
};

export const RolesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const rolesApiService = inject(RolesApiService);
    const i18nService = inject(I18nService);
    return {
      getSystemRoles() {
        patchState(store, { loading: true, error: null });
        return rolesApiService.getSystemRoles().pipe(
          map((res) => {
            const currentLang = i18nService.currentLanguage();
            const body = res.body?.map((role) => ({
              ...role,
              name: currentLang === 'ar' ? role.nameAr : role.name,
            }));
            res.body = body;
            return res;
          }),
          tap((res) => {
            patchState(store, { systemRoles: res.body || [] });
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
      getFilteredRoles(employeeId: string) {
        patchState(store, { loading: true, error: null });
        return rolesApiService.getFilteredRoles(employeeId).pipe(
          map((res) => {
            const currentLang = i18nService.currentLanguage();
            const body = res.body?.map((role) => ({
              ...role,
              name: currentLang === 'ar' ? role.nameAr : role.name,
            }));
            res.body = body;
            return res;
          }),
          tap((res) => {
            patchState(store, { filteredRoles: res.body || [] });
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
      getAllRoles() {
        patchState(store, { loading: true, error: null });
        return rolesApiService.getAllRoles().pipe(
          map((res) => {
            const currentLang = i18nService.currentLanguage();
            const body = res.body?.map((role) => ({
              ...role,
              name: currentLang === 'ar' ? role.nameAr : role.name,
            }));
            res.body = body;
            return res;
          }),
          tap((res) => {
            patchState(store, { allRoles: res.body || [] });
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
  withMethods((store) => {
    return {
      resetSystemRoles() {
        patchState(store, { systemRoles: [] });
      },
      resetFilteredRoles() {
        patchState(store, { filteredRoles: [] });
      },
      resetAllRoles() {
        patchState(store, { allRoles: [] });
      },
    }
  }),
  withMethods((store) => {
    return {
      addRoleToFilteredRoles(role: IRole) {
        patchState(store, { filteredRoles: [...store.filteredRoles(), role] });
      },
    }
  })
);

