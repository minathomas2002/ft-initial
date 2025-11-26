import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { finalize, tap } from 'rxjs';
import { OpportunitiesApiService } from '../../api/opportunities/opportunities-api-service';
import { IOpportunitiesFilterRequest, IOpportunity } from '../../interfaces/opportunities.interface';
import { IOpportunityDraftRequest, ISelectItem, IAdminOpportunitiesFilterRequest, IAdminOpportunity, IDashboardResponse } from '../../interfaces';
import { EOpportunityStatus, EOpportunityType, EOpportunityState } from '../../enums/opportunities.enum';

const initialState: {
  isLoading: boolean;
  isProcessing: boolean;
  error: string | null;
  count: number;
  list: IAdminOpportunity[];
  opportunityTypes: ISelectItem[];
  opportunityCategories: ISelectItem[];
  statusOptions: ISelectItem[];
  opportunityTypeOptions: ISelectItem[];
  stateOptions: ISelectItem[];
  counts: {
    totalOpportunities: number;
    activeOpportunities: number;
    inactiveOpportunities: number;
    draftOpportunities: number;
  };
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
  statusOptions: [
    { id: EOpportunityStatus.PUBLISHED.toString(), name: 'opportunity.status.published' },
    { id: EOpportunityStatus.DRAFT.toString(), name: 'opportunity.status.draft' },
  ],
  opportunityTypeOptions: [
    { id: EOpportunityType.SERVICES.toString(), name: 'opportunity.type.services' },
    { id: EOpportunityType.MATERIAL.toString(), name: 'opportunity.type.material' },
  ],
  stateOptions: [
    { id: 'true', name: 'opportunity.state.active' },
    { id: 'false', name: 'opportunity.state.inactive' },
  ],
  counts: {
    totalOpportunities: 0,
    activeOpportunities: 0,
    inactiveOpportunities: 0,
    draftOpportunities: 0,
  },
};
export const AdminOpportunitiesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const opportunitiesApiService = inject(OpportunitiesApiService);
    return {
      getAdminOpportunities(filter: IAdminOpportunitiesFilterRequest) {
        patchState(store, { isLoading: true });
        return opportunitiesApiService.getAdminOpportunities(filter).pipe(
          tap((res) => {
            const opportunities = res.body.data || [];
            const totalCount = res.body.pagination?.totalCount ?? 0;
            const counts = res.body.counts || {
              totalOpportunities: 0,
              activeOpportunities: 0,
              inactiveOpportunities: 0,
              draftOpportunities: 0,
            };
            patchState(store, { list: opportunities, count: totalCount, counts });
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
