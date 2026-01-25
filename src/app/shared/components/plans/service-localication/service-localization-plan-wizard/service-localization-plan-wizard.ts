import {
  ChangeDetectionStrategy,
  Component,
  computed,
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
import { Signature, IFieldInformation, IPageComment, IServiceLocalizationPlanResponse } from 'src/app/shared/interfaces/plans.interface';
import { EInternalUserPlanStatus } from 'src/app/shared/interfaces/dashboard-plans.interface';
import { mapServiceLocalizationPlanFormToRequest, convertServiceRequestToFormData, mapServicePlanResponseToForm } from 'src/app/shared/utils/service-localization-plan.mapper';
import { ToasterService } from 'src/app/shared/services/toaster/toaster.service';
import { switchMap, of, map, catchError, finalize } from 'rxjs';
import { GeneralConfirmationDialogComponent } from "../../../utility-components/general-confirmation-dialog/general-confirmation-dialog.component";
import { ApproveRejectDialogComponent } from "../../../utility-components/approve-reject-dialog/approve-reject-dialog.component";
import { TranslatePipe } from "../../../../pipes/translate.pipe";
import { TCommentPhase } from '../../plan-localization/product-localization-plan-wizard/product-localization-plan-wizard';
import { PageCommentBox } from '../../page-comment-box/page-comment-box';
import { AbstractControl, FormControl, FormGroup, FormArray } from '@angular/forms';
import { AuthStore } from 'src/app/shared/stores/auth/auth.store';
import { ERoles } from 'src/app/shared/enums/roles.enum';
import { BasePlanWizard } from '../../base-wizard-class/base-plan-wizard';

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
    TranslatePipe,
    PageCommentBox
  ],
  templateUrl: './service-localization-plan-wizard.html',
  styleUrl: './service-localization-plan-wizard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceLocalizationPlanWizard extends BasePlanWizard implements OnInit, OnDestroy {
  override readonly planStore = inject(PlanStore);
  private readonly i18nService = inject(I18nService);
  private readonly planStatusFactory = inject(HandlePlanStatusFactory);
  private readonly serviceLocalizationFormService = inject(ServicePlanFormService);
  override readonly toasterService = inject(ToasterService);
  private readonly authStore = inject(AuthStore);

  visibility = model(false);
  doRefresh = output<void>();
  isLoading = signal(false);
  activeStep = signal<number>(1);

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
  // Store original plan response for before/after comparison
  originalPlanResponse = signal<IServiceLocalizationPlanResponse | null>(null);
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
  incomingCommentPersona = this.planStore.commentPersona;

  // Computed signal to get creatorRole from planComments
  creatorRole = computed(() => this.planComments()?.creatorRole ?? null);

  // Computed signal to check if incoming comments should be shown
  shouldShowIncomingComments = computed(() => {
    const mode = this.planStore.wizardMode();
    return mode === 'view' || mode === 'Review' || mode === 'resubmit';
  });

  // Computed signals to check if incoming comments exist and have content
  hasIncomingStep1Comments = computed(() => {
    const comments = this.step1Comments();
    return comments.length > 0 && comments.some(c => c.comment && c.comment.trim().length > 0);
  });

  hasIncomingStep2Comments = computed(() => {
    const comments = this.step2Comments();
    return comments.length > 0 && comments.some(c => c.comment && c.comment.trim().length > 0);
  });

  hasIncomingStep3Comments = computed(() => {
    const comments = this.step3Comments();
    return comments.length > 0 && comments.some(c => c.comment && c.comment.trim().length > 0);
  });

  hasIncomingStep4Comments = computed(() => {
    const comments = this.step4Comments();
    return comments.length > 0 && comments.some(c => c.comment && c.comment.trim().length > 0);
  });

  // Helper methods to get combined incoming comment text for each step
  getIncomingStep1CommentText(): string {
    return this.step1Comments().map(c => c.comment).join('\n\n');
  }

  getIncomingStep2CommentText(): string {
    return this.step2Comments().map(c => c.comment).join('\n\n');
  }

  getIncomingStep3CommentText(): string {
    return this.step3Comments().map(c => c.comment).join('\n\n');
  }

  getIncomingStep4CommentText(): string {
    return this.step4Comments().map(c => c.comment).join('\n\n');
  }

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
  step1CorrectedFields = computed<IFieldInformation[]>(() => {
    return this.step1Comments().flatMap(c => c.fields);
  });

  step2CorrectedFields = computed<IFieldInformation[]>(() => {
    return this.step2Comments().flatMap(c => c.fields);
  });

  step3CorrectedFields = computed<IFieldInformation[]>(() => {
    return this.step3Comments().flatMap(c => c.fields);
  });

  step4CorrectedFields = computed<IFieldInformation[]>(() => {
    return this.step4Comments().flatMap(c => c.fields);
  });

  // Computed signals to extract corrected field IDs from comments (deduped)
  step1CorrectedFieldIds = computed<string[]>(() => {
    const ids = this.step1Comments().flatMap(comment => comment.fields).flatMap(field => {
      const keys: string[] = [];

      if (field.id) {
        keys.push(field.id);
      }

      if (field.inputKey) {
        keys.push(field.inputKey);
      }

      if (field.section && field.inputKey && !field.inputKey.startsWith(field.section + '.')) {
        keys.push(`${field.section}.${field.inputKey}`);
      }

      return keys;
    });

    return ids.filter((id, index, self) => self.indexOf(id) === index);
  });

  step2CorrectedFieldIds = computed<string[]>(() => {
    const ids = this.step2Comments().flatMap(comment => comment.fields).flatMap(field => {
      const keys: string[] = [];

      if (field.id) {
        keys.push(field.id);
      }

      if (field.inputKey) {
        keys.push(field.inputKey);
      }

      if (field.section && field.inputKey && !field.inputKey.startsWith(field.section + '.')) {
        keys.push(`${field.section}.${field.inputKey}`);
      }

      return keys;
    });

    return ids.filter((id, index, self) => self.indexOf(id) === index);
  });

  step3CorrectedFieldIds = computed<string[]>(() => {
    const ids = this.step3Comments().flatMap(comment => comment.fields).flatMap(field => {
      const keys: string[] = [];

      if (field.id) {
        keys.push(field.id);
      }

      if (field.inputKey) {
        keys.push(field.inputKey);
      }

      if (field.section && field.inputKey && !field.inputKey.startsWith(field.section + '.')) {
        keys.push(`${field.section}.${field.inputKey}`);
      }

      return keys;
    });

    return ids.filter((id, index, self) => self.indexOf(id) === index);
  });

  step4CorrectedFieldIds = computed<string[]>(() => {
    const ids = this.step4Comments().flatMap(comment => comment.fields).flatMap(field => {
      const keys: string[] = [];

      if (field.id) {
        keys.push(field.id);
      }

      if (field.inputKey) {
        keys.push(field.inputKey);
      }

      if (field.section && field.inputKey && !field.inputKey.startsWith(field.section + '.')) {
        keys.push(`${field.section}.${field.inputKey}`);
      }

      return keys;
    });

    return ids.filter((id, index, self) => self.indexOf(id) === index);
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
  showCommentState = signal(false);

  // Computed signals for action controls
  hasSelectedFields = computed(() => {
    // In review/view flows we map incoming (already-saved) comment fields into
    // selectedInputs so the UI can highlight them. Those should NOT disable
    // Approve/Reject.
    //
    // Only treat selectedInputs as blocking when the employee is actively
    // adding/editing/viewing comments on that step (i.e., orange state).
    const isBlockingSelection = (phase: TCommentPhase, fields: IFieldInformation[]) => {
      return phase !== 'none' && fields.length > 0;
    };

    return (
      isBlockingSelection(this.step1CommentPhase(), this.step1SelectedInputs()) ||
      isBlockingSelection(this.step2CommentPhase(), this.step2SelectedInputs()) ||
      isBlockingSelection(this.step3CommentPhase(), this.step3SelectedInputs()) ||
      isBlockingSelection(this.step4CommentPhase(), this.step4SelectedInputs())
    );
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

  private readonly hasAnyCorrectedFields = computed(() => {
    return (
      this.step1CorrectedFields().length +
      this.step2CorrectedFields().length +
      this.step3CorrectedFields().length +
      this.step4CorrectedFields().length
    ) > 0;
  });


  private readonly isStepActivelyAddingComments = (stepId: ServiceLocalizationWizardStepId): boolean => {
    // Treat 'viewing' as comment-present so the badge stays orange after save.
    const activePhases: TCommentPhase[] = ['adding', 'editing', 'viewing'];
    const phase =
      stepId === 'cover'
        ? this.step1CommentPhase()
        : stepId === 'overview'
          ? this.step2CommentPhase()
          : stepId === 'existingSaudi'
            ? this.step3CommentPhase()
            : stepId === 'directLocalization'
              ? this.step4CommentPhase()
              : 'none';

    return activePhases.includes(phase);
  };

  private readonly getCommentColorForStep = (stepId: ServiceLocalizationWizardStepId): 'green' | 'orange' => {
    // Check if there are any selected inputs (inputs with comments) for this step
    let hasSelectedInputs = false;
    if (stepId === 'cover') {
      hasSelectedInputs = this.step1SelectedInputs().length > 0;
    } else if (stepId === 'overview') {
      hasSelectedInputs = this.step2SelectedInputs().length > 0;
    } else if (stepId === 'existingSaudi') {
      hasSelectedInputs = this.step3SelectedInputs().length > 0;
    } else if (stepId === 'directLocalization') {
      hasSelectedInputs = this.step4SelectedInputs().length > 0;
    }

    // If there are selected inputs (inputs with comments), always show orange
    if (hasSelectedInputs) {
      return 'orange';
    }

    const status = this.planStore.planStatus();
    const isViewOrReviewMode = this.isViewMode() || this.isReviewMode();

    // Outside UNDER_REVIEW, keep the legacy behavior (all steps orange)
    if (status !== EInternalUserPlanStatus.UNDER_REVIEW) {
      return 'orange';
    }

    // In employee view/review under review: only the step being actively commented should be orange.
    if (isViewOrReviewMode) {
      if (this.isStepActivelyAddingComments(stepId)) {
        return 'orange';
      }

      // Preserve existing semantics (green in view/review when not actively commenting)
      if (this.hasAnyCorrectedFields()) {
        return 'green';
      }

      return 'green';
    }

    // Not in view/review mode but status is UNDER_REVIEW (e.g., investor in resubmit mode)
    return 'orange';
  };

  // Used by the active step content components (they only render one step at a time)
  commentColor = computed(() => {
    const stepId = this.stepsWithId()[this.activeStep() - 1]?.id;
    return stepId ? this.getCommentColorForStep(stepId) : 'orange';
  });
  canApproveOrReject = computed(() => {
    return (this.step1CommentPhase() === 'none' && this.step2CommentPhase() === 'none' && this.step3CommentPhase() === 'none' && this.step4CommentPhase() === 'none') || (!this.hasSelectedFields() && !this.hasComments());
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
      commentColor: this.getCommentColorForStep('cover'),
    });

    pushStep({
      id: 'overview',
      title: 'Overview',
      description: 'Provide an overview of the localization plan',
      formState: this.serviceLocalizationFormService.step2_overview,
      hasErrors: this.step2CommentPhase() === 'none',
      commentsCount: this.isViewMode() && this.planComments() ? this.step2CommentFields().length : this.step2SelectedInputs().length,
      commentColor: this.getCommentColorForStep('overview'),
    });

    if (this.showExistingSaudiStep()) {
      pushStep({
        id: 'existingSaudi',
        title: 'Existing Saudi Co.',
        description: 'Enter details of your existing presence in Saudi Arabia',
        formState: this.serviceLocalizationFormService.step3_existingSaudi,
        hasErrors: this.step3CommentPhase() === 'none',
        commentsCount: this.isViewMode() && this.planComments() ? this.step3CommentFields().length : this.step3SelectedInputs().length,
        commentColor: this.getCommentColorForStep('existingSaudi'),
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
        commentColor: this.getCommentColorForStep('directLocalization'),
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

  stepsCount = computed(() => this.steps().length);

  allowUserToResubmit = computed(() => {
    const mode = this.planStore.wizardMode();
    return mode === 'resubmit' && this.steps().every(step => !step.commentsCount);
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
    super();
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

        if (this.isResubmitMode()) {
          // Store original plan response for before/after comparison
          this.originalPlanResponse.set(data);
        }

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

    // Keep registeredVendorIDwithSEC read-only in location information
    const locationInfo = this.serviceLocalizationFormService.locationInformationFormGroup;
    if (locationInfo) {
      const registeredVendorIDControl = locationInfo.get(EMaterialsFormControls.registeredVendorIDwithSEC);
      if (registeredVendorIDControl) {
        registeredVendorIDControl.disable({ emitEvent: false });
      }
    }

    // Keep registeredVendorIDwithSEC read-only in all Saudi company details items
    const saudiCompanyDetailsArray = this.serviceLocalizationFormService.saudiCompanyDetailsFormGroup;
    if (saudiCompanyDetailsArray) {
      saudiCompanyDetailsArray.controls.forEach((itemControl) => {
        if (itemControl instanceof FormGroup) {
          const registeredVendorIDControl = itemControl.get(EMaterialsFormControls.registeredVendorIDwithSEC);
          if (registeredVendorIDControl) {
            registeredVendorIDControl.disable({ emitEvent: false });
          }
        }
      });
    }

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
    if (this.isResubmitMode()) {
      this.showCommentState.set(true);

      // In resubmit mode the investor opens the comment panel from the wizard actions.
      // Infer the correct phase from the existing comment so the UI shows Edit/Delete
      // for saved comments, or Add Comment when empty.
      const step = this.activeStep();
      const stepId = this.stepsWithId()[step - 1]?.id;
      if (!stepId) return;

      const stepForm =
        stepId === 'cover'
          ? this.serviceLocalizationFormService.step1_coverPage
          : stepId === 'overview'
            ? this.serviceLocalizationFormService.step2_overview
            : stepId === 'existingSaudi'
              ? this.serviceLocalizationFormService.step3_existingSaudi
              : stepId === 'directLocalization'
                ? this.serviceLocalizationFormService.step4_directLocalization
                : null;

      if (!stepForm) return;

      const commentControl = stepForm.get(EMaterialsFormControls.comment) as FormControl<string> | null;
      const hasComment = !!(commentControl?.value && commentControl.value.trim().length > 0);

      const setPhaseIfNone = (phaseSignal: typeof this.step1CommentPhase) => {
        if (phaseSignal() === 'none') {
          phaseSignal.set(hasComment ? 'viewing' : 'none');
        }
      };

      if (stepId === 'cover') {
        setPhaseIfNone(this.step1CommentPhase);
      } else if (stepId === 'overview') {
        setPhaseIfNone(this.step2CommentPhase);
      } else if (stepId === 'existingSaudi') {
        setPhaseIfNone(this.step3CommentPhase);
      } else if (stepId === 'directLocalization') {
        setPhaseIfNone(this.step4CommentPhase);
      }

      return;
    }

    const step = this.activeStep();
    const stepId = this.stepsWithId()[step - 1]?.id;

    // Non-investor (internal) flow: starting a new comment session should clear
    // any previously mapped/selected fields so counters, checkboxes and highlights reset.
    if (!this.isInvestorPersona()) {
      this.resetCurrentStepCommentSelections(stepId);
    }

    // Set comment phase for the current active step
    // Step 1 is cover
    // Step 2 is overview
    // Step 3 is existingSaudi (if shown)
    // Step 4 is directLocalization (if shown)
    if (stepId === 'cover') {
      this.step1CommentPhase.set('adding');
    } else if (stepId === 'overview') {
      this.step2CommentPhase.set('adding');
    } else if (stepId === 'existingSaudi') {
      this.step3CommentPhase.set('adding');
    } else if (stepId === 'directLocalization') {
      this.step4CommentPhase.set('adding');
    }
  }

  private resetCurrentStepCommentSelections(stepId: ServiceLocalizationWizardStepId | undefined): void {
    if (!stepId) return;

    // Reset stepper counter + highlight state (bound to selectedInputs)
    if (stepId === 'cover') {
      this.step1SelectedInputs.set([]);
      this.resetHasCommentControls(this.serviceLocalizationFormService.step1_coverPage);
      return;
    }

    if (stepId === 'overview') {
      this.step2SelectedInputs.set([]);
      this.resetHasCommentControls(this.serviceLocalizationFormService.step2_overview);
      return;
    }

    if (stepId === 'existingSaudi') {
      this.step3SelectedInputs.set([]);
      this.resetHasCommentControls(this.serviceLocalizationFormService.step3_existingSaudi);
      return;
    }

    if (stepId === 'directLocalization') {
      this.step4SelectedInputs.set([]);
      this.resetHasCommentControls(this.serviceLocalizationFormService.step4_directLocalization);
      return;
    }
  }

  private resetHasCommentControls(control: AbstractControl): void {
    if (control instanceof FormGroup) {
      Object.keys(control.controls).forEach(key => {
        const childControl = control.controls[key];
        if (key === EMaterialsFormControls.hasComment && childControl instanceof FormControl) {
          childControl.setValue(false, { emitEvent: false });
          childControl.markAsPristine();
          childControl.markAsUntouched();
        } else {
          this.resetHasCommentControls(childControl);
        }
      });
    } else if (control instanceof FormArray) {
      control.controls.forEach((arrayControl: AbstractControl) => {
        this.resetHasCommentControls(arrayControl);
      });
    }
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

    // In resubmit mode, only validate steps that have corrected fields. Steps with no comments
    // or highlighted inputs are fully disabled; we must not block resubmit due to their validity.
    const resubmitStepsToValidate =
      this.isResubmitMode() ?
        {
          step1: this.step1CorrectedFields().length > 0,
          step2: this.step2CorrectedFields().length > 0,
          step3: includeExistingSaudi && this.step3CorrectedFields().length > 0,
          step4: includeDirectLocalization && this.step4CorrectedFields().length > 0,
        }
        : undefined;

    // Check if all forms are valid
    if (!this.serviceLocalizationFormService.areAllFormsValid({
      includeExistingSaudi,
      includeDirectLocalization,
      resubmitStepsToValidate,
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

    // Get plan ID if in edit or resubmit mode
    const currentMode = this.planStore.wizardMode();
    const currentPlanId = (currentMode === 'edit' || currentMode === 'resubmit')
      ? (this.planStore.selectedPlanId() ?? '')
      : '';

    // Set processing state
    this.isProcessing.set(true);

    // Handle submit vs resubmit
    if (currentMode === 'resubmit') {
      // Update planSignature with the signature from modal before building FormData
      this.planSignature.set(signature);

      // Use buildResubmitFormData to build FormData (includes comments)
      const formData = this.buildResubmitFormData();

      // Call store method to resubmit plan
      this.resubmitServiceLocalizationPlan(formData);
    } else {
      // Map form values to request structure with signature
      const request = mapServiceLocalizationPlanFormToRequest(
        this.serviceLocalizationFormService,
        currentPlanId,
        signature,
        {
          includeExistingSaudi: this.showExistingSaudiStep(),
          includeDirectLocalization: this.showDirectLocalizationStep(),
        }
      );

      // Convert request to FormData
      const formData = convertServiceRequestToFormData(request);

      // Call store method to submit plan
      this.submitServiceLocalizationPlan(formData);
    }
  }

  submitServiceLocalizationPlan(formData: FormData): void {
    this.planStore
      .submitServiceLocalizationPlan(formData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isProcessing.set(false);
          this.toasterService.success(this.i18nService.translate('plans.wizard.messages.submitSuccess'));
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

  resubmitServiceLocalizationPlan(formData: FormData): void {
    this.planStore
      .investorResubmitServicePlan(formData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isProcessing.set(false);
          this.toasterService.success(this.i18nService.translate('plans.wizard.messages.submitSuccess'));
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
          console.error('Error resubmitting plan:', error);
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

    const step2Overview = this.serviceLocalizationFormService.step2_overview;
    const basicInformationFormGroup = step2Overview.get(EMaterialsFormControls.basicInformationFormGroup) as FormGroup | null;
    const opportunityControl = basicInformationFormGroup?.get(EMaterialsFormControls.opportunity) as FormControl | null;

    if (opportunityControl && opportunityControl.invalid) {
      opportunityControl.markAsDirty();
      opportunityControl.markAsTouched();
      basicInformationFormGroup?.markAsDirty();
      basicInformationFormGroup?.markAllAsTouched();

      // Emit statusChanges so the stepper can update its error counter.
      opportunityControl.updateValueAndValidity({ emitEvent: true });
      step2Overview.updateValueAndValidity({ emitEvent: true });
      return;
    }

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
  override collectAllPageComments(): IPageComment[] {
    const comments: IPageComment[] = [];

    // Step 1 comments (Cover Page)
    const step1Form = this.serviceLocalizationFormService.step1_coverPage;
    // In resubmit mode the comment control may be the investor 'comment' field; otherwise use the constant enum key
    const step1CommentControl = this.isResubmitMode()
      ? (step1Form.get('comment') as FormControl<string> | null)
      : (step1Form.get(EMaterialsFormControls.comment) as FormControl<string> | null);
    // Always use the selected inputs (what the investor chose) when collecting new page comments
    const step1Fields = this.step1SelectedInputs();
    const step1CommentValue = step1CommentControl?.value?.trim() || '';
    if (step1CommentValue && (this.isResubmitMode() || step1Fields.length > 0)) {
      comments.push({
        pageTitleForTL: this.steps()[0].title,
        comment: step1CommentValue,
        fields: step1Fields,
      });
    }

    // Step 2 comments (Overview)
    const step2Form = this.serviceLocalizationFormService.step2_overview;
    const step2CommentControl = this.isResubmitMode()
      ? (step2Form.get('comment') as FormControl<string> | null)
      : (step2Form.get(EMaterialsFormControls.comment) as FormControl<string> | null);
    const step2Fields = this.step2SelectedInputs();
    const step2CommentValue = step2CommentControl?.value?.trim() || '';
    if (step2CommentValue && (this.isResubmitMode() || step2Fields.length > 0)) {
      comments.push({
        pageTitleForTL: this.steps()[1].title,
        comment: step2CommentValue,
        fields: step2Fields,
      });
    }

    // Step 3 comments (Existing Saudi)
    if (this.showExistingSaudiStep()) {
      const step3Form = this.serviceLocalizationFormService.step3_existingSaudi;
      const step3CommentControl = this.isResubmitMode()
        ? (step3Form.get('comment') as FormControl<string> | null)
        : (step3Form.get(EMaterialsFormControls.comment) as FormControl<string> | null);
      const step3Fields = this.step3SelectedInputs();
      const step3CommentValue = step3CommentControl?.value?.trim() || '';
      if (step3CommentValue && (this.isResubmitMode() || step3Fields.length > 0)) {
        const step3Index = this.existingSaudiStepIndex();
        comments.push({
          pageTitleForTL: this.steps()[step3Index - 1].title,
          comment: step3CommentValue,
          fields: step3Fields,
        });
      }
    }

    // Step 4 comments (Direct Localization)
    if (this.showDirectLocalizationStep()) {
      const step4Form = this.serviceLocalizationFormService.step4_directLocalization;
      const step4CommentControl = this.isResubmitMode()
        ? (step4Form.get('comment') as FormControl<string> | null)
        : (step4Form.get(EMaterialsFormControls.comment) as FormControl<string> | null);
      const step4Fields = this.step4SelectedInputs();
      const step4CommentValue = step4CommentControl?.value?.trim() || '';
      if (step4CommentValue && (this.isResubmitMode() || step4Fields.length > 0)) {
        const step4Index = this.directLocalizationStepIndex();
        comments.push({
          pageTitleForTL: this.steps()[step4Index - 1].title,
          comment: step4CommentValue,
          fields: step4Fields,
        });
      }
    }

    return comments;
  }

  /**
   * Validate that steps with selected inputs have submitted comments (not in 'adding' or 'editing' phase)
   */
  protected override validateCommentSubmission(): string | null {
    // Check Step 1 (Cover Page)
    if (this.step1SelectedInputs().length > 0 &&
      (this.step1CommentPhase() === 'adding' || this.step1CommentPhase() === 'editing')) {
      return this.getSendBackErrorMessage(this.steps()[0].title, this.step1CommentPhase());
    }

    // Check Step 2 (Overview)
    if (this.step2SelectedInputs().length > 0 &&
      (this.step2CommentPhase() === 'adding' || this.step2CommentPhase() === 'editing')) {
      return this.getSendBackErrorMessage(this.steps()[1].title, this.step2CommentPhase());
    }

    // Check Step 3 (Existing Saudi) - only if step is shown
    if (this.showExistingSaudiStep()) {
      if (this.step3SelectedInputs().length > 0 &&
        (this.step3CommentPhase() === 'adding' || this.step3CommentPhase() === 'editing')) {
        return this.getSendBackErrorMessage(this.steps()[this.existingSaudiStepIndex() - 1].title, this.step3CommentPhase());
      }
    }

    // Check Step 4 (Direct Localization) - only if step is shown
    if (this.showDirectLocalizationStep()) {
      if (this.step4SelectedInputs().length > 0 &&
        (this.step4CommentPhase() === 'adding' || this.step4CommentPhase() === 'editing')) {
        return this.getSendBackErrorMessage(this.steps()[this.directLocalizationStepIndex() - 1].title, this.step4CommentPhase());
      }
    }

    return null;
  }

  // Base class provides all the review/approval/rejection methods
  // We only need to implement the abstract methods and step-specific logic

  ngOnDestroy(): void {
    this.serviceLocalizationFormService.resetAllForms();
  }

  // Implement abstract methods from BasePlanWizard
  protected closeWizard(): void {
    this.visibility.set(false);
  }

  protected refresh(): void {
    this.doRefresh.emit();
  }

  // Track original values for resubmit mode
  private originalValuesMap = new Map<string, any>();
  private updatedFieldsSet = new Set<string>();

  // Computed signal for remaining fields requiring update
  remainingFieldsRequiringUpdate = computed(() => {
    if (this.planStore.wizardMode() !== 'resubmit') return 0;
    const totalCorrected = this.step1CorrectedFields().length +
      this.step2CorrectedFields().length +
      this.step3CorrectedFields().length +
      this.step4CorrectedFields().length;
    return totalCorrected - this.updatedFieldsSet.size;
  });

  // Collect investor page comments (from investorCommentControl in each step)
  // If investor didn't add comments, use employee comments with empty comment string
  // If investor added comments, use the new investor comments
  collectInvestorPageComments(): IPageComment[] {
    const Comments: IPageComment[] = [];

    // Helper function to process comments for a step
    const processStepComments = (
      stepForm: FormGroup,
      stepIndex: number,
      correctedFields: IFieldInformation[],
      employeeComments: IPageComment[]
    ): void => {
      const investorCommentControl = stepForm.get('comment') as FormControl<string> | null;
      const investorComment = investorCommentControl?.value?.trim() || '';

      if (investorComment.length > 0 && correctedFields.length > 0) {
        // Case 1: Investor added comments - use new investor comments
        Comments.push({
          pageTitleForTL: this.steps()[stepIndex].title,
          comment: investorComment,
          fields: correctedFields,
        });
      } else if (employeeComments.length > 0) {
        // Case 2: Investor didn't add comments - use employee comments with empty comment
        employeeComments.forEach(employeeComment => {
          Comments.push({
            pageTitleForTL: employeeComment.pageTitleForTL,
            comment: '', // Empty string as per requirement
            fields: employeeComment.fields, // Keep same fields from employee comments
          });
        });
      }
    };

    // Step 1 comments (Cover Page)
    const step1Form = this.serviceLocalizationFormService.step1_coverPage;
    // Use all fields from employee comments (not just those with IDs)
    // IDs are only needed for FormArray items, but all highlighted fields should be included
    const step1CorrectedFields = this.step1CommentFields();
    processStepComments(step1Form, 0, step1CorrectedFields, this.step1Comments());

    // Step 2 comments (Overview)
    const step2Form = this.serviceLocalizationFormService.step2_overview;
    const step2CorrectedFields = this.step2CommentFields();
    processStepComments(step2Form, 1, step2CorrectedFields, this.step2Comments());

    // Step 3 comments (Existing Saudi) - only if step is shown
    if (this.showExistingSaudiStep()) {
      const step3Form = this.serviceLocalizationFormService.step3_existingSaudi;
      const step3CorrectedFields = this.step3CommentFields();
      const step3Index = this.existingSaudiStepIndex() - 1; // Convert to 0-based index
      processStepComments(step3Form, step3Index, step3CorrectedFields, this.step3Comments());
    }

    // Step 4 comments (Direct Localization) - only if step is shown
    if (this.showDirectLocalizationStep()) {
      const step4Form = this.serviceLocalizationFormService.step4_directLocalization;
      const step4CorrectedFields = this.step4CommentFields();
      const step4Index = this.directLocalizationStepIndex() - 1; // Convert to 0-based index
      processStepComments(step4Form, step4Index, step4CorrectedFields, this.step4Comments());
    }

    return Comments;
  }

  // Implement abstract method: canInvestorSubmit
  override canInvestorSubmit(): boolean {
    if (this.planStore.wizardMode() !== 'resubmit') return false;
    return this.remainingFieldsRequiringUpdate() === 0;
  }

  // Implement abstract method: buildResubmitFormData
  override buildResubmitFormData(): FormData {
    const planId = this.planStore.selectedPlanId() ?? '';

    // Build request (same as submit)
    const request = mapServiceLocalizationPlanFormToRequest(
      this.serviceLocalizationFormService,
      planId,
      this.planSignature() ?? {
        id: '',
        signatureValue: '',
        contactInfo: {
          name: '',
          jobTitle: '',
          contactNumber: '',
          emailId: '',
        },
      }
    );

    // Convert to FormData
    const formData = convertServiceRequestToFormData(request);

    // Append investor page comments as nested FormData entries
    // Comments are required by the API, so always append (even if empty array)
    const investorComments = this.collectInvestorPageComments();
    this.appendCommentsToFormData(formData, investorComments);

    return formData;
  }

  // Implement abstract method: getResubmitPlanType
  override getResubmitPlanType(): 'product' | 'service' {
    return 'service';
  }

  /**
   * Appends comments to FormData in nested structure format
   * Format: Comments[index].pageTitleForTL, Comments[index].comment, Comments[index].fields[index].section, etc.
   */
  private appendCommentsToFormData(formData: FormData, comments: IPageComment[]): void {
    comments.forEach((comment, commentIndex) => {
      // Append comment-level properties
      formData.append(`Comments[${commentIndex}].pageTitleForTL`, comment.pageTitleForTL || '');
      formData.append(`Comments[${commentIndex}].comment`, comment.comment || '');

      // Append fields array
      if (comment.fields && comment.fields.length > 0) {
        comment.fields.forEach((field, fieldIndex) => {
          formData.append(`Comments[${commentIndex}].fields[${fieldIndex}].section`, field.section || '');
          formData.append(`Comments[${commentIndex}].fields[${fieldIndex}].inputKey`, field.inputKey || '');
          formData.append(`Comments[${commentIndex}].fields[${fieldIndex}].label`, field.label || '');
          if (field.id) {
            formData.append(`Comments[${commentIndex}].fields[${fieldIndex}].id`, field.id);
          }
          if (field.value) {
            formData.append(`Comments[${commentIndex}].fields[${fieldIndex}].value`, field.value);
          }
        });
      }
    });
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
