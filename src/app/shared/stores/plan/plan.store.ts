import { inject } from "@angular/core";
import { OpportunitiesApiService } from "../../api/opportunities/opportunities-api-service";
import { EExperienceRange, EInHouseProcuredType, ELocalizationStatusType, EOpportunityType, EProductManufacturingExperience, ETargetedCustomer } from "../../enums";
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { PlanApiService } from "../../api/plans/plan-api-service";
import { IActiveEmployee, IAssignActiveEmployee, IAssignReassignActiveEmployee, IAssignRequest, IBaseApiResponse, IOpportunity, IOpportunityDetails, IPlanRecord, IPlansDashboardStatistics, ISelectItem } from "../../interfaces";
import { IProductPlanResponse } from "../../interfaces/plans.interface";
import { catchError, finalize, Observable, of, tap, throwError } from "rxjs";

const initialState: {
  newPlanOpportunityType: EOpportunityType | null,
  appliedOpportunity: IOpportunity | null,
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
  activeEmployees: IAssignActiveEmployee[] | null;
  currentEmployee: IAssignActiveEmployee | null;
  isLoading: boolean;
  isProcessing: boolean;
  wizardMode: 'create' | 'edit' | 'view';
  selectedPlanId: string | null;

} = {
  newPlanOpportunityType: null,
  appliedOpportunity: null,
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
  currentEmployee: null,
  isLoading: false,
  isProcessing: false,
  wizardMode: 'create',
  selectedPlanId: null

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
      },
      setAppliedOpportunity(opportunity: IOpportunity): void {
        patchState(store, { appliedOpportunity: opportunity });
      },
      resetAppliedOpportunity(): void {
        patchState(store, { appliedOpportunity: null });
      },
      setAvailableOpportunities(opportunity: ISelectItem): void {
        patchState(store, { availableOpportunities: [opportunity] });
      },
      setWizardMode(mode: 'create' | 'edit' | 'view'): void {
        patchState(store, { wizardMode: mode });
      },
      setSelectedPlanId(planId: string | null): void {
        patchState(store, { selectedPlanId: planId });
      },
      resetWizardState(): void {
        patchState(store, { wizardMode: 'create', selectedPlanId: null });
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

      /**
       * Get opportunity details by ID and update availableOpportunities
       * Used in edit mode to populate the opportunity dropdown with the existing opportunity
       */
      getOpportunityDetailsAndUpdateOptions(opportunityId: string): Observable<IBaseApiResponse<IOpportunityDetails>> {
        patchState(store, { isLoadingAvailableOpportunities: true });
        return opportunitiesApiService.getOpportunityById(opportunityId)
          .pipe(
            finalize(() => patchState(store, { isLoadingAvailableOpportunities: false })),
            tap((response) => {
              if (response.body) {
                // Convert IOpportunityDetails to ISelectItem format
                const opportunityItem: ISelectItem = {
                  id: response.body.id,
                  name: response.body.title
                };
                // Update availableOpportunities with the single opportunity
                patchState(store, { availableOpportunities: [opportunityItem] });
              }
            }),
            catchError((error) => {
              patchState(store, { error: error.errorMessage || 'Error loading opportunity details' });
              return throwError(() => new Error('Error loading opportunity details'));
            })
          )
      },

      /* Get Active Employees  For plans*/
      getActiveEmployeesForPlans(planId: string) {
        patchState(store, { isLoading: true, error: null });
        return planApiService.getActiveEmployeesForPlans(planId).pipe(
          tap((res) => {
            patchState(store, { isLoading: false });
            patchState(store, { activeEmployees: res.body.activeEmployees || [] });
            patchState(store, { currentEmployee: res.body.currentEmployee || null });
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

      /* Submit Product Localization Plan*/
      submitProductLocalizationPlan(request: FormData) {
        patchState(store, { isProcessing: true, error: null });
        return planApiService.submitProductLocalizationPlan(request).pipe(
          tap((res) => {
            patchState(store, { isProcessing: false });
          }),
          catchError((error) => {
            patchState(store, { error: error.errorMessage || 'Error submitting product localization plan' });
            return throwError(() => new Error('Error submitting product localization plan'));
          }),
          finalize(() => {
            patchState(store, { isProcessing: false });
          }),
        );
      },

      /* Get Product Plan*/
      getProductPlan(planId: string): Observable<IBaseApiResponse<IProductPlanResponse>> {
        patchState(store, { isLoading: true, error: null });
        return planApiService.getProductPlan({ planId }).pipe(
          catchError((error) => {
            patchState(store, { error: error.errorMessage || 'Error loading product plan' });
            return throwError(() => new Error('Error loading product plan'));
          }),
          finalize(() => {
            patchState(store, { isLoading: false });
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