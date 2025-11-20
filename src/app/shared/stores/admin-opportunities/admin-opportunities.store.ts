import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { finalize, tap } from 'rxjs';
import { OpportunitiesApiService } from '../../api/opportunities/opportunities-api-service';
import { IOpportunitiesFilterRequest, IOpportunity } from '../../interfaces/opportunities.interface';

const initialState: {
  loading: boolean;
  error: string | null;
  count: number;
  list: IOpportunity[];
} = {
  loading: false,
  error: null,
  count: 0,
  list: [],
};
export const AdminOpportunitiesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
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
      }
    };
  })
);
