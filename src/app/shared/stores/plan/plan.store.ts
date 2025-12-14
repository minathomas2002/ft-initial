import { inject } from "@angular/core";
import { OpportunitiesApiService } from "../../api/opportunities/opportunities-api-service";
import { EOpportunityType, EProductManufacturingExperience, ETargetedCustomer } from "../../enums";
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { IBaseApiResponse, IPlanFilterRequest, IPlanRecord, IPlansDashboardStatistics, ISelectItem } from "../../interfaces";
import { finalize, Observable, of, take, tap } from "rxjs";
import { DashboardPlansApiService } from "../../api/dashboard-plans/dashboard-plans-api-service";

const initialState: {
  newPlanOpportunityType: EOpportunityType | null,
  isPresetSelected: boolean,
  newPlanTitle: string,
  availableOpportunities: ISelectItem[],
  isLoadingAvailableOpportunities: boolean,
  loading: boolean,
  error: string | null,
  count: number,
  list: IPlanRecord[],
  statistics: IPlansDashboardStatistics | null,
  targetedCustomerOptions: ISelectItem[],
  productManufacturingExperienceOptions: ISelectItem[]

} = {
  newPlanOpportunityType: null,
  isPresetSelected: false,
  newPlanTitle: '',
  availableOpportunities: [],
  isLoadingAvailableOpportunities: false,
  loading: false,
  error: null,
  count: 0,
  list: [],
  statistics: null,
  targetedCustomerOptions: [
    { id: ETargetedCustomer.SEC.toString(), name: 'SEC' },
    { id: ETargetedCustomer.SEC_APPROVED_LOCAL_SUPPLIERS.toString(), name: 'SEC\'s approved local suppliers' }
  ],
  productManufacturingExperienceOptions: [
    { id: EProductManufacturingExperience.YES.toString(), name: 'Yes' },
    { id: EProductManufacturingExperience.NO.toString(), name: 'No' }
  ]
}

export const PlanStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    return {
      setNewPlanOpportunityType(opportunityType: EOpportunityType): void {
        patchState(store, { newPlanOpportunityType: opportunityType });
      },
      resetNewPlanOpportunityType(): void {
        patchState(store, { newPlanOpportunityType: null });
      },
      setIsPresetSelected(isPresetSelected: boolean): void {
        patchState(store, { isPresetSelected });
      },
      resetIsPresetSelected(): void {
        patchState(store, { isPresetSelected: false });
      },
      setNewPlanTitle(newPlanTitle: string): void {
        patchState(store, { newPlanTitle });
      },
      resetNewPlanTitle(): void {
        patchState(store, { newPlanTitle: '' });
      }
    }
  }),
  withMethods((store) => {
    const opportunitiesApiService = inject(OpportunitiesApiService);
    return {
      getActiveOpportunityLookUps(): Observable<IBaseApiResponse<ISelectItem[]>> {
        if (!store.newPlanOpportunityType()) return of({} as IBaseApiResponse<ISelectItem[]>);
        patchState(store, { isLoadingAvailableOpportunities: true });
        return opportunitiesApiService.getActiveOpportunityLookUps(store.newPlanOpportunityType()!)
          .pipe(
            finalize(() => patchState(store, { isLoadingAvailableOpportunities: false })),
            tap((response) => patchState(store, { availableOpportunities: response.body }))
          )
      }
    }
  }),
  withMethods((store) => {
    return {
      savePlanBasicData(opportunityType: EOpportunityType, title: string): void {
        store.setNewPlanOpportunityType(opportunityType);
        store.setNewPlanTitle(title);
      }
    }
  })
)