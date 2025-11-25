import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { finalize, tap } from 'rxjs';
import { OpportunitiesApiService } from '../../api/opportunities/opportunities-api-service';
import { IOpportunitiesFilterRequest, IOpportunity } from '../../interfaces/opportunities.interface';
import { IOpportunityDraftRequest, ISelectItem } from '../../interfaces';

const initialState: {
  isLoading: boolean;
  isProcessing: boolean;
  error: string | null;
  count: number;
  list: IOpportunity[];
  opportunityTypes: ISelectItem[];
  opportunityCategories: ISelectItem[];
} = {
  isLoading: false,
  isProcessing: false,
  error: null,
  count: 0,
  list: [],
  opportunityTypes: [{
    id: '1',
    name: 'Service',
  },
  {
    id: '2',
    name: 'Product',
  }],
  opportunityCategories: [{
    id: '1',
    name: 'Category 1',
  },
  {
    id: '2',
    name: 'Category 2',
  }],
};
export const AdminOpportunitiesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const opportunitiesApiService = inject(OpportunitiesApiService);
    return {
      getOpportunities(filter: IOpportunitiesFilterRequest) {
        patchState(store, { isLoading: true });
        return opportunitiesApiService.getOpportunities(filter).pipe(
          tap((res) => {
            const opportunities = res.body.data || [];
            const totalCount = res.body.pagination?.totalCount ?? 0;
            patchState(store, { list: opportunities, count: totalCount });
          }),
          finalize(() => {
            patchState(store, { isLoading: false });
          })
        )
      },

      draftOpportunity(opportunity: FormData) {
        patchState(store, { isProcessing: true });
        return opportunitiesApiService.draftOpportunity(opportunity).pipe(
          finalize(() => {
            patchState(store, { isProcessing: false, error: null });
          })
        )
      },

      createOpportunity(opportunity: FormData) {
        patchState(store, { isProcessing: true });
        return opportunitiesApiService.createOpportunity(opportunity).pipe(
          finalize(() => {
            patchState(store, { isProcessing: false, error: null });
          })
        )
      }
    };
  })
);
