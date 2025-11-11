import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { catchError, finalize, tap, throwError } from 'rxjs';
import { OpportunitiesApiService } from '../../api/opportunities/opportunities-api-service';
import { IOpportunitiesFilterRequest, IOpportunityRecord } from '../../interfaces/opportunities.interface';

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

    return {
      getOpportunities(filter: IOpportunitiesFilterRequest) {
        patchState(store, { loading: true });
        return opportunitiesApiService.getOpportunities(filter).pipe(
          tap((res) => {
            patchState(store, { list: res.data, count: res.data.length });
          }),
          catchError((error) => {
            patchState(store, { error: error.errorMessage });
            return throwError(() => new Error('error fetching data'));
          }),
          finalize(() => {
            patchState(store, { loading: false });
          })
        );
      },
    };
  })
);
