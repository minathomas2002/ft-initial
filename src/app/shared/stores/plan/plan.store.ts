import { computed, inject } from "@angular/core";
import { OpportunitiesApiService } from "../../api/opportunities/opportunities-api-service";
import { AgreementType, EExperienceRange, EInHouseProcuredType, ELocalizationApproach, ELocation, ELocalizationMethodology, ELocalizationStatusType, EOpportunityType, EProductManufacturingExperience, EServiceCategory, EServiceProvidedTo, EServiceQualificationStatus, EServiceType, ETargetedCustomer, EYesNo } from "../../enums";
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { PlanApiService } from "../../api/plans/plan-api-service";
import { catchError, finalize, Observable, of, tap, throwError } from "rxjs";
import { IAssignActiveEmployee, IAssignRequest, IBaseApiResponse, IOpportunity, IOpportunityDetails, IPlanFilterRequest, IPlanRecord, IPlansDashboardStatistics, ISelectItem } from "../../interfaces";
import { IProductPlanResponse, IServiceLocalizationPlanResponse, IServicePlanGetResponse, IServicePlanResponse, ITimeLineResponse } from "../../interfaces/plans.interface";
import { downloadFileFromBlob } from "../../utils/file-download.utils";
import { I18nService } from "../../services/i18n/i18n.service";

export interface IPlanTypeDropdownOption {
  label: string;
  value: EOpportunityType | null;
}

const initialState: {
  newPlanOpportunityType: EOpportunityType | null;
  appliedOpportunity: IOpportunity | null;
  isPresetSelected: boolean;
  newPlanTitle: string;
  availableOpportunities: ISelectItem[];
  isLoadingAvailableOpportunities: boolean;
  loading: boolean;
  error: string | null;
  count: number;
  list: IPlanRecord[];
  statistics: IPlansDashboardStatistics | null;
  targetedCustomerOptions: ISelectItem[];
  productManufacturingExperienceOptions: ISelectItem[];
  inHouseProcuredOptions: ISelectItem[];
  timeLineList: ITimeLineResponse[];
  localizationStatusOptions: ISelectItem[];
  serviceTypeOptions: ISelectItem[];
  serviceProvidedToOptions: ISelectItem[];
  serviceCategoryOptions: ISelectItem[];
  companyTypeOptions: ISelectItem[];
  qualificationStatusOptions: ISelectItem[];
  localizationMethodologyOptions: ISelectItem[];
  localizationApproachOptions: ISelectItem[];
  locationOptions: ISelectItem[];
  yesNoOptions: ISelectItem[];
  agreementTypeOptions: ISelectItem[];
  activeEmployees: IAssignActiveEmployee[] | null;
  currentEmployee: IAssignActiveEmployee | null;
  isLoading: boolean;
  isProcessing: boolean;
  wizardMode: 'create' | 'edit' | 'view';
  selectedPlanId: string | null;
  planStatus: number | null;
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
  timeLineList: [],
  statistics: null,
  targetedCustomerOptions: [
    { id: ETargetedCustomer.SEC.toString(), name: 'SEC' },
    {
      id: ETargetedCustomer.SEC_APPROVED_LOCAL_SUPPLIERS.toString(),
      name: "SEC's approved local suppliers",
    },
  ],
  productManufacturingExperienceOptions: [
    { id: EExperienceRange.Years_5.toString(), name: '5 Years or less' },
    { id: EExperienceRange.Years_5_10.toString(), name: '5 - 10 Years' },
    { id: EExperienceRange.Years_10.toString(), name: '10 Years or more' }
  ],
  inHouseProcuredOptions: [
    { id: EInHouseProcuredType.InHouse.toString(), name: 'In-house' },
    { id: EInHouseProcuredType.Procured.toString(), name: 'Procured' },
  ],
  localizationStatusOptions: [
    { id: ELocalizationStatusType.Yes.toString(), name: 'Yes' },
    { id: ELocalizationStatusType.No.toString(), name: 'No' },
    { id: ELocalizationStatusType.Partial.toString(), name: 'Partial' },
  ],
  serviceTypeOptions: [
    { id: EServiceType.Technical.toString(), name: 'Technical (Core) Service' },
    {
      id: EServiceType.NonTechnical.toString(),
      name: 'Non-Technical (Non-Core / Support) Service',
    },
  ],

  serviceProvidedToOptions: [
    { id: EServiceProvidedTo.Contractors.toString(), name: 'SEC Approved Contractors' },
    { id: EServiceProvidedTo.Manufacturers.toString(), name: 'SEC Approved Manufacturers' },
    { id: EServiceProvidedTo.Others.toString(), name: 'Others' },
  ],
  serviceCategoryOptions: [
    { id: EServiceCategory.CategoryA.toString(), name: 'Category A' },
    { id: EServiceCategory.CategoryB.toString(), name: 'Category B' },
  ],
  companyTypeOptions: [
    { id: EServiceProvidedTo.Contractors.toString(), name: 'Contractor' },
    { id: EServiceProvidedTo.Manufacturers.toString(), name: 'Manufacturer' },
    { id: EServiceProvidedTo.Others.toString(), name: 'Other' },
  ],
  qualificationStatusOptions: [
    { id: EServiceQualificationStatus.Qualified.toString(), name: 'Qualified' },
    { id: EServiceQualificationStatus.UnderPreQualification.toString(), name: 'Under Pre-Qualification' },
    { id: EServiceQualificationStatus.NotQualified.toString(), name: 'Not Qualified' },
  ],
  localizationMethodologyOptions: [
    {
      id: ELocalizationMethodology.Collaboration.toString(),
      name: 'Collaboration with Existing Saudi Company',
    },
    {
      id: ELocalizationMethodology.Direct.toString(),
      name: 'Direct Localization by Foreign Entity',
    },
  ],
  localizationApproachOptions: [
    { id: ELocalizationApproach.EstablishSaudiEntity.toString(), name: 'Establish Saudi Entity' },
    { id: ELocalizationApproach.EstablishLocalBranch.toString(), name: 'Establish Local Branch of Foreign Company' },
    { id: ELocalizationApproach.Other.toString(), name: 'Other' },
  ],
  locationOptions: [
    { id: ELocation.SaudiEntity.toString(), name: 'Saudi Entity' },
    { id: ELocation.Branch.toString(), name: 'Branch' },
    { id: ELocation.Other.toString(), name: 'Other' },
  ],
  yesNoOptions: [
    { id: EYesNo.Yes.toString(), name: 'Yes' },
    { id: EYesNo.No.toString(), name: 'No' },
  ],
  agreementTypeOptions: [
    { id: AgreementType.JointVenture.toString(), name: 'Joint Venture' },
    { id: AgreementType.SpecialPurposeVehicle.toString(), name: 'Special Purpose Vehicle' },
    { id: AgreementType.TechnologyTransferAgreement.toString(), name: 'Technology Transfer Agreement' },
    { id: AgreementType.KnowledgeTransferAgreement.toString(), name: 'Knowledge Transfer Agreement' },
    { id: AgreementType.Other.toString(), name: 'Other' },
  ],
  activeEmployees: null,
  currentEmployee: null,
  isLoading: false,
  isProcessing: false,
  wizardMode: 'create',
  selectedPlanId: null,
  planStatus: null,
};

export const PlanStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => {
    const i18nService = inject(I18nService);
    return {
      planTypeOptions: computed<IPlanTypeDropdownOption[]>(() => {
        i18nService.currentLanguage();
        return [
          { label: i18nService.translate('plans.filter.allTypes'), value: null },
          {
            label: i18nService.translate('plans.filter.service'),
            value: EOpportunityType.SERVICES,
          },
          {
            label: i18nService.translate('opportunity.type.product'),
            value: EOpportunityType.PRODUCT,
          },
        ];
      }),
    };
  }),
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
      setPlanStatus(status: number | null): void {
        patchState(store, { planStatus: status });
      },
      resetWizardState(): void {
        patchState(store, { wizardMode: 'create', selectedPlanId: null, planStatus: null });
      },
    };
  }),
  withMethods((store) => {
    const opportunitiesApiService = inject(OpportunitiesApiService);
    const planApiService = inject(PlanApiService);
    return {
      getActiveOpportunityLookUps(): Observable<IBaseApiResponse<ISelectItem[]>> {
        if (!store.newPlanOpportunityType()) return of({} as IBaseApiResponse<ISelectItem[]>);
        patchState(store, { isLoadingAvailableOpportunities: true });
        return opportunitiesApiService
          .getActiveOpportunityLookUps(store.newPlanOpportunityType()!)
          .pipe(
            finalize(() => patchState(store, { isLoadingAvailableOpportunities: false })),
            tap((response) => patchState(store, { availableOpportunities: response.body }))
          );
      },

      /**
       * Get opportunity details by ID and update availableOpportunities
       * Used in edit mode to populate the opportunity dropdown with the existing opportunity
       */
      getOpportunityDetailsAndUpdateOptions(
        opportunityId: string
      ): Observable<IBaseApiResponse<IOpportunityDetails>> {
        patchState(store, { isLoadingAvailableOpportunities: true });
        return opportunitiesApiService.getOpportunityById(opportunityId).pipe(
          finalize(() => patchState(store, { isLoadingAvailableOpportunities: false })),
          tap((response) => {
            if (response.body) {
              // Convert IOpportunityDetails to ISelectItem format
              const opportunityItem: ISelectItem = {
                id: response.body.id,
                name: response.body.title,
              };
              // Update availableOpportunities with the single opportunity
              patchState(store, { availableOpportunities: [opportunityItem] });
            }
          }),
          catchError((error) => {
            patchState(store, { error: error.errorMessage || 'Error loading opportunity details' });
            return throwError(() => new Error('Error loading opportunity details'));
          })
        );
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
          })
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
          })
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
          })
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
            patchState(store, {
              error: error.errorMessage || 'Error saving product localization plan',
            });
            return throwError(() => new Error('Error saving product localization plan'));
          }),
          finalize(() => {
            patchState(store, { isProcessing: false });
          })
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
            patchState(store, {
              error: error.errorMessage || 'Error submitting product localization plan',
            });
            return throwError(() => new Error('Error submitting product localization plan'));
          }),
          finalize(() => {
            patchState(store, { isProcessing: false });
          })
        );
      },

      /* Submit Product Localization Plan*/
      submitServiceLocalizationPlan(request: FormData) {
        patchState(store, { isProcessing: true, error: null });
        return planApiService.submitServiceLocalizationPlan(request).pipe(
          tap((res) => {
            patchState(store, { isProcessing: false });
          }),
          catchError((error) => {
            patchState(store, {
              error: error.errorMessage || 'Error submitting service localization plan',
            });
            return throwError(() => new Error('Error submitting service localization plan'));
          }),
          finalize(() => {
            patchState(store, { isProcessing: false });
          })
        );
      },

      /* save As Draft Product Localization Plan*/
      saveAsDraftServiceLocalizationPlan(request: FormData) {
        patchState(store, { isProcessing: true, error: null });
        return planApiService.saveAsDraftServiceLocalizationPlan(request).pipe(
          tap(() => {
            patchState(store, { isProcessing: false });
          }),
          catchError((error) => {
            patchState(store, {
              error: error.errorMessage || 'Error saving product localization plan',
            });
            return throwError(() => new Error('Error saving product localization plan'));
          }),
          finalize(() => {
            patchState(store, { isProcessing: false });
          })
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
          })
        );
      },

      /* Get Service Plan*/
      getServicePlan(planId: string): Observable<IBaseApiResponse<IServiceLocalizationPlanResponse>> {
        patchState(store, { isLoading: true, error: null });
        return planApiService.getServicePlan({ planId }).pipe(
          catchError((error) => {
            patchState(store, { error: error.errorMessage || 'Error loading service plan' });
            return throwError(() => new Error('Error loading service plan'));
          }),
          finalize(() => {
            patchState(store, { isLoading: false });
          })
        );
      },

      /* Get timeline list*/
      getTimelinePlan(planId: string): Observable<IBaseApiResponse<ITimeLineResponse[]>> {
        patchState(store, { isLoading: true, error: null });
        return planApiService.getTimeLine({ planId }).pipe(
          tap((res) => {
            patchState(store, { isLoading: false });
            patchState(store, { timeLineList: res.body || [] });
          }),
          catchError((error) => {
            patchState(store, { error: error.errorMessage || 'Error loading timeline data' });
            return throwError(() => new Error('Error loading plan timeline'));
          }),
          finalize(() => {
            patchState(store, { isLoading: false });
          })
        );
      },
      /* Download Plan*/
      downloadPlan(planId: string): Observable<{ blob: Blob; filename: string }> {
        return planApiService.downloadPlan(planId).pipe(
          tap((res) => {
            downloadFileFromBlob(res.blob, res.filename);
          }),
          catchError((error) => {
            const errorMessage = error.message || error.error?.message || 'Error downloading plan';
            patchState(store, { error: errorMessage });
            return throwError(() => error);
          })
        );
      },
    };
  }),
  withMethods((store) => {
    return {
      savePlanBasicData(opportunityType: EOpportunityType, title: string): void {
        store.setNewPlanOpportunityType(opportunityType);
        store.setNewPlanTitle(title);
      },
    };
  }),
  withMethods((store) => {
    const planApiService = inject(PlanApiService);
    return {
      getInvestorPlans(filter: IPlanFilterRequest) {
        patchState(store, { loading: true });
        return planApiService.getInvestorPlans(filter).pipe(
          tap((res) => {
            const plans = res.body.data || [];
            const totalCount = res.body.pagination?.totalCount ?? plans.length;
            patchState(store, { list: plans, count: totalCount });
          }),
          finalize(() => {
            patchState(store, { loading: false });
          })
        );
      },
      getInternalUserPlans(filter: IPlanFilterRequest) {
        patchState(store, { loading: true });
        return planApiService.getInternalUserPlans(filter).pipe(
          tap((res) => {
            const plans = res.body.data || [];
            const totalCount = res.body.pagination?.totalCount ?? plans.length;
            patchState(store, { list: plans, count: totalCount });
          }),
          finalize(() => {
            patchState(store, { loading: false });
          })
        );
      }
    };
  })
);
