import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  model,
  OnDestroy,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { ELocalizationMethodology } from 'src/app/shared/enums';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BaseWizardDialog } from '../../../base-components/base-wizard-dialog/base-wizard-dialog';
import { IWizardStepState } from 'src/app/shared/interfaces/wizard-state.interface';
import { I18nService } from 'src/app/shared/services/i18n';
import { BaseTagComponent } from '../../../base-components/base-tag/base-tag.component';
import { HandlePlanStatusFactory } from 'src/app/shared/services/plan/planStatusFactory/handle-plan-status-factory';
import { StepContentDirective } from 'src/app/shared/directives';
import { ServiceLocalizationStepCoverPage } from '../service-localization-step-cover-page/service-localization-step-cover-page';
import { ServiceLocalizationStepOverview } from '../service-localization-step-overview/service-localization-step-overview';
import { ServiceLocalizationStepExistingSaudi } from '../service-localization-step-existing-saudi/service-localization-step-existing-saudi';
import { ServiceLocalizationStepSummary } from '../service-localization-step-summary/service-localization-step-summary';
import { ServiceLocalizationStepDirectLocalization } from '../service-localization-step-direct-localization/service-localization-step-direct-localization';
import { ServicePlanFormService } from 'src/app/shared/services/plan/service-plan-form-service/service-plan-form-service';
import { ButtonModule } from 'primeng/button';
import { TimelineDialog } from '../../../timeline/timeline-dialog/timeline-dialog';
import { SubmissionConfirmationModalComponent } from '../../submission-confirmation-modal/submission-confirmation-modal.component';
import { Signature, IFieldInformation, IPageComment, ReviewPlanRequest, IPlanCommentResponse } from 'src/app/shared/interfaces/plans.interface';
import { EInternalUserPlanStatus, EInvestorPlanStatus } from 'src/app/shared/interfaces/dashboard-plans.interface';
import { mapServiceLocalizationPlanFormToRequest, convertServiceRequestToFormData, mapServicePlanResponseToForm } from 'src/app/shared/utils/service-localization-plan.mapper';
import { ToasterService } from 'src/app/shared/services/toaster/toaster.service';
import { switchMap, of, map, catchError, finalize } from 'rxjs';
import { GeneralConfirmationDialogComponent } from "../../../utility-components/general-confirmation-dialog/general-confirmation-dialog.component";
import { ApproveRejectDialogComponent } from "../../../utility-components/approve-reject-dialog/approve-reject-dialog.component";
import { TranslatePipe } from "../../../../pipes/translate.pipe";
import { TCommentPhase } from '../../plan-localization/product-localization-plan-wizard/product-localization-plan-wizard';
import { AbstractControl, FormControl, FormGroup, FormArray } from '@angular/forms';
import { AuthStore } from 'src/app/shared/stores/auth/auth.store';
import { ERoles } from 'src/app/shared/enums/roles.enum';

type ServiceLocalizationWizardStepId =
  | 'cover'
  | 'overview'
  | 'existingSaudi'
  | 'directLocalization'
  | 'summary';

type ServiceLocalizationWizardStepState = IWizardStepState & { id: ServiceLocalizationWizardStepId };

@Component({
  selector: 'app-service-localization-plan-wizard',
  imports: [
    BaseWizardDialog,
    BaseTagComponent,
    StepContentDirective,
    ServiceLocalizationStepCoverPage,
    ServiceLocalizationStepOverview,
    ServiceLocalizationStepExistingSaudi,
    ServiceLocalizationStepSummary,
    ServiceLocalizationStepDirectLocalization,
    ButtonModule,
    TimelineDialog,
    SubmissionConfirmationModalComponent,
    GeneralConfirmationDialogComponent,
    ApproveRejectDialogComponent,
    TranslatePipe
  ],
  templateUrl: './service-localization-plan-wizard.html',
  styleUrl: './service-localization-plan-wizard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceLocalizationPlanWizard implements OnInit, OnDestroy {
  readonly planStore = inject(PlanStore);
  private readonly i18nService = inject(I18nService);
  private readonly planStatusFactory = inject(HandlePlanStatusFactory);
  private readonly serviceLocalizationFormService = inject(ServicePlanFormService);
  private readonly toasterService = inject(ToasterService);
  private readonly authStore = inject(AuthStore);

  visibility = model(false);
  doRefresh = output<void>();
  isLoading = signal(false);
  activeStep = signal<number>(1);
  private readonly destroyRef = inject(DestroyRef);

  timelineVisibility = signal(false);
  isSubmitted = signal(false);

  // Mode and plan ID from store
  mode = this.planStore.wizardMode;
  planId = this.planStore.selectedPlanId;
  canOpenTimeline = computed(() => {
    return (this.visibility() && (this.mode() == 'view' || this.mode() == 'Review' || this.mode() == 'resubmit') && this.planStatus() !== null && this.activeStep() < this.stepsWithId().length)
  });

  // Submission confirmation modal
  showSubmissionModal = signal(false);
  existingSignature = signal<string | null>(null);
  planSignature = signal<Signature | null>(null);
  showConfirmLeaveDialog = model(false);
  // Conditional step flags - initialize as false so all steps are visible initially
  showExistingSaudiStep = signal(false);
  showDirectLocalizationStep = signal(false);

  // Comment phase signals for each step
  step1CommentPhase = signal<TCommentPhase>('none');
  step2CommentPhase = signal<TCommentPhase>('none');
  step3CommentPhase = signal<TCommentPhase>('none');
  step4CommentPhase = signal<TCommentPhase>('none');

  // Selected inputs signals for each step
  step1SelectedInputs = signal<IFieldInformation[]>([]);
  step2SelectedInputs = signal<IFieldInformation[]>([]);
  step3SelectedInputs = signal<IFieldInformation[]>([]);
  step4SelectedInputs = signal<IFieldInformation[]>([]);

  // Plan comments from API
  planComments = this.planStore.planComments;

  // Computed signal to get creatorRole from planComments
  creatorRole = computed(() => this.planComments()?.creatorRole ?? null);

  // Computed signal to determine comment title based on creatorRole
  commentTitle = this.planStore.commentPersona;

  // Computed signals to map comments to each step based on pageTitleForTL
  step1Comments = computed<IPageComment[]>(() => {
    const comments = this.planComments()?.comments || [];
    return comments.filter(c => c.pageTitleForTL === 'Cover Page');
  });

  step2Comments = computed<IPageComment[]>(() => {
    const comments = this.planComments()?.comments || [];
    return comments.filter(c => c.pageTitleForTL === 'Overview');
  });

  step3Comments = computed<IPageComment[]>(() => {
    const comments = this.planComments()?.comments || [];
    return comments.filter(c => c.pageTitleForTL === 'Existing Saudi Co.');
  });

  step4Comments = computed<IPageComment[]>(() => {
    const comments = this.planComments()?.comments || [];
    return comments.filter(c => c.pageTitleForTL === 'Direct Localization');
  });

  // Computed signals to extract corrected field IDs for each step
  step1CorrectedFields = computed<string[]>(() => {
    return this.step1Comments().flatMap(c => c.fields.map(f => f.id || '')).filter(id => id !== '');
  });

  step2CorrectedFields = computed<string[]>(() => {
    return this.step2Comments().flatMap(c => c.fields.map(f => f.id || '')).filter(id => id !== '');
  });

  step3CorrectedFields = computed<string[]>(() => {
    return this.step3Comments().flatMap(c => c.fields.map(f => f.id || '')).filter(id => id !== '');
  });

  step4CorrectedFields = computed<string[]>(() => {
    return this.step4Comments().flatMap(c => c.fields.map(f => f.id || '')).filter(id => id !== '');
  });

  // Computed signals to map comment fields to selectedInputs for each step
  step1CommentFields = computed<IFieldInformation[]>(() => {
    return this.step1Comments().flatMap(c => c.fields);
  });

  step2CommentFields = computed<IFieldInformation[]>(() => {
    return this.step2Comments().flatMap(c => c.fields);
  });

  step3CommentFields = computed<IFieldInformation[]>(() => {
    return this.step3Comments().flatMap(c => c.fields);
  });

  step4CommentFields = computed<IFieldInformation[]>(() => {
    return this.step4Comments().flatMap(c => c.fields);
  });

  // Review mode signals
  showSendBackConfirmationDialog = signal<boolean>(false);
  showHasCommentControl = signal<boolean>(false);

  // Approve/Reject dialogs
  showApproveConfirmationDialog = signal<boolean>(false);
  showRejectReasonDialog = signal<boolean>(false);
  showRejectConfirmationDialog = signal<boolean>(false);
  approvalNote = signal<string>('');
  rejectionReason = signal<string>('');

  // Computed signals for action controls
  hasSelectedFields = computed(() => {
    return this.step1SelectedInputs().length > 0 ||
      this.step2SelectedInputs().length > 0 ||
      this.step3SelectedInputs().length > 0 ||
      this.step4SelectedInputs().length > 0;
  });

  hasComments = computed(() => {
    // Check if any step has saved comments
    const step1Form = this.serviceLocalizationFormService.step1_coverPage;
    const step1CommentControl = step1Form.get(EMaterialsFormControls.comment) as FormControl<string>;
    const step1HasComment = step1CommentControl?.value && step1CommentControl.value.trim().length > 0;

    const step2Form = this.serviceLocalizationFormService.step2_overview;
    const step2CommentControl = step2Form.get(EMaterialsFormControls.comment) as FormControl<string>;
    const step2HasComment = step2CommentControl?.value && step2CommentControl.value.trim().length > 0;

    const step3Form = this.serviceLocalizationFormService.step3_existingSaudi;
    const step3CommentControl = step3Form.get(EMaterialsFormControls.comment) as FormControl<string>;
    const step3HasComment = step3CommentControl?.value && step3CommentControl.value.trim().length > 0;

    const step4Form = this.serviceLocalizationFormService.step4_directLocalization;
    const step4CommentControl = step4Form.get(EMaterialsFormControls.comment) as FormControl<string>;
    const step4HasComment = step4CommentControl?.value && step4CommentControl.value.trim().length > 0;

    return step1HasComment || step2HasComment || step3HasComment || step4HasComment;
  });
  commentColor = computed(() => {
    return (this.isViewMode() && this.step1CorrectedFields().length > 0 && this.planStore.planStatus() === EInternalUserPlanStatus.UNDER_REVIEW) ?
      'green' :
      (
        (this.step1CommentPhase() === 'none' && this.planStore.planStatus() === EInternalUserPlanStatus.UNDER_REVIEW) ?
          'green' : 'orange')
      ;
  });
  canApproveOrReject = computed(() => {
    return !this.hasSelectedFields() && !this.hasComments();
  });

  // Check if user is investor persona
  isInvestorPersona = computed(() => {
    const userProfile = this.authStore.userProfile();
    if (!userProfile) return false;
    const hasInvestorCode = !!userProfile.investorCode;
    const hasNoEmployeeId = !userProfile.employeeID;
    const hasInvestorRole = userProfile.roleCodes?.includes(ERoles.INVESTOR) ?? false;
    return (hasInvestorCode && hasNoEmployeeId) || hasInvestorRole;
  });

  // Check if user is employee persona
  isEmployeePersona = computed(() => {
    const userProfile = this.authStore.userProfile();
    if (!userProfile) return false;
    const hasEmployeeId = !!userProfile.employeeID;
    const hasEmployeeRole = userProfile.roleCodes?.includes(ERoles.EMPLOYEE) ?? false;
    return hasEmployeeId || hasEmployeeRole;
  });

  private readonly stepsWithId = computed<ServiceLocalizationWizardStepState[]>(() => {
    this.i18nService.currentLanguage();
    const list: ServiceLocalizationWizardStepState[] = [];

    const pushStep = (step: Omit<ServiceLocalizationWizardStepState, 'isActive'>) => {
      list.push({
        ...step,
        isActive: this.activeStep() === list.length + 1,
      });
    };

    // Always present steps
    pushStep({
      id: 'cover',
      title: 'Cover Page',
      description: 'Enter high-level submission and plan details',
      formState: this.serviceLocalizationFormService.step1_coverPage,
      hasErrors: this.step1CommentPhase() === 'none',
      commentsCount: this.isViewMode() && this.planComments() ? this.step1CommentFields().length : this.step1SelectedInputs().length,
      commentColor: this.commentColor(),
    });

    pushStep({
      id: 'overview',
      title: 'Overview',
      description: 'Provide an overview of the localization plan',
      formState: this.serviceLocalizationFormService.step2_overview,
      hasErrors: this.step2CommentPhase() === 'none',
      commentsCount: this.isViewMode() && this.planComments() ? this.step2CommentFields().length : this.step2SelectedInputs().length,
      commentColor: this.commentColor(),
    });

    if (this.showExistingSaudiStep()) {
      pushStep({
        id: 'existingSaudi',
        title: 'Existing Saudi Co.',
        description: 'Enter details of your existing presence in Saudi Arabia',
        formState: this.serviceLocalizationFormService.step3_existingSaudi,
        hasErrors: this.step3CommentPhase() === 'none',
        commentsCount: this.isViewMode() && this.planComments() ? this.step3CommentFields().length : this.step3SelectedInputs().length,
        commentColor: this.commentColor(),
      });
    }

    if (this.showDirectLocalizationStep()) {
      pushStep({
        id: 'directLocalization',
        title: 'Direct Localization',
        description: 'Provide direct localization and investment details',
        formState: this.serviceLocalizationFormService.step4_directLocalization,
        hasErrors: this.step4CommentPhase() === 'none',
        commentsCount: this.isViewMode() && this.planComments() ? this.step4CommentFields().length : this.step4SelectedInputs().length,
        commentColor: this.commentColor(),
      });
    }

    // Summary always last
    pushStep({
      id: 'summary',
      title: 'Summary',
      description: 'Review the plan before final submission',
      formState: null,
      hasErrors: false,
    });

    return list;
  });

  steps = computed<IWizardStepState[]>(() => {
    return this.stepsWithId().map(({ id, ...step }) => step);
  });

  // Memoized step indices to avoid recalculation in template
  readonly existingSaudiStepIndex = computed(() => this.getStepIndexById('existingSaudi'));
  readonly directLocalizationStepIndex = computed(() => this.getStepIndexById('directLocalization'));
  readonly summaryStepIndex = computed(() => this.getStepIndexById('summary'));

  wizardTitle = computed(() => {
    const currentMode = this.planStore.wizardMode();
    this.i18nService.currentLanguage();
    if (currentMode === 'edit') return this.i18nService.translate('plans.wizard.title.edit');
    if (currentMode === 'view') return this.i18nService.translate('plans.wizard.title.view');
    if (currentMode === 'Review') return 'Review Service Localization Plan';
    if (currentMode === 'resubmit') return 'Resubmit Service Localization Plan';
    return 'Service Localization Plan';
  });

  isLoadingPlan = signal(false);
  isProcessing = signal(false);
  planStatus = computed(() => this.planStore.planStatus());
  statusLabel = computed(() => {
    const status = this.planStatus();
    if (status === null) return '';
    const statusService = this.planStatusFactory.handleValidateStatus();
    return statusService.getStatusLabel(status);
  });
  isViewMode = computed(() => this.planStore.wizardMode() === 'view');
  isReviewMode = computed(() => this.planStore.wizardMode() === 'Review');
  isResubmitMode = computed(() => this.planStore.wizardMode() === 'resubmit');
  shouldShowStatusTag = computed(() => {
    const mode = this.planStore.wizardMode();
    return ['view', 'edit', 'Review', 'resubmit'].includes(mode);
  });
  statusBadgeClass = computed(() => {
    const status = this.planStatus();
    if (status === null) return 'bg-gray-50 text-gray-700 border-gray-200';
    const statusService = this.planStatusFactory.handleValidateStatus();
    return statusService.getStatusBadgeClass(status);
  });

  validationErrors = signal<Map<number, boolean>>(new Map());

  constructor() {
    // Keep activeStep within current steps range (prevents Stepper issues when conditional steps hide/show)
    effect(() => {
      const stepsCount = this.stepsWithId().length;
      const current = this.activeStep();
      if (!stepsCount) return;

      if (!current || current < 1) {
        this.activeStep.set(1);
        return;
      }

      if (current > stepsCount) {
        this.activeStep.set(stepsCount);
      }
    });

    // Effect to load plan data when planId and mode are set (mirrors product localization wizard)
    effect(() => {
      const currentPlanId = this.planStore.selectedPlanId();
      const currentMode = this.planStore.wizardMode();
      const isVisible = this.visibility();

      if (!isVisible) return;

      if (currentPlanId && ['view', 'edit', 'Review', 'resubmit'].includes(currentMode)) {
        this.loadPlanData(currentPlanId);
      } else if (currentMode === 'create' && !currentPlanId) {
        this.serviceLocalizationFormService.resetAllForms();
        this.serviceLocalizationFormService.setInitialPlanTitle(this.planStore.newPlanTitle());
        this.enableAllForms();
        this.activeStep.set(1);
        this.isSubmitted.set(false);
        this.existingSignature.set(null);
        this.planSignature.set(null);
        this.planStore.setPlanStatus(null);
        // If the user applied from an opportunity, ensure the basic info opportunity
        // control is initialized so it becomes part of the form value immediately.
        const basicInfo = this.serviceLocalizationFormService.basicInformationFormGroup;
        const opportunityControl = basicInfo?.get(EMaterialsFormControls.opportunity);
        const applied = this.planStore.appliedOpportunity();
        const available = this.planStore.availableOpportunities()?.[0] ?? null;
        if (applied && opportunityControl) {
          opportunityControl.setValue(available, { emitEvent: true });
          opportunityControl.updateValueAndValidity({ emitEvent: true });
        }
      }
    });

    // Effect to sync comment phase when navigating between steps
    // If showHasCommentControl is true, ensure the current step's comment phase is also active
    effect(() => {
      const showCheckbox = this.showHasCommentControl();
      const currentStep = this.activeStep();

      // Only sync if comment mode is enabled
      if (!showCheckbox) {
        return;
      }

      // Set comment phase to 'adding' for the current step if it's 'none'
      const stepId = this.stepsWithId()[currentStep - 1]?.id;
      if (stepId === 'cover' && this.step1CommentPhase() === 'none') {
        this.step1CommentPhase.set('adding');
      } else if (stepId === 'overview' && this.step2CommentPhase() === 'none') {
        this.step2CommentPhase.set('adding');
      } else if (stepId === 'existingSaudi' && this.step3CommentPhase() === 'none') {
        this.step3CommentPhase.set('adding');
      } else if (stepId === 'directLocalization' && this.step4CommentPhase() === 'none') {
        this.step4CommentPhase.set('adding');
      }
    });

  }

  ngOnInit(): void {
    this.listenToConditionalSteps();
  }

  private loadPlanData(planId: string): void {
    this.isLoadingPlan.set(true);
    this.planStore
      .getServicePlan(planId)
      .pipe(
        switchMap((response) => {
          if (!response?.success || !response?.body) {
            return of(null);
          }

          const opportunityId = response.body.servicePlan?.opportunityId;

          if (opportunityId) {
            return this.planStore.getOpportunityDetailsAndUpdateOptions(opportunityId).pipe(
              map(() => response.body),
              catchError((error) => {
                console.error('Error loading opportunity details:', error);
                return of(response.body);
              })
            );
          }

          return of(response.body);
        }),
        catchError((error) => {
          this.toasterService.error(this.i18nService.translate('plans.wizard.messages.errorLoadingPlan'));
          console.error('Error loading plan:', error);
          this.visibility.set(false);
          return of(null);
        }),
        finalize(() => {
          this.isLoadingPlan.set(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((data) => {
        if (!data) return;

        // Reset then map (ensures arrays match response)
        this.serviceLocalizationFormService.resetAllForms();

        const opportunityItem = this.planStore.availableOpportunities()?.[0] ?? null;
        mapServicePlanResponseToForm(data, this.serviceLocalizationFormService, {
          opportunityItem,
        });

        // Store existing signature if present
        if (data.signature?.signatureValue) {
          this.existingSignature.set(data.signature.signatureValue);
        } else {
          this.existingSignature.set(null);
        }

        // Store signature for summary display
        this.planSignature.set(data.signature ?? null);

        // Set plan status in store
        if (data.servicePlan?.status !== undefined) {
          this.planStore.setPlanStatus(data.servicePlan.status);
        }

        const currentMode = this.planStore.wizardMode();
        const planStatusValue = data.servicePlan?.status;

        if (['view', 'Review', 'resubmit'].includes(currentMode)) {
          // Disable all forms in view/review/resubmit mode
          this.disableAllForms();
          if (currentMode === 'view' || currentMode === 'resubmit') {
            // Default to summary page when opening in view/resubmit mode
            this.activeStep.set(this.stepsWithId().length);
          }

          // Fetch comments in review, view, and resubmit modes
          this.planStore.getPlanComments(planId)
            .pipe(
              takeUntilDestroyed(this.destroyRef),
              catchError((error) => {
                console.error('Error loading plan comments:', error);
                return of(null);
              })
            )
            .subscribe(() => {
              // Map comment fields to selectedInputs for each step when comments are loaded
              this.mapCommentFieldsToSelectedInputs();
            });

          // Re-evaluate conditional steps after disabling forms (getRawValue() will work correctly)
          this.evaluateConditionalSteps();
        } else if (currentMode === 'edit') {
          this.enableAllForms();
          const basicInfo = this.serviceLocalizationFormService.basicInformationFormGroup;
          const opportunityControl = basicInfo?.get(EMaterialsFormControls.opportunity);
          opportunityControl?.disable({ emitEvent: true });
        }

        // Force form validity update so stepper icons reflect current state
        this.triggerFormValidityUpdate();
      });
  }

  /**
   * Triggers updateValueAndValidity on all form groups to emit statusChanges.
   * This ensures the stepper icons update correctly after form data is loaded.
   */
  private triggerFormValidityUpdate(): void {
    // Use setTimeout to ensure this runs after Angular's change detection
    setTimeout(() => {
      this.serviceLocalizationFormService.step1_coverPage.updateValueAndValidity({ emitEvent: true });
      this.serviceLocalizationFormService.step2_overview.updateValueAndValidity({ emitEvent: true });
      this.serviceLocalizationFormService.step3_existingSaudi.updateValueAndValidity({ emitEvent: true });
      this.serviceLocalizationFormService.step4_directLocalization.updateValueAndValidity({ emitEvent: true });
    }, 0);
  }

  private disableAllForms(): void {
    this.serviceLocalizationFormService.step1_coverPage.disable({ emitEvent: false });
    this.serviceLocalizationFormService.step2_overview.disable({ emitEvent: false });
    this.serviceLocalizationFormService.step3_existingSaudi.disable({ emitEvent: false });
    this.serviceLocalizationFormService.step4_directLocalization.disable({ emitEvent: false });

    // Re-enable all hasComment controls
    this.enableHasCommentControls(this.serviceLocalizationFormService.step1_coverPage);
    this.enableHasCommentControls(this.serviceLocalizationFormService.step2_overview);
    this.enableHasCommentControls(this.serviceLocalizationFormService.step3_existingSaudi);
    this.enableHasCommentControls(this.serviceLocalizationFormService.step4_directLocalization);
  }

  /**
   * Recursively enable all hasComment FormControls in a form group
   */
  private enableHasCommentControls(control: AbstractControl): void {
    if (control instanceof FormGroup) {
      Object.keys(control.controls).forEach(key => {
        const childControl = control.controls[key];
        if (key === EMaterialsFormControls.hasComment && childControl instanceof FormControl) {
          // Enable the hasComment control
          childControl.enable({ emitEvent: false });
        } else {
          // Recursively process nested controls
          this.enableHasCommentControls(childControl);
        }
      });
    } else if (control instanceof FormArray) {
      control.controls.forEach((arrayControl: AbstractControl) => {
        this.enableHasCommentControls(arrayControl);
      });
    }
  }

  private enableAllForms(): void {
    this.serviceLocalizationFormService.step1_coverPage.enable({ emitEvent: false });
    this.serviceLocalizationFormService.step2_overview.enable({ emitEvent: false });
    this.serviceLocalizationFormService.step3_existingSaudi.enable({ emitEvent: false });
    this.serviceLocalizationFormService.step4_directLocalization.enable({ emitEvent: false });

    // Keep submission date read-only
    const basicInfo = this.serviceLocalizationFormService.basicInformationFormGroup;
    const submissionDateControl = basicInfo?.get(EMaterialsFormControls.submissionDate);
    submissionDateControl?.disable({ emitEvent: false });

    // Re-enabling the whole step also enables nested read-only controls.
    // Keep Step 2 company name disabled and synced with Step 1.
    this.serviceLocalizationFormService.syncCompanyNameFromCoverPageToOverview();
  }

  // Initialize watcher on service details form array to set flags
  private listenToConditionalSteps() {
    const detailsArray = this.serviceLocalizationFormService.getServiceDetailsFormArray();
    if (!detailsArray) return;

    // Evaluate once (handles edit/view prefilled forms), then react to changes
    this.evaluateConditionalSteps();
    detailsArray.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.evaluateConditionalSteps();
    });
  }

  // Evaluate conditional steps based on service localization methodology
  private evaluateConditionalSteps(): void {
    const detailsArray = this.serviceLocalizationFormService.getServiceDetailsFormArray();
    if (!detailsArray) return;

    // Use getRawValue() to get values even when forms are disabled (view/review mode)
    const items = (detailsArray.getRawValue() ?? []) as Array<{ serviceLocalizationMethodology?: { value?: unknown } }>;
    const methodologies = items.map((it) => {
      const value = it?.serviceLocalizationMethodology?.value;
      return value === undefined || value === null || value === '' ? null : String(value);
    });

    const allNull = methodologies.every((m) => m === null);
    if (allNull) {
      this.showExistingSaudiStep.set(false);
      this.showDirectLocalizationStep.set(false);
      return;
    }

    const collaboration = ELocalizationMethodology.Collaboration.toString();
    const direct = ELocalizationMethodology.Direct.toString();
    this.showExistingSaudiStep.set(methodologies.some((m) => m === collaboration));
    this.showDirectLocalizationStep.set(methodologies.some((m) => m === direct));
  }

  previousStep(): void {
    this.activeStep.set(this.activeStep() - 1);
  }
  nextStep(): void {
    this.activeStep.set(this.activeStep() + 1);
  }

  navigateToStep(stepNumber: number): void {
    this.activeStep.set(stepNumber);
  }

  onAddComment(): void {
    const step = this.activeStep();
    // Set comment phase for the current active step
    // Step 1 is cover
    // Step 2 is overview
    // Step 3 is existingSaudi (if shown)
    // Step 4 is directLocalization (if shown)
    const stepId = this.stepsWithId()[step - 1]?.id;
    if (stepId === 'cover' && this.step1CommentPhase() === 'none') {
      this.step1CommentPhase.set('adding');
    } else if (stepId === 'overview' && this.step2CommentPhase() === 'none') {
      this.step2CommentPhase.set('adding');
    } else if (stepId === 'existingSaudi' && this.step3CommentPhase() === 'none') {
      this.step3CommentPhase.set('adding');
    } else if (stepId === 'directLocalization' && this.step4CommentPhase() === 'none') {
      this.step4CommentPhase.set('adding');
    }
    this.showHasCommentControl.set(true);
  }

  stepIndex(stepId: ServiceLocalizationWizardStepId): number {
    return this.getStepIndexById(stepId);
  }

  /**
   * Private helper to get step index - used by computed signals and stepIndex method
   */
  private getStepIndexById(stepId: ServiceLocalizationWizardStepId): number {
    const idx = this.stepsWithId().findIndex((s) => s.id === stepId);
    return idx >= 0 ? idx + 1 : 0;
  }

  updateValidationErrors(errors: Map<number, any>): void {
    const errorMap = new Map<number, boolean>();
    errors.forEach((stepErrors, stepNumber) => {
      errorMap.set(stepNumber, stepErrors.hasErrors);
    });
    this.validationErrors.set(errorMap);
  }

  onClose(): void {
    const mode = this.planStore.wizardMode();

    // In view mode, close immediately without confirmation
    if (mode === 'view') {
      this.visibility.set(false);
      this.activeStep.set(1);
      this.planStore.resetWizardState();
      return;
    }

    // In create/edit mode, show confirmation dialog if not submitted
    if (mode === 'create' || mode === 'edit') {
      if (!this.isSubmitted()) {
        this.showConfirmLeaveDialog.set(true);
        return;
      }
    }
    // Already submitted, close without confirmation
    this.visibility.set(false);
    this.activeStep.set(1);
    this.doRefresh.emit();
    this.isSubmitted.set(false);
    this.planStore.resetWizardState();
  }

  onSummarySubmitClick(): void {
    const includeExistingSaudi = this.showExistingSaudiStep();
    const includeDirectLocalization = this.showDirectLocalizationStep();

    // Check if all forms are valid
    if (!this.serviceLocalizationFormService.areAllFormsValid({
      includeExistingSaudi,
      includeDirectLocalization,
    })) {
      // Mark all controls as dirty to show validation errors (and trigger stepper error counters)
      this.serviceLocalizationFormService.markAllControlsAsDirty({
        includeExistingSaudi,
        includeDirectLocalization,
      });
      this.toasterService.error(this.i18nService.translate('plans.wizard.messages.fixValidationErrors'));
      return;
    }

    // Mark all controls as dirty
    this.serviceLocalizationFormService.markAllControlsAsDirty({
      includeExistingSaudi,
      includeDirectLocalization,
    });

    // Open submission confirmation modal
    this.showSubmissionModal.set(true);
  }

  private getCurrentPlanIdForRequest(): string {
    return this.planStore.wizardMode() === 'edit' ? this.planStore.selectedPlanId() ?? '' : '';
  }

  private buildRequestFormData(options?: { signature?: Signature }) {
    const request = mapServiceLocalizationPlanFormToRequest(
      this.serviceLocalizationFormService,
      this.getCurrentPlanIdForRequest(),
      options?.signature,
      {
        includeExistingSaudi: this.showExistingSaudiStep(),
        includeDirectLocalization: this.showDirectLocalizationStep(),
      }
    );

    return convertServiceRequestToFormData(request, { stripEmpty: true });
  }

  onSubmissionConfirm(data: {
    name: string;
    jobTitle: string;
    contactNumber: string;
    emailId: string;
    signature: string;
  }): void {
    // Create signature object
    const signature: Signature = {
      id: '',
      signatureValue: data.signature,
      contactInfo: {
        name: data.name,
        jobTitle: data.jobTitle,
        contactNumber: data.contactNumber,
        emailId: data.emailId,
      },
    };

    const formData = this.buildRequestFormData({ signature });

    // Set processing state
    this.isProcessing.set(true);

    // Call store method to submit plan
    this.planStore
      .submitServiceLocalizationPlan(formData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isProcessing.set(false);
          this.toasterService.success('Service localization plan submitted successfully');
          // Reset all forms after successful submission
          this.serviceLocalizationFormService.resetAllForms();
          // Reset wizard state
          this.activeStep.set(1);
          this.doRefresh.emit();
          this.visibility.set(false);
          this.showSubmissionModal.set(false);
          this.isSubmitted.set(true);
          // Reset wizard state in store
          this.planStore.resetWizardState();
        },
        error: (error) => {
          this.isProcessing.set(false);
          this.toasterService.error(this.i18nService.translate('plans.wizard.messages.submitError'));
          console.error('Error submitting plan:', error);
        },
      });
  }

  onSubmissionCancel(): void {
    this.showSubmissionModal.set(false);
  }

  onConfirmLeave(): void {
    this.showConfirmLeaveDialog.set(false);
    this.serviceLocalizationFormService.resetAllForms();
    this.visibility.set(false);
    this.activeStep.set(1);
    this.doRefresh.emit();
    this.isSubmitted.set(false);
    this.planStore.resetWizardState();
  }

  onContinueEditing(): void {
    this.showConfirmLeaveDialog.set(false);
  }


  saveAsDraft(): void {
    const isEditMode = this.planStore.wizardMode() === 'edit';

    const formData = this.buildRequestFormData();

    // Set processing state
    this.isProcessing.set(true);

    // Call store method to submit plan (as draft)
    this.planStore
      .saveAsDraftServiceLocalizationPlan(formData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isProcessing.set(false);
          this.toasterService.success('Service localization plan saved as draft successfully');
          // Only reset forms if not in edit mode (to preserve data)
          if (!isEditMode) {
            this.serviceLocalizationFormService.resetAllForms();
            this.activeStep.set(1);
            // Reset wizard state in store for create mode
            this.planStore.resetWizardState();
          }
          this.doRefresh.emit();
          this.visibility.set(false);
          this.isSubmitted.set(true);
        },
        error: (error) => {
          this.isProcessing.set(false);
          console.error('Error saving draft:', error);
        },
      });
  }

  /**
   * Collect all page comments from step forms
   */
  collectAllPageComments(): IPageComment[] {
    const comments: IPageComment[] = [];

    // Step 1 comments (Cover Page)
    const step1Form = this.serviceLocalizationFormService.step1_coverPage;
    const step1CommentControl = step1Form.get(EMaterialsFormControls.comment) as FormControl<string>;
    if (step1CommentControl?.value && step1CommentControl.value.trim().length > 0 && this.step1SelectedInputs().length > 0) {
      comments.push({
        pageTitleForTL: this.steps()[0].title,
        comment: step1CommentControl.value.trim(),
        fields: this.step1SelectedInputs(),
      });
    }

    // Step 2 comments (Overview)
    const step2Form = this.serviceLocalizationFormService.step2_overview;
    const step2CommentControl = step2Form.get(EMaterialsFormControls.comment) as FormControl<string>;
    if (step2CommentControl?.value && step2CommentControl.value.trim().length > 0 && this.step2SelectedInputs().length > 0) {
      comments.push({
        pageTitleForTL: this.steps()[1].title,
        comment: step2CommentControl.value.trim(),
        fields: this.step2SelectedInputs(),
      });
    }

    // Step 3 comments (Existing Saudi)
    if (this.showExistingSaudiStep()) {
      const step3Form = this.serviceLocalizationFormService.step3_existingSaudi;
      const step3CommentControl = step3Form.get(EMaterialsFormControls.comment) as FormControl<string>;
      if (step3CommentControl?.value && step3CommentControl.value.trim().length > 0 && this.step3SelectedInputs().length > 0) {
        const step3Index = this.existingSaudiStepIndex();
        comments.push({
          pageTitleForTL: this.steps()[step3Index - 1].title,
          comment: step3CommentControl.value.trim(),
          fields: this.step3SelectedInputs(),
        });
      }
    }

    // Step 4 comments (Direct Localization)
    if (this.showDirectLocalizationStep()) {
      const step4Form = this.serviceLocalizationFormService.step4_directLocalization;
      const step4CommentControl = step4Form.get(EMaterialsFormControls.comment) as FormControl<string>;
      if (step4CommentControl?.value && step4CommentControl.value.trim().length > 0 && this.step4SelectedInputs().length > 0) {
        const step4Index = this.directLocalizationStepIndex();
        comments.push({
          pageTitleForTL: this.steps()[step4Index - 1].title,
          comment: step4CommentControl.value.trim(),
          fields: this.step4SelectedInputs(),
        });
      }
    }

    return comments;
  }

  /**
   * Handle Send Back to Investor action
   */
  onSendBackToInvestor(): void {
    // Validate at least one comment exists
    const comments = this.collectAllPageComments();
    if (comments.length === 0) {
      this.toasterService.error('You must add a comment before sending back the plan.');
      return;
    }

    // Show confirmation dialog
    this.showSendBackConfirmationDialog.set(true);
  }

  /**
   * Confirm sending plan back to investor
   */
  onConfirmSendBack(): void {
    const planId = this.planStore.selectedPlanId();
    if (!planId) {
      this.toasterService.error('Plan ID is required.');
      return;
    }

    const comments = this.collectAllPageComments();
    const request: ReviewPlanRequest = {
      planId: planId,
      comments: comments,
    };

    this.isProcessing.set(true);
    this.planStore.sendPlanBackToInvestor(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isProcessing.set(false);
          this.showSendBackConfirmationDialog.set(false);
          this.toasterService.success('Plan has been sent back to investor successfully.');
          this.doRefresh.emit();
          this.visibility.set(false);
          this.planStore.resetWizardState();
        },
        error: (error) => {
          this.isProcessing.set(false);
          this.toasterService.error('Error sending plan back to investor. Please try again.');
          console.error('Error sending plan back:', error);
        }
      });
  }

  /**
   * Cancel sending plan back
   */
  onCancelSendBack(): void {
    this.showSendBackConfirmationDialog.set(false);
  }

  /**
   * Handle Approve and Forward action
   */
  onApproveAndForward(): void {
    if (!this.canApproveOrReject()) {
      return;
    }
    this.approvalNote.set('');
    this.showApproveConfirmationDialog.set(true);
  }

  /**
   * Confirm approval with optional note
   */
  onConfirmApprove(): void {
    const planId = this.planStore.selectedPlanId();
    if (!planId) {
      this.toasterService.error('Plan ID is required.');
      return;
    }

    const note = this.approvalNote().trim();
    this.isProcessing.set(true);
    this.planStore.employeeApprovePlan(planId, note || undefined)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isProcessing.set(false);
          this.showApproveConfirmationDialog.set(false);
          this.approvalNote.set('');
          this.toasterService.success('Plan has been approved and forwarded successfully.');
          this.doRefresh.emit();
          this.visibility.set(false);
          this.planStore.resetWizardState();
        },
        error: (error) => {
          this.isProcessing.set(false);
          this.toasterService.error('Error approving plan. Please try again.');
          console.error('Error approving plan:', error);
        }
      });
  }

  /**
   * Cancel approval
   */
  onCancelApprove(): void {
    this.showApproveConfirmationDialog.set(false);
    this.approvalNote.set('');
  }

  /**
   * Handle Reject action
   */
  onReject(): void {
    if (!this.canApproveOrReject()) {
      return;
    }
    this.rejectionReason.set('');
    this.showRejectReasonDialog.set(true);
  }

  /**
   * Proceed to rejection confirmation after entering reason
   */
  onProceedReject(): void {
    const reason = this.rejectionReason().trim();
    if (!reason) {
      this.toasterService.error('Rejection reason is required.');
      return;
    }
    if (reason.length > 255) {
      this.toasterService.error('Rejection reason must not exceed 255 characters.');
      return;
    }
    this.showRejectReasonDialog.set(false);
    this.showRejectConfirmationDialog.set(true);
  }

  /**
   * Cancel rejection reason entry
   */
  onCancelRejectReason(): void {
    this.showRejectReasonDialog.set(false);
    this.rejectionReason.set('');
  }

  /**
   * Confirm final rejection
   */
  onConfirmReject(): void {
    const planId = this.planStore.selectedPlanId();
    if (!planId) {
      this.toasterService.error('Plan ID is required.');
      return;
    }

    const reason = this.rejectionReason().trim();
    if (!reason) {
      this.toasterService.error('Rejection reason is required.');
      return;
    }

    this.isProcessing.set(true);
    this.planStore.employeeRejectPlan(planId, reason)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isProcessing.set(false);
          this.showRejectConfirmationDialog.set(false);
          this.rejectionReason.set('');
          this.toasterService.success('Plan has been rejected successfully.');
          this.doRefresh.emit();
          this.visibility.set(false);
          this.planStore.resetWizardState();
        },
        error: (error) => {
          this.isProcessing.set(false);
          this.toasterService.error('Error rejecting plan. Please try again.');
          console.error('Error rejecting plan:', error);
        }
      });
  }

  /**
   * Cancel final rejection confirmation
   */
  onCancelRejectConfirmation(): void {
    this.showRejectConfirmationDialog.set(false);
    // Return to reason entry dialog
    this.showRejectReasonDialog.set(true);
  }

  ngOnDestroy(): void {
    this.serviceLocalizationFormService.resetAllForms();
  }

  /**
   * Maps comment fields from API response to selectedInputs for each step
   * This allows step components to use the fields for highlighting and display
   */
  private mapCommentFieldsToSelectedInputs(): void {
    // Map fields from comments to selectedInputs for each step
    this.step1SelectedInputs.set(this.step1CommentFields());
    this.step2SelectedInputs.set(this.step2CommentFields());
    this.step3SelectedInputs.set(this.step3CommentFields());
    this.step4SelectedInputs.set(this.step4CommentFields());
  }
}
