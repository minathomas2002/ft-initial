import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { finalize, tap } from 'rxjs';
import { OpportunitiesApiService } from '../../api/opportunities/opportunities-api-service';
import { IOpportunitiesFilterRequest, IOpportunity, IOpportunityDetails } from '../../interfaces/opportunities.interface';

const initialState: {
  loading: boolean;
  error: string | null;
  count: number;
  list: IOpportunity[];
  details: IOpportunityDetails | null;
} = {
  loading: false,
  error: null,
  count: 0,
  list: [],
  details: null
};
export const OpportunitiesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => {
    return {
      linkedPlans: computed(() => store.details()?.linkedPlans ?? 0),
    };
  }),
  withMethods((store) => {
    const opportunitiesApiService = inject(OpportunitiesApiService);
    return {
      getOpportunities(filter: IOpportunitiesFilterRequest) {
        patchState(store, { loading: true });
        return opportunitiesApiService.getOpportunities(filter).pipe(
          tap((res) => {
            const opportunities = res.body.data || [];
            const totalCount = res.body.pagination?.totalCount ?? 0;
            patchState(store, { list: opportunities, count: totalCount });
          }),
          finalize(() => {
            patchState(store, { loading: false });
          })
        )
      },
      getOpportunityDetails(id: string) {
        patchState(store, { loading: true, error: null });
        return opportunitiesApiService.getOpportunityById(id).pipe(
          tap((res) => {
            patchState(store, { details: res.body });
          }),
          finalize(() => {
            patchState(store, { loading: false });
          })
        )
      }
    };
  })
);
