import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { finalize, map, of, tap } from 'rxjs';
import { OpportunitiesApiService } from '../../api/opportunities/opportunities-api-service';
import { IOpportunitiesFilterRequest, IOpportunity, IOpportunityDetails, IOpportunityLocalizationTablesValidationResponse, IOpportunityLookup } from '../../interfaces/opportunities.interface';

const initialState: {
  loading: boolean;
  loadingOpportunityLocalizationTablesValidation: boolean;
  error: string | null;
  count: number;
  list: IOpportunity[];
  listLookup: IOpportunityLookup[];
  isCheckingApplyOpportunity: boolean;
  isLoadingopportunitiesList: boolean;
  details: IOpportunityDetails | null;
  selectedOpportunityQuantityUnit: IOpportunityDetails['quantityUnit'] | null;
  opportunityLocalizationTablesValidation: IOpportunityLocalizationTablesValidationResponse | null;
} = {
  loading: false,
  loadingOpportunityLocalizationTablesValidation: false,
  error: null,
  count: 0,
  list: [],
  listLookup: [],
  details: null,
  isCheckingApplyOpportunity: false,
  selectedOpportunityQuantityUnit: null,
  opportunityLocalizationTablesValidation: null,
  isLoadingopportunitiesList:false
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
      getOpportunitiesLookup(filter: IOpportunitiesFilterRequest) {
        patchState(store, { isLoadingopportunitiesList: true });
        return opportunitiesApiService.getOpportunitiesLookup(filter).pipe(
          tap((res) => {
            const opportunities = res.body.data || [];
            const totalCount = res.body.pagination?.totalCount ?? 0;
            patchState(store, { listLookup: opportunities, count: totalCount });
          }),
          finalize(() => {
            patchState(store, { isLoadingopportunitiesList: false });
          })
        )
      },
      getOpportunityDetails(id: string) {
        patchState(store, { loading: true, error: null });
        return opportunitiesApiService.getOpportunityById(id).pipe(
          tap((res) => {
            patchState(store, {
              details: res.body,
              selectedOpportunityQuantityUnit: res.body.quantityUnit ?? null,
            });
          }),
          finalize(() => {
            patchState(store, { loading: false });
          })
        )
      },
      checkApplyOpportunity(opportunityId: string) {
        patchState(store, { isCheckingApplyOpportunity: true });
        return opportunitiesApiService.checkApplyOpportunity({ opportunityId }).pipe(
          finalize(() => {
            patchState(store, { isCheckingApplyOpportunity: false });
          })
        )
      },
      getOpportunityLocalizationTablesValidation(opportunityId: string) {
        if (opportunityId === store.details()?.id && store.opportunityLocalizationTablesValidation() !== null) {
          return of(store.opportunityLocalizationTablesValidation());
        }
        patchState(store, { loadingOpportunityLocalizationTablesValidation: true, error: null });
        return opportunitiesApiService.getOpportunityLocalizationTablesValidation(opportunityId).pipe(
          tap((res) => {
            patchState(store, { opportunityLocalizationTablesValidation: res.body });
          }),
          map((res) => res.body),
          finalize(() => {
            patchState(store, { loadingOpportunityLocalizationTablesValidation: false });
          })
        )
      },
      resetOpportunityLocalizationTablesValidation() {
        patchState(store, { opportunityLocalizationTablesValidation: null });
      },
      resetSelectedOpportunityQuantityUnit() {
        patchState(store, { selectedOpportunityQuantityUnit: null });
      },
      resetSelectedOpportunityDetails() {
        patchState(store, {
          details: null,
          selectedOpportunityQuantityUnit: null,
        });
      }
    };
  })
);
