import { computed, inject } from "@angular/core";
import { OpportunitiesApiService } from "../../api/opportunities/opportunities-api-service";
import { AgreementType, EExperienceRange, EInHouseProcuredType, ELocalizationApproach, ELocation, ELocalizationMethodology, ELocalizationStatusType, EOpportunityType, EServiceCategory, EServiceProvidedTo, EServiceQualificationStatus, EServiceType, ETargetedCustomer, EYesNo, EemployeePlanAction, ERoles, EServiceCompanyType, EPlanPageTitle, SRMApprovalStatus } from "../../enums";
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { PlanApiService } from "../../api/plans/plan-api-service";
import { catchError, finalize, map, Observable, of, tap, throwError } from "rxjs";
import { EInternalUserPlanStatus, EInvestorPlanStatus, IAssignActiveEmployee, IAssignReassignActiveEmployee, IAssignRequest, IBaseApiResponse, IOpportunity, IOpportunityDetails, IPlanFilterRequest, IPlanRecord, IPlansDashboardStatistics, ISelectItem } from "../../interfaces";
import { IProductPlanResponse, IServiceLocalizationPlanResponse, ITimeLineResponse, ReviewPlanRequest, IPlanCommentResponse } from "../../interfaces/plans.interface";
import { downloadFileFromBlob } from "../../utils/file-download.utils";
import { I18nService } from "../../services/i18n/i18n.service";
import { RoleService } from "../../services/role/role-service";

export interface IPlanTypeDropdownOption {
  label: string;
  value: EOpportunityType | null;
}

export type TWizardMode = 'create' | 'edit' | 'view' | 'Review' | 'resubmit';
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
  wizardMode: TWizardMode;
  selectedPlanId: string | null;
  planStatus: EInternalUserPlanStatus | EInvestorPlanStatus | null;
  planComments: IPlanCommentResponse | null;
  /**
   * Snapshot of plan comments when entering resubmit mode.
   * Used for: (1) restoring comments when investor deletes, (2) collecting fields from original in collectInvestorPageComments.
   */
  originalPlanComments: IPlanCommentResponse | null;
  currentUserPageComments: EPlanPageTitle[];
  productPlanData: IProductPlanResponse | null;
  servicePlanData: IServiceLocalizationPlanResponse | null;
  actionNote: string | null;
  acknowledgeRejectionNote: string | null;
  linkedToDeletedOpportunity: boolean;
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
  currentUserPageComments: [],
  targetedCustomerOptions: [
    { id: ETargetedCustomer.SEC.toString(), name: 'SEC' },
    {
      id: ETargetedCustomer.SEC_APPROVED_LOCAL_SUPPLIERS.toString(),
      name: "SEC's approved local suppliers",
    },
  ],
  productManufacturingExperienceOptions: [
    { id: EExperienceRange.Years_5.toString(), name: 'Less than 5 years' },
    { id: EExperienceRange.Years_5_10.toString(), name: '5 to 10 years' },
    { id: EExperienceRange.Years_10.toString(), name: 'More than 10 years' }
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
    { id: EServiceProvidedTo.SEC.toString(), name: 'SEC' },
    { id: EServiceProvidedTo.Contractors.toString(), name: 'SEC Approved Contractors' },
    { id: EServiceProvidedTo.Manufacturers.toString(), name: 'SEC Approved Manufacturers' },
    { id: EServiceProvidedTo.Others.toString(), name: 'Others' },
  ],
  serviceCategoryOptions: [
    { id: EServiceCategory.General.toString(), name: 'General' },
    { id: EServiceCategory.Construction.toString(), name: 'Construction' },
    { id: EServiceCategory.Installation.toString(), name: 'Installation' },
    { id: EServiceCategory.CommissioningAndTesting.toString(), name: 'Commissioning and Testing' },
    { id: EServiceCategory.ProjectCloseout.toString(), name: 'Project Closeout' },
  ],
  companyTypeOptions: [
    { id: EServiceCompanyType.Contractors.toString(), name: 'Contractor' },
    { id: EServiceCompanyType.Manufacturers.toString(), name: 'Manufacturer' },
    { id: EServiceCompanyType.Others.toString(), name: 'Other' },
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
  planComments: null,
  originalPlanComments: null,
  productPlanData: null,
  servicePlanData: null,
  actionNote: null,
  acknowledgeRejectionNote: null,
  linkedToDeletedOpportunity: false
};

export const PlanStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => {
    const i18nService = inject(I18nService);
    const roleService = inject(RoleService);

    return {
      isFinalStatus: computed(() =>
        roleService.hasAnyRoleSignal([ERoles.INVESTOR])() ?
          [EInvestorPlanStatus.REJECTED].includes(store.planStatus() as EInvestorPlanStatus) :
          [
            EInternalUserPlanStatus.DEPT_REJECTED,
            EInternalUserPlanStatus.DEPT_APPROVED,
            EInternalUserPlanStatus.DV_REJECTION_ACKNOWLEDGED,
            EInternalUserPlanStatus.DEPT_REJECTED,
            EInternalUserPlanStatus.DV_REJECTED,
          ].includes(store.planStatus() as EInternalUserPlanStatus)),

      planTypeOptions: computed<IPlanTypeDropdownOption[]>(() => {
        i18nService.currentLanguage();
        return [
          // { label: i18nService.translate('plans.filter.allTypes'), value: null },
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
      productManufacturingExperienceOptionsTranslated: computed<ISelectItem[]>(() => {
        i18nService.currentLanguage();
        const opts = store.productManufacturingExperienceOptions();
        const keyMap: Record<string, string> = {
          [EExperienceRange.Years_5.toString()]: 'plans.form.experienceLessThan5',
          [EExperienceRange.Years_5_10.toString()]: 'plans.form.experience5To10',
          [EExperienceRange.Years_10.toString()]: 'plans.form.experienceMoreThan10',
        };
        return opts.map((o) => ({ id: o.id, name: i18nService.translate(keyMap[o.id] ?? o.name) }));
      }),
      yesNoOptionsTranslated: computed<ISelectItem[]>(() => {
        i18nService.currentLanguage();
        const opts = store.yesNoOptions();
        return opts.map((o) => ({
          id: o.id,
          name: o.id === EYesNo.Yes.toString() ? i18nService.translate('common.yes') : i18nService.translate('common.no'),
        }));
      }),
      targetedCustomerOptionsTranslated: computed<ISelectItem[]>(() => {
        i18nService.currentLanguage();
        const opts = store.targetedCustomerOptions();
        const keyMap: Record<string, string> = {
          [ETargetedCustomer.SEC.toString()]: 'plans.options.targetedCustomerSec',
          [ETargetedCustomer.SEC_APPROVED_LOCAL_SUPPLIERS.toString()]: 'plans.options.targetedCustomerSecApprovedLocalSuppliers',
        };
        return opts.map((o) => ({ id: o.id, name: i18nService.translate(keyMap[o.id] ?? o.name) }));
      }),
      inHouseProcuredOptionsTranslated: computed<ISelectItem[]>(() => {
        i18nService.currentLanguage();
        const opts = store.inHouseProcuredOptions();
        const keyMap: Record<string, string> = {
          [EInHouseProcuredType.InHouse.toString()]: 'plans.options.inHouse',
          [EInHouseProcuredType.Procured.toString()]: 'plans.options.procured',
        };
        return opts.map((o) => ({ id: o.id, name: i18nService.translate(keyMap[o.id] ?? o.name) }));
      }),
      localizationStatusOptionsTranslated: computed<ISelectItem[]>(() => {
        i18nService.currentLanguage();
        const opts = store.localizationStatusOptions();
        const keyMap: Record<string, string> = {
          [ELocalizationStatusType.Yes.toString()]: 'plans.options.localizationStatusYes',
          [ELocalizationStatusType.No.toString()]: 'plans.options.localizationStatusNo',
          [ELocalizationStatusType.Partial.toString()]: 'plans.options.localizationStatusPartial',
        };
        return opts.map((o) => ({ id: o.id, name: i18nService.translate(keyMap[o.id] ?? o.name) }));
      }),
      serviceTypeOptionsTranslated: computed<ISelectItem[]>(() => {
        i18nService.currentLanguage();
        const opts = store.serviceTypeOptions();
        const keyMap: Record<string, string> = {
          [EServiceType.Technical.toString()]: 'plans.options.serviceTypeTechnical',
          [EServiceType.NonTechnical.toString()]: 'plans.options.serviceTypeNonTechnical',
        };
        return opts.map((o) => ({ id: o.id, name: i18nService.translate(keyMap[o.id] ?? o.name) }));
      }),
      serviceProvidedToOptionsTranslated: computed<ISelectItem[]>(() => {
        i18nService.currentLanguage();
        const opts = store.serviceProvidedToOptions();
        const keyMap: Record<string, string> = {
          [EServiceProvidedTo.SEC.toString()]: 'plans.options.serviceProvidedToSec',
          [EServiceProvidedTo.Contractors.toString()]: 'plans.options.serviceProvidedToContractors',
          [EServiceProvidedTo.Manufacturers.toString()]: 'plans.options.serviceProvidedToManufacturers',
          [EServiceProvidedTo.Others.toString()]: 'plans.options.serviceProvidedToOthers',
        };
        return opts.map((o) => ({ id: o.id, name: i18nService.translate(keyMap[o.id] ?? o.name) }));
      }),
      serviceCategoryOptionsTranslated: computed<ISelectItem[]>(() => {
        i18nService.currentLanguage();
        const opts = store.serviceCategoryOptions();
        const keyMap: Record<string, string> = {
          [EServiceCategory.General.toString()]: 'plans.options.serviceCategoryGeneral',
          [EServiceCategory.Construction.toString()]: 'plans.options.serviceCategoryConstruction',
          [EServiceCategory.Installation.toString()]: 'plans.options.serviceCategoryInstallation',
          [EServiceCategory.CommissioningAndTesting.toString()]: 'plans.options.serviceCategoryCommissioningAndTesting',
          [EServiceCategory.ProjectCloseout.toString()]: 'plans.options.serviceCategoryProjectCloseout',
        };
        return opts.map((o) => ({ id: o.id, name: i18nService.translate(keyMap[o.id] ?? o.name) }));
      }),
      companyTypeOptionsTranslated: computed<ISelectItem[]>(() => {
        i18nService.currentLanguage();
        const opts = store.companyTypeOptions();
        const keyMap: Record<string, string> = {
          [EServiceCompanyType.Contractors.toString()]: 'plans.options.companyTypeContractor',
          [EServiceCompanyType.Manufacturers.toString()]: 'plans.options.companyTypeManufacturer',
          [EServiceCompanyType.Others.toString()]: 'plans.options.companyTypeOther',
        };
        return opts.map((o) => ({ id: o.id, name: i18nService.translate(keyMap[o.id] ?? o.name) }));
      }),
      qualificationStatusOptionsTranslated: computed<ISelectItem[]>(() => {
        i18nService.currentLanguage();
        const opts = store.qualificationStatusOptions();
        const keyMap: Record<string, string> = {
          [EServiceQualificationStatus.Qualified.toString()]: 'plans.options.qualificationStatusQualified',
          [EServiceQualificationStatus.UnderPreQualification.toString()]: 'plans.options.qualificationStatusUnderPreQualification',
          [EServiceQualificationStatus.NotQualified.toString()]: 'plans.options.qualificationStatusNotQualified',
        };
        return opts.map((o) => ({ id: o.id, name: i18nService.translate(keyMap[o.id] ?? o.name) }));
      }),
      localizationMethodologyOptionsTranslated: computed<ISelectItem[]>(() => {
        i18nService.currentLanguage();
        const opts = store.localizationMethodologyOptions();
        const keyMap: Record<string, string> = {
          [ELocalizationMethodology.Collaboration.toString()]: 'plans.options.localizationMethodologyCollaboration',
          [ELocalizationMethodology.Direct.toString()]: 'plans.options.localizationMethodologyDirect',
        };
        return opts.map((o) => ({ id: o.id, name: i18nService.translate(keyMap[o.id] ?? o.name) }));
      }),
      localizationApproachOptionsTranslated: computed<ISelectItem[]>(() => {
        i18nService.currentLanguage();
        const opts = store.localizationApproachOptions();
        const keyMap: Record<string, string> = {
          [ELocalizationApproach.EstablishSaudiEntity.toString()]: 'plans.options.localizationApproachEstablishSaudiEntity',
          [ELocalizationApproach.EstablishLocalBranch.toString()]: 'plans.options.localizationApproachEstablishLocalBranch',
          [ELocalizationApproach.Other.toString()]: 'plans.options.localizationApproachOther',
        };
        return opts.map((o) => ({ id: o.id, name: i18nService.translate(keyMap[o.id] ?? o.name) }));
      }),
      locationOptionsTranslated: computed<ISelectItem[]>(() => {
        i18nService.currentLanguage();
        const opts = store.locationOptions();
        const keyMap: Record<string, string> = {
          [ELocation.SaudiEntity.toString()]: 'plans.options.locationSaudiEntity',
          [ELocation.Branch.toString()]: 'plans.options.locationBranch',
          [ELocation.Other.toString()]: 'plans.options.locationOther',
        };
        return opts.map((o) => ({ id: o.id, name: i18nService.translate(keyMap[o.id] ?? o.name) }));
      }),
      agreementTypeOptionsTranslated: computed<ISelectItem[]>(() => {
        i18nService.currentLanguage();
        const opts = store.agreementTypeOptions();
        const keyMap: Record<string, string> = {
          [AgreementType.JointVenture.toString()]: 'plans.options.agreementTypeJointVenture',
          [AgreementType.SpecialPurposeVehicle.toString()]: 'plans.options.agreementTypeSpecialPurposeVehicle',
          [AgreementType.TechnologyTransferAgreement.toString()]: 'plans.options.agreementTypeTechnologyTransfer',
          [AgreementType.KnowledgeTransferAgreement.toString()]: 'plans.options.agreementTypeKnowledgeTransfer',
          [AgreementType.Other.toString()]: 'plans.options.agreementTypeOther',
        };
        return opts.map((o) => ({ id: o.id, name: i18nService.translate(keyMap[o.id] ?? o.name) }));
      }),
      commentPersona: computed<string | null>(() => {
        i18nService.currentLanguage();
        const role = store.planComments()?.creatorRole;
        if (!role) return null;

        if (roleService.hasAnyRoleSignal([role])()) {
          return i18nService.translate('plans.options.commentYourComment');
        }

        const roleMap: Record<number, string> = {
          [ERoles.ADMIN]: 'plans.options.commentAdminComment',
          [ERoles.INVESTOR]: 'plans.options.commentInvestorComment',
          [ERoles.EMPLOYEE]: 'plans.options.commentEmployeeComment',
          [ERoles.Division_MANAGER]: 'plans.options.commentDivisionManagerComment',
          [ERoles.DEPARTMENT_MANAGER]: 'plans.options.commentDepartmentManagerComment',
        };
        return i18nService.translate(roleMap[role] ?? 'plans.options.commentComment');
      }),
      /**
       * Get persona label for a specific role.
       * Use this for per-comment persona instead of the global commentPersona.
       */
      getCommentPersonaByRole: computed(() => {
        return (role: number | undefined): string => {
          i18nService.currentLanguage();
          if (!role) return i18nService.translate('plans.options.commentComment');

          if (roleService.hasAnyRoleSignal([role])()) {
            return i18nService.translate('plans.options.commentYourComment');
          }

          const roleMap: Record<number, string> = {
            [ERoles.ADMIN]: 'plans.options.commentAdminComment',
            [ERoles.INVESTOR]: 'plans.options.commentInvestorComment',
            [ERoles.EMPLOYEE]: 'plans.options.commentEmployeeComment',
            [ERoles.Division_MANAGER]: 'plans.options.commentDivisionManagerComment',
            [ERoles.DEPARTMENT_MANAGER]: 'plans.options.commentDepartmentManagerComment',
          };
          return i18nService.translate(roleMap[role] ?? 'plans.options.commentComment');
        };
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
      setWizardMode(mode: TWizardMode): void {
        patchState(store, { wizardMode: mode });
      },
      setSelectedPlanId(planId: string | null): void {
        patchState(store, { selectedPlanId: planId });
      },
      setPlanStatus(status: number | null): void {
        patchState(store, { planStatus: status });
      },
      setLinkedOpportunityWarning(linkedToDeletedOpportunity: boolean | false): void {
        patchState(store, { linkedToDeletedOpportunity });
      },
      setActionNote(actionNote: string | null): void {
        patchState(store, { actionNote });
      },
      setAcknowledgeRejectionNote(acknowledgeRejectionNote: string | null): void {
        patchState(store, { acknowledgeRejectionNote });
      },
      setPlanComments(comments: IPlanCommentResponse | null): void {
        patchState(store, { planComments: comments });
      },
      /** Store original plan comments when entering resubmit mode; used for restoration and investor collection. */
      setOriginalPlanComments(comments: IPlanCommentResponse | null): void {
        patchState(store, { originalPlanComments: comments });
      },
      /** Restore planComments from originalPlanComments (used when investor deletes a comment in resubmit). */
      restorePlanCommentsFromOriginal(): void {
        const original = store.originalPlanComments();
        if (original) {
          patchState(store, { planComments: { ...original, comments: [...original.comments] } });
        }
      },
      resetWizardState(): void {
        patchState(store, {
          wizardMode: 'create',
          selectedPlanId: null,
          planStatus: null,
          planComments: null,
          originalPlanComments: null,
          currentUserPageComments: [],
          actionNote: null,
          acknowledgeRejectionNote: null,
          linkedToDeletedOpportunity: false
        });
      },
      updateCurrentUserPageComments(newPageComments: EPlanPageTitle[]): void {
        patchState(store, { currentUserPageComments: newPageComments });
      },
    };
  }),
  withMethods((store) => {
    const opportunitiesApiService = inject(OpportunitiesApiService);
    const planApiService = inject(PlanApiService);
    const roleService = inject(RoleService);
    const i18n = inject(I18nService);
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
            patchState(store, { error: error.errorMessage || i18n.translate('plans.errors.loadOpportunityDetails') });
            return throwError(() => new Error(i18n.translate('plans.errors.loadOpportunityDetails')));
          })
        );
      },

      /* Get Active Employees  For plans*/
      getActiveEmployeesForPlans(planId: string): Observable<IBaseApiResponse<IAssignReassignActiveEmployee>> {
        patchState(store, { isLoading: true, error: null });
        return planApiService.getActiveEmployeesForPlans(planId).pipe(
          tap((res) => {
            patchState(store, { isLoading: false });
            patchState(store, { activeEmployees: res.body.activeEmployees || [] });
            patchState(store, { currentEmployee: res.body.currentEmployee || null });
          }),
          catchError((error) => {
            patchState(store, { error: error.errorMessage || i18n.translate('plans.errors.getActiveEmployees') });
            return throwError(() => new Error(i18n.translate('plans.errors.getActiveEmployees')));
          }),
          finalize(() => {
            patchState(store, { isLoading: false });
          })
        );
      },
      /* assign Employee  For plan*/
      assignEmployeeToPlan(request: IAssignRequest): Observable<IBaseApiResponse<boolean>> {
        patchState(store, { isProcessing: true, error: null });
        return planApiService.assignEmployeeToPlan(request).pipe(
          tap((res) => {
            patchState(store, { isProcessing: false });
          }),
          catchError((error) => {
            patchState(store, { error: error.errorMessage || i18n.translate('plans.errors.assignEmployee') });
            return throwError(() => new Error(i18n.translate('plans.errors.assignEmployee')));
          }),
          finalize(() => {
            patchState(store, { isProcessing: false });
          })
        );
      },
      /* reassign Employee  For plan*/
      reassignEmployeeToPlan(request: IAssignRequest): Observable<IBaseApiResponse<boolean>> {
        patchState(store, { isProcessing: true, error: null });
        return planApiService.reassignEmployeeToPlan(request).pipe(
          tap((res) => {
            patchState(store, { isProcessing: false });
          }),
          catchError((error) => {
            patchState(store, { error: error.errorMessage || i18n.translate('plans.errors.assignEmployee') });
            return throwError(() => new Error(i18n.translate('plans.errors.assignEmployee')));
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
              error: error.errorMessage || i18n.translate('plans.errors.saveProductPlan'),
            });
            return throwError(() => new Error(i18n.translate('plans.errors.saveProductPlan')));
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
              error: error.errorMessage || i18n.translate('plans.errors.submitProductPlan'),
            });
            return throwError(() => new Error(i18n.translate('plans.errors.submitProductPlan')));
          }),
          finalize(() => {
            patchState(store, { isProcessing: false });
          })
        );
      },

      /* Submit Service Localization Plan*/
      submitServiceLocalizationPlan(request: FormData) {
        patchState(store, { isProcessing: true, error: null });
        return planApiService.submitServiceLocalizationPlan(request).pipe(
          tap((res) => {
            patchState(store, { isProcessing: false });
          }),
          catchError((error) => {
            patchState(store, {
              error: error.errorMessage || i18n.translate('plans.errors.submitServicePlan'),
            });
            return throwError(() => new Error(i18n.translate('plans.errors.submitServicePlan')));
          }),
          finalize(() => {
            patchState(store, { isProcessing: false });
          })
        );
      },

      /* Investor Resubmit Product Localization Plan*/
      investorResubmitProductPlan(request: FormData) {
        patchState(store, { isProcessing: true, error: null });
        return planApiService.reSubmitProductPlan(request).pipe(
          tap((res) => {
            patchState(store, { isProcessing: false });
          }),
          catchError((error) => {
            patchState(store, {
              error: error.errorMessage || i18n.translate('plans.errors.resubmitProductPlan'),
            });
            return throwError(() => new Error(i18n.translate('plans.errors.resubmitProductPlan')));
          }),
          finalize(() => {
            patchState(store, { isProcessing: false });
          })
        );
      },

      /* Investor Resubmit Service Localization Plan*/
      investorResubmitServicePlan(request: FormData) {
        patchState(store, { isProcessing: true, error: null });
        return planApiService.reSubmitServicePlan(request).pipe(
          tap((res) => {
            patchState(store, { isProcessing: false });
          }),
          catchError((error) => {
            patchState(store, {
              error: error.errorMessage || i18n.translate('plans.errors.resubmitServicePlan'),
            });
            return throwError(() => new Error(i18n.translate('plans.errors.resubmitServicePlan')));
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
              error: error.errorMessage || i18n.translate('plans.errors.saveProductPlan'),
            });
            return throwError(() => new Error(i18n.translate('plans.errors.saveProductPlan')));
          }),
          finalize(() => {
            patchState(store, { isProcessing: false });
          })
        );
      },

      /* Send Plan Back*/
      sendPlanBack(request: ReviewPlanRequest): Observable<IBaseApiResponse<boolean>> {
        patchState(store, { isProcessing: true, error: null });
        return planApiService.sendPlanBackToInvestor(request).pipe(
          tap(() => {
            patchState(store, { isProcessing: false });
          }),
          catchError((error) => {
            patchState(store, {
              error: error.errorMessage || i18n.translate('plans.errors.sendPlanBack'),
            });
            return throwError(() => new Error(i18n.translate('plans.errors.sendPlanBack')));
          }),
          finalize(() => {
            patchState(store, { isProcessing: false });
          })
        );
      },

      employeeApprovePlan(planId: string, reason?: string, approvalSignature?: string) {
        patchState(store, { isProcessing: true, error: null });
        return planApiService.internalApprovePlanStatus({ planId, status: EemployeePlanAction.Approve, reason, approvalSignature }).pipe(
          tap(() => {
            patchState(store, { isProcessing: false });
          }),
          catchError((error) => {
            patchState(store, {
              error: error.errorMessage || i18n.translate('plans.errors.approvePlan'),
            });
            return throwError(() => new Error(i18n.translate('plans.errors.approvePlan')));
          }),
          finalize(() => {
            patchState(store, { isProcessing: false });
          })
        );
      },

      employeeRejectPlan(planId: string, reason: string) {
        patchState(store, { isProcessing: true, error: null });
        return planApiService.internalRejectPlanStatus({ planId, status: EemployeePlanAction.Reject, reason }).pipe(
          tap(() => {
            patchState(store, { isProcessing: false });
          }),
          catchError((error) => {
            patchState(store, {
              error: error.errorMessage || i18n.translate('plans.errors.rejectPlan'),
            });
            return throwError(() => new Error(i18n.translate('plans.errors.rejectPlan')));
          }),
          finalize(() => {
            patchState(store, { isProcessing: false });
          })
        );
      },

      /* rejection acknowledge by dv*/
      DvRejecttionAcknowledgePlan(planId: string, acknowledgeNote: string) {
        patchState(store, { isProcessing: true, error: null });
        return planApiService.DvRejectionAcknowledge({ planId, acknowledgeNote }).pipe(
          tap(() => {
            patchState(store, { isProcessing: false });
          }),
          catchError((error) => {
            patchState(store, {
              error: error.errorMessage || i18n.translate('plans.errors.rejectAcknowledgePlan'),
            });
            return throwError(() => new Error(i18n.translate('plans.errors.rejectAcknowledgePlan')));
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
          tap((res) => {
            store.setActionNote(res.body?.productPlan?.actionNote || null);
            store.setLinkedOpportunityWarning(res.body?.productPlan?.linkedToDeletedOpportunity || false);
            store.setAcknowledgeRejectionNote(res.body?.productPlan?.acknowledgeRejectionNote || null);
            const planStatus = roleService.hasAnyRoleSignal([ERoles.INVESTOR])() ? res.body?.productPlan?.investorStatus : res.body?.productPlan?.status;
            store.setPlanStatus(planStatus ?? null);
            const opportunityItem: ISelectItem = {
              id: res.body?.productPlan?.overviewCompanyInfo?.basicInfo?.opportunityId ?? '',
              name: res.body?.productPlan?.overviewCompanyInfo?.basicInfo?.opportunityTitle ?? '',
            }
            patchState(store, { availableOpportunities: [opportunityItem] });
            patchState(store, { productPlanData: res.body || null });
          }),
          catchError((error) => {
            patchState(store, { error: error.errorMessage || i18n.translate('plans.errors.loadProductPlan') });
            return throwError(() => new Error(i18n.translate('plans.errors.loadProductPlan')));
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
          tap((res) => {
            const planStatus = roleService.hasAnyRoleSignal([ERoles.INVESTOR])() ? res.body?.servicePlan?.investorStatus : res.body?.servicePlan?.status;
            store.setPlanStatus(planStatus ?? null);

            const opportunityItem: ISelectItem = {
              id: res.body?.servicePlan?.opportunityId ?? '',
              name: res.body?.servicePlan?.opportunityName ?? '',
            }
            patchState(store, { availableOpportunities: [opportunityItem] });
            patchState(store, { servicePlanData: res.body || null });
            store.setActionNote(res.body?.actionNote ?? null);
            store.setAcknowledgeRejectionNote(res.body?.acknowledgeRejectionNote ?? null);
            store.setLinkedOpportunityWarning(res.body?.servicePlan.linkedToDeletedOpportunity || false);

          }),
          catchError((error) => {
            patchState(store, { error: error.errorMessage || i18n.translate('plans.errors.loadServicePlan') });
            return throwError(() => new Error(i18n.translate('plans.errors.loadServicePlan')));
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
            patchState(store, { error: error.errorMessage || i18n.translate('plans.errors.loadTimeline') });
            return throwError(() => new Error(i18n.translate('plans.errors.loadTimeline')));
          }),
          finalize(() => {
            patchState(store, { isLoading: false });
          })
        );
      },
      /* Download Plan*/
      generateProductPlanPdf(planId: string): Observable<{ blob: Blob; filename: string }> {
        patchState(store, { isLoading: true, error: null });
        return planApiService.generateProductPlanPdf(planId).pipe(
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

      /* Generate Service Plan PDF*/
      generateServicePlanPdf(planId: string): Observable<{ blob: Blob; filename: string }> {
        patchState(store, { isLoading: true, error: null });
        return planApiService.generateServicePlanPdf(planId).pipe(
          tap((res) => {
            downloadFileFromBlob(res.blob, res.filename);
          }),
          catchError((error) => {
            patchState(store, { error: error.errorMessage || i18n.translate('plans.errors.generateServicePdf') });
            return throwError(() => new Error(i18n.translate('plans.errors.generateServicePdf')));
          }),
          finalize(() => {
            patchState(store, { isLoading: false });
          })
        );
      },

      /* Get Plan Comments*/
      getPlanComments(planId: string): Observable<IBaseApiResponse<IPlanCommentResponse>> {
        patchState(store, { error: null });
        return planApiService.getPlanComment(planId).pipe(
          tap((res) => {
            patchState(store, { planComments: res.body || null });
            patchState(store, { currentUserPageComments: [] });
          }),
          catchError((error) => {
            patchState(store, { error: error.errorMessage || i18n.translate('plans.errors.loadComments') });
            return throwError(() => new Error(i18n.translate('plans.errors.loadComments')));
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
    const i18n = inject(I18nService);
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
      },

      deleteDraftPlan(planId: string): Observable<IBaseApiResponse<boolean>> {
        patchState(store, { isProcessing: true, error: null });
        return planApiService.deleteDraftPlan(planId).pipe(
          tap(() => {
            patchState(store, { isProcessing: false });
          }),
          catchError((error) => {
            patchState(store, { error: error.errorMessage || i18n.translate('plans.errors.deleteDraft') });
            return throwError(() => new Error(i18n.translate('plans.errors.deleteDraft')));
          }),
          finalize(() => {
            patchState(store, { isProcessing: false });
          })
        );
      },

      exportPlans(filter: IPlanFilterRequest): Observable<Blob> {
        patchState(store, { isProcessing: true, error: null });

        return planApiService.exportPlans(filter).pipe(
          map((res: any) => {
            patchState(store, { isProcessing: false });
            return res.body!;
          }),
          catchError((error) => {
            patchState(store, {
              error: error.errorMessage || i18n.translate('plans.errors.exportPlans'),
              isProcessing: false,
            });
            return throwError(() => new Error(i18n.translate('plans.errors.exportPlans')));
          }),
          finalize(() => {
            patchState(store, { isProcessing: false });
          }),
        );
      },

      updateSrmApprovalStatus(planId: string, status: SRMApprovalStatus): Observable<IBaseApiResponse<boolean>> {
        patchState(store, { isProcessing: true, error: null });
        return planApiService.updateSRMApprovalStatus(planId, status).pipe(
          tap(() => {
            patchState(store, { isProcessing: false });
          }),
          catchError((error) => {
            patchState(store, { error: error.errorMessage || i18n.translate('plans.errors.updateSrmApprovalStatus') });
            return throwError(() => new Error(i18n.translate('plans.errors.updateSrmApprovalStatus')));
          }),
          finalize(() => {
            patchState(store, { isProcessing: false });
          })
        );
      }
    };
  })
);
