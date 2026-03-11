import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { finalize, tap } from 'rxjs';
import { OpportunitiesApiService } from '../../api/opportunities/opportunities-api-service';
import { ISelectItem, IAdminOpportunitiesFilterRequest, IAdminOpportunity } from '../../interfaces';
import { EOpportunityStatus, EOpportunityType, EOpportunityState, EOpportunityQuantity } from '../../enums/opportunities.enum';
import { EViewMode } from '../../enums';

const initialState: {
  isLoading: boolean;
  isProcessing: boolean;
  isSavingAsDraft: boolean;
  error: string | null;
  count: number;
  list: IAdminOpportunity[];
  opportunityTypes: ISelectItem[];
  opportunityCategories: ISelectItem[];
  opportunityUnits: ISelectItem[];
  statusOptions: ISelectItem[];
  opportunityTypeOptions: ISelectItem[];
  stateOptions: ISelectItem[];
  counts: {
    totalOpportunities: number;
    activePublishedOpportunities: number;
    inactiveOpportunities: number;
    draftOpportunities: number;
  };
  viewMode: EViewMode;
  selectedOpportunityId: string | null;
} = {
  isLoading: false,
  isProcessing: false,
  isSavingAsDraft: false,
  error: null,
  count: 0,
  list: [],
  opportunityTypes: [{
    id: EOpportunityType.SERVICES.toString(),
    name: 'opportunity.type.service',
  },
  {
    id: EOpportunityType.PRODUCT.toString(),
    name: 'opportunity.type.product',
  }],
  opportunityUnits:[
    {
      id: EOpportunityQuantity.KM.toString(),
      name:'opportunity.units.km'
    },
     {
      id: EOpportunityQuantity.Panels.toString(),
      name:'opportunity.units.panels'
    },
     {
      id: EOpportunityQuantity.CB.toString(),
      name:'opportunity.units.cb'
    },
     {
      id: EOpportunityQuantity.Discs.toString(),
      name:'opportunity.units.discs'
    },
     {
      id: EOpportunityQuantity.KTons.toString(),
      name:'opportunity.units.ktons'
    },
    {
      id: EOpportunityQuantity.Unit.toString(),
      name:'opportunity.units.unit'
    },
  ],
  opportunityCategories: [
    {
      id: '1',
      name: 'opportunity.form.categoryBellIcon',
      icon: 'icon-bell'
    },
    {
      id: '2',
      name: 'opportunity.form.categoryIdeaIcon',
      icon: 'icon-idea'
    },
    {
      id: '3',
      name: 'opportunity.form.categoryDataIcon',
      icon: 'icon-data'
    }
  ],
  statusOptions: [
    { id: EOpportunityStatus.PUBLISHED.toString(), name: 'opportunity.status.published' },
    { id: EOpportunityStatus.DRAFT.toString(), name: 'opportunity.status.draft' },
  ],
  opportunityTypeOptions: [
    { id: EOpportunityType.SERVICES.toString(), name: 'opportunity.type.service' },
    { id: EOpportunityType.PRODUCT.toString(), name: 'opportunity.type.product' },
  ],
  stateOptions: [
    { id: EOpportunityState.ACTIVE.toString(), name: 'opportunity.state.active' },
    { id: EOpportunityState.INACTIVE.toString(), name: 'opportunity.state.inactive' },
  ],
  counts: {
    totalOpportunities: 0,
    activePublishedOpportunities: 0,
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
              activePublishedOpportunities: 0,
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
        patchState(store, { isSavingAsDraft: true });
        return opportunitiesApiService.draftOpportunity(opportunity).pipe(
          finalize(() => {
            patchState(store, { isSavingAsDraft: false, error: null });
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

      updateOpportunity(opportunity: FormData) {
        patchState(store, { isProcessing: true });
        return opportunitiesApiService.updateOpportunity(opportunity).pipe(
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
      },

      getIconByOpportunityCategory(categoryId: string) {
        return store.opportunityCategories().find((category) => category.id === categoryId)?.icon ?? '';
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
