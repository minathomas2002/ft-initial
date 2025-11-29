import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { finalize, tap } from 'rxjs';
import { OpportunitiesApiService } from '../../api/opportunities/opportunities-api-service';
import { ISelectItem, IAdminOpportunitiesFilterRequest, IAdminOpportunity } from '../../interfaces';
import { EOpportunityStatus, EOpportunityType, EOpportunityState } from '../../enums/opportunities.enum';
import { EViewMode } from '../../enums';

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
  viewMode: EViewMode;
  selectedOpportunityId: string | null;
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
    { id: EOpportunityState.ACTIVE.toString(), name: 'opportunity.state.active' },
    { id: EOpportunityState.INACTIVE.toString(), name: 'opportunity.state.inactive' },
  ],
  counts: {
    totalOpportunities: 0,
    activeOpportunities: 0,
    inactiveOpportunities: 0,
    draftOpportunities: 0,
  },
  viewMode: EViewMode.Create,
  selectedOpportunityId: null,
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
      },

      deleteOpportunity(opportunityId: string) {
        patchState(store, { isProcessing: true });
        return opportunitiesApiService.deleteOpportunity(opportunityId).pipe(
          finalize(() => {
            patchState(store, { isProcessing: false, error: null });
          })
        )
      },

      moveToDraftOpportunity(opportunityId: string) {
        patchState(store, { isProcessing: true });
        return opportunitiesApiService.changeOpportunityStatus(opportunityId, EOpportunityStatus.DRAFT).pipe(
          finalize(() => {
            patchState(store, { isProcessing: false, error: null });
          })
        )
      },
      publishOpportunity(opportunityId: string) {
        patchState(store, { isProcessing: true });
        return opportunitiesApiService.changeOpportunityStatus(opportunityId, EOpportunityStatus.PUBLISHED).pipe(
          finalize(() => {
            patchState(store, { isProcessing: false, error: null });
          })
        )
      }
    }
  }),
  withMethods((store) => ({
    setViewMode(viewMode: EViewMode) {
      patchState(store, { viewMode });
    },
    setSelectedOpportunityId(opportunityId: string) {
      patchState(store, { selectedOpportunityId: opportunityId });
    }
  }))
);
