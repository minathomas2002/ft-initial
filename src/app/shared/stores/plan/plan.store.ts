import { inject } from "@angular/core";
import { OpportunitiesApiService } from "../../api/opportunities/opportunities-api-service";
import { EExperienceRange, EInHouseProcuredType, ELocalizationStatusType, EOpportunityType, EProductManufacturingExperience, ETargetedCustomer } from "../../enums";
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { PlanApiService } from "../../api/plans/plan-api-service";
import { IActiveEmployee, IAssignRequest, IBaseApiResponse, IPlanRecord, IPlansDashboardStatistics, ISelectItem } from "../../interfaces";
import { catchError, finalize, Observable, of, tap, throwError } from "rxjs";
import { IProductLocalizationPlanRequest } from "../../interfaces/plans.interface";

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
  activeEmployees: IActiveEmployee[] | null;
  isLoading: boolean;
  isProcessing: boolean;


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
  ],
  activeEmployees: null,
  isLoading: false,
  isProcessing: false

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
    const planApiService = inject(PlanApiService);
    return {
      getActiveOpportunityLookUps(): Observable<IBaseApiResponse<ISelectItem[]>> {
        if (!store.newPlanOpportunityType()) return of({} as IBaseApiResponse<ISelectItem[]>);
        patchState(store, { isLoadingAvailableOpportunities: true });
        return opportunitiesApiService.getActiveOpportunityLookUps(store.newPlanOpportunityType()!)
          .pipe(
            finalize(() => patchState(store, { isLoadingAvailableOpportunities: false })),
            tap((response) => patchState(store, { availableOpportunities: response.body }))
          )
      },

      /* Get Active Employees  For plans*/
      getActiveEmployeesForPlans(planId: string) {
        patchState(store, { isLoading: true, error: null });
        return planApiService.getActiveEmployeesForPlans(planId).pipe(
          tap((res) => {
            patchState(store, { isLoading: false });
            patchState(store, { activeEmployees: res.body || [] });
          }),
          catchError((error) => {
            patchState(store, { error: error.errorMessage || 'Error getting active employees' });
            return throwError(() => new Error('Error getting active employees'));
          }),
          finalize(() => {
            patchState(store, { isLoading: false });
          }),
        );
      },
      /* assign Employee  For plan*/
      assignEmployeeToPlan(request: IAssignRequest) {
        patchState(store, { isProcessing: true, error: null });
        return planApiService.assignEmployeeToPlan(request).pipe(
          tap((res) => {
            patchState(store, { isProcessing: false });
          }),
          catchError((error) => {
            patchState(store, { error: error.errorMessage || 'Error assigning system employee' });
            return throwError(() => new Error('Error assigning system employee'));
          }),
          finalize(() => {
            patchState(store, { isProcessing: false });
          }),
        );
      },
      /* reassign Employee  For plan*/
      reassignEmployeeToPlan(request: IAssignRequest) {
        patchState(store, { isProcessing: true, error: null });
        return planApiService.reassignEmployeeToPlan(request).pipe(
          tap((res) => {
            patchState(store, { isProcessing: false });
          }),
          catchError((error) => {
            patchState(store, { error: error.errorMessage || 'Error assigning system employee' });
            return throwError(() => new Error('Error assigning system employee'));
          }),
          finalize(() => {
            patchState(store, { isProcessing: false });
          }),
        );
      },

      /* save As Draft Product Localization Plan*/
      saveAsDraftProductLocalizationPlan(request: FormData) {
        patchState(store, { isProcessing: true, error: null });
        return planApiService.saveAsDraftProductLocalizationPlan(request).pipe(
          tap((res) => {
            patchState(store, { isProcessing: false });
          }),
          catchError((error) => {
            patchState(store, { error: error.errorMessage || 'Error saving product localization plan' });
            return throwError(() => new Error('Error saving product localization plan'));
          }),
          finalize(() => {
            patchState(store, { isProcessing: false });
          }),
        );
      },
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