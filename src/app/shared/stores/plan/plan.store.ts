import { inject } from "@angular/core";
import { OpportunitiesApiService } from "../../api/opportunities/opportunities-api-service";
import { EExperienceRange, EInHouseProcuredType, ELocalizationStatusType, EOpportunityType, EProductManufacturingExperience, ETargetedCustomer } from "../../enums";
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
  productManufacturingExperienceOptions: ISelectItem[],
  inHouseProcuredOptions: ISelectItem[],
  localizationStatusOptions: ISelectItem[]

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
    { id: EExperienceRange.Years_5.toString(), name: '5 Years' },
    { id: EExperienceRange.Years_5_10.toString(), name: '5 - 10 Years' },
    { id: EExperienceRange.Years_10.toString(), name: '10 Years' }
  ],
  inHouseProcuredOptions: [
    { id: EInHouseProcuredType.InHouse.toString(), name: 'In-house' },
    { id: EInHouseProcuredType.Procured.toString(), name: 'Procured' }
  ],
  localizationStatusOptions: [
    { id: ELocalizationStatusType.Yes.toString(), name: 'Yes' },
    { id: ELocalizationStatusType.No.toString(), name: 'No' },
    { id: ELocalizationStatusType.Partial.toString(), name: 'Partial' }
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