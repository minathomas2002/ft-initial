import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { catchError, finalize, tap, throwError } from 'rxjs';
import { OpportunitiesApiService } from '../../api/opportunities/opportunities-api-service';
import {
  IOpportunitiesFilterRequest,
  IOpportunityRecord,
} from '../../interfaces/opportunities.interface';
import { AuthStore } from '../auth/auth.store';

const initialState: {
  loading: boolean;
  error: string | null;
  count: number;
  list: IOpportunityRecord[];
} = {
  loading: false,
  error: null,
  count: 0,
  list: [],
};
export const OpportunitiesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => {
    return {};
  }),
  withMethods((store) => {
    const opportunitiesApiService = inject(OpportunitiesApiService);
    const authStore = inject(AuthStore);

    return {
      getOpportunities(filter: IOpportunitiesFilterRequest) {
        patchState(store, { loading: true });
        return this.getOpportunitiesRequest(filter).pipe(
          tap((res) => {
            patchState(store, { list: res.body.data, count: res.body.data.length });//TODO: change to total count
          }),
          finalize(() => {
            patchState(store, { loading: false });
          })
        )
      },
      getOpportunitiesRequest(filter: IOpportunitiesFilterRequest) {
        if (authStore.isAuthenticated()) {
          return opportunitiesApiService.getAdminOpportunities(filter);
        } else {
          return opportunitiesApiService.getOpportunities(filter);
        }
      },
    };
  })
);
