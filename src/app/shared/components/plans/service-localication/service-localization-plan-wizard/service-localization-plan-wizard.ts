import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  Injector,
  model,
  OnDestroy,
  OnInit,
  output,
  signal,
  WritableSignal,
} from '@angular/core';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { ELocalizationMethodology, EPlanPageTitle } from 'src/app/shared/enums';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { BaseWizardDialog } from '../../../base-components/base-wizard-dialog/base-wizard-dialog';
import { IWizardStepState } from 'src/app/shared/interfaces/wizard-state.interface';
import { I18nService } from 'src/app/shared/services/i18n';
import { BaseTagComponent } from '../../../base-components/base-tag/base-tag.component';
import { HandlePlanStatusFactory } from 'src/app/shared/services/plan/planStatusFactory/handle-plan-status-factory';
import { StepContentDirective } from 'src/app/shared/directives';
import { ServiceLocalizationStepCoverPage } from '../service-localization-step-cover-page/service-localization-step-cover-page';
import { ServiceLocalizationStepOverview } from '../service-localization-step-overview/service-localization-step-overview';
import { ServiceLocalizationStepExistingSaudi } from '../service-localization-step-existing-saudi/service-localization-step-existing-saudi';
import { ServicePlanSummaryPage } from '../service-plan-summary-page/service-plan-summary-page';
import { ServiceLocalizationStepDirectLocalization } from '../service-localization-step-direct-localization/service-localization-step-direct-localization';
import { ServicePlanFormService } from 'src/app/shared/services/plan/service-plan-form-service/service-plan-form-service';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { TimelineDialog } from '../../../timeline/timeline-dialog/timeline-dialog';
import { SubmissionConfirmationModalComponent } from '../../submission-confirmation-modal/submission-confirmation-modal.component';
import { Signature, IFieldInformation, IPageComment, IServiceLocalizationPlanResponse } from 'src/app/shared/interfaces/plans.interface';
import { mapServiceLocalizationPlanFormToRequest, convertServiceRequestToFormData, mapServicePlanResponseToForm } from 'src/app/shared/utils/service-localization-plan.mapper';
import { ToasterService } from 'src/app/shared/services/toaster/toaster.service';
import { switchMap, of, map, catchError, finalize, tap, combineLatest, EMPTY, distinctUntilChanged } from 'rxjs';
import { GeneralConfirmationDialogComponent } from "../../../utility-components/general-confirmation-dialog/general-confirmation-dialog.component";
import { ApproveRejectDialogComponent } from "../../../utility-components/approve-reject-dialog/approve-reject-dialog.component";
import { TranslatePipe } from "../../../../pipes/translate.pipe";
import { TCommentPhase, ICommentsCountAndPhase, IPlanWizardStepCommentDescriptor, IStepValidationStatus } from 'src/app/shared/types/plan-comments.types';
import { PageCommentBox } from '../../page-comment-box/page-comment-box';
import { AbstractControl, FormControl, FormGroup, FormArray } from '@angular/forms';
import { AuthStore } from 'src/app/shared/stores/auth/auth.store';
import { ERoles } from 'src/app/shared/enums/roles.enum';
import { BasePlanWizard } from '../../../../classes/plans/base-classes/base-plan-wizard';
import { EInternalUserPlanStatus, EInvestorPlanStatus, ISelectItem, TColors } from 'src/app/shared/interfaces';
import { WizardActionFactory } from 'src/app/shared/services/wizard/wizard-action-factory';
import { IBaseWizardAction } from '../../../base-components/base-wizard-actions/base-wizard-actions';

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
    ServicePlanSummaryPage,
    ServiceLocalizationStepDirectLocalization,
    ButtonModule,
    SkeletonModule,
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

  readonly approvalDialogTitle = computed(() => {
    if (this.isDVManagerPersona()) {
      return "'Are you sure you want to approve this plan and forward it to the Department Manager for review?'"
    }

    if (this.isEmployeePersona()) {
      return this.planStatus() === EInternalUserPlanStatus.DEPT_APPROVED
       ? "Are you sure you want to approve this plan and forward it to the Investor?"
      : 'Are you sure you want to approve this plan and forward it to the Division Manager for review?'
    }

    return "'Are you sure you want to approve this plan and forward it to the Employee for review?'"
  })


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
    return (this.visibility() && (this.mode() == 'view' || this.mode() == 'Review' || this.mode() == 'resubmit') && this.planStatus() !== null && this.planStatus() !== EInvestorPlanStatus.DRAFT && this.activeStep() < this.stepsWithId().length)
  });

  // Submission confirmation modal
  showSubmissionModal = signal(false);
  existingSignature = signal<string | null>(null);
  planSignature = signal<Signature | null>(null);

  // Extract contactInfo from planSignature for submission modal
  contactInfo = computed(() => {
    const signature = this.planSignature();
    return signature?.contactInfo ?? {};
  });

  showConfirmLeaveDialog = model(false);
  // Store original plan response for before/after comparison
  originalPlanResponse = signal<IServiceLocalizationPlanResponse | null>(null);
  // Conditional step flags - initialize as false so all steps are visible initially
  showExistingSaudiStep = signal(false);
  showDirectLocalizationStep = signal(false);

  showWarningMesageDeletedOpportunity =computed(()=>{
    var  x = this.planStore.linkedToDeletedOpportunity() && this.planStatus() === EInvestorPlanStatus.DRAFT ;
    console.log(x, "showWarningMesageDeletedOpportunity");

    return this.planStore.linkedToDeletedOpportunity() && this.planStatus() === EInvestorPlanStatus.DRAFT
  });
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

  step1CommentsCountAndPhase = computed<ICommentsCountAndPhase>(() => {
    return {
      count: this.steps()[0]?.commentsCount ?? 0,
      phase: this.step1CommentPhase()
    };
  });
  step2CommentsCountAndPhase = computed<ICommentsCountAndPhase>(() => {
    return {
      count: this.steps()[1]?.commentsCount ?? 0,
      phase: this.step2CommentPhase()
    };
  });
  step3CommentsCountAndPhase = computed<ICommentsCountAndPhase>(() => {
    return {
      count: this.steps()[2]?.commentsCount ?? 0,
      phase: this.step3CommentPhase()
    };
  });
  step4CommentsCountAndPhase = computed<ICommentsCountAndPhase>(() => {
    return {
      count: this.steps()[3]?.commentsCount ?? 0,
      phase: this.step4CommentPhase()
    };
  });

  // Plan comments from API
  planComments = this.planStore.planComments;
  incomingCommentPersona = this.planStore.commentPersona;
  showHasCommentControl = signal<boolean>(false);

  // Computed signal to get creatorRole from planComments
  creatorRole = computed(() => this.planComments()?.creatorRole ?? null);

  // Computed signal to check if incoming comments should be shown
  shouldShowIncomingComments = computed(() => {
    const mode = this.planStore.wizardMode();

    const creatorRole = this.planStore.planComments()?.creatorRole;
    const currentSignedUser = this.authStore.jwtUserDetails()
    const isSameUserRole = currentSignedUser?.RoleCodes.toString() === creatorRole?.toString()

    return (mode === 'view' || mode === 'Review' || mode === 'resubmit') && !isSameUserRole;
  });

  // Computed signals to check if incoming comments exist and have content
  hasIncomingStep1Comments = computed(() => {
    const step = this.steps()[0];
    return this.step1Comments().length > 0 && this.step1Comments()[0].comment && (
      this.isViewMode() ||
      (this.isInvestorPersona() ? (step?.commentsCount ?? 0 > 0) : true) &&
      !this.planStore.currentUserPageComments().includes(step.title) && !['adding', 'editing'].includes(this.step1CommentPhase())
    );
  });

  hasIncomingStep2Comments = computed(() => {
    const step = this.steps()[1];
    return this.step2Comments().length > 0 && this.step2Comments()[0].comment && (
      this.isViewMode() ||
      (this.isInvestorPersona() ? (step?.commentsCount ?? 0 > 0) : true) &&
      (!this.planStore.currentUserPageComments().includes(step.title) && !['adding', 'editing'].includes(this.step2CommentPhase()))
    );
  });

  hasIncomingStep3Comments = computed(() => {
    const step = this.steps()[2];
    return this.step3Comments().length > 0 && this.step3Comments()[0].comment && (
      this.isViewMode() ||
      (this.isInvestorPersona() ? (step?.commentsCount ?? 0 > 0) : true) &&
      !this.planStore.currentUserPageComments().includes(step.title) && !['adding', 'editing'].includes(this.step3CommentPhase())
    );
  });

  hasIncomingStep4Comments = computed(() => {
    const step = this.steps()[3];
    return this.step4Comments().length > 0 && this.step4Comments()[0].comment && (
      this.isViewMode() ||
      (this.isInvestorPersona() ? (step?.commentsCount ?? 0 > 0) : true) &&
      !this.planStore.currentUserPageComments().includes(step.title) && !['adding', 'editing'].includes(this.step4CommentPhase())
    );
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
    return comments.filter(c => c.pageTitleForTL === EPlanPageTitle.CoverPage);
  });

  step2Comments = computed<IPageComment[]>(() => {
    const comments = this.planComments()?.comments || [];
    return comments.filter(c => c.pageTitleForTL === EPlanPageTitle.Overview);
  });

  step3Comments = computed<IPageComment[]>(() => {
    const comments = this.planComments()?.comments || [];
    return comments.filter(c => c.pageTitleForTL === EPlanPageTitle.ExistingSaudi);
  });

  step4Comments = computed<IPageComment[]>(() => {
    const comments = this.planComments()?.comments || [];
    return comments.filter(c => c.pageTitleForTL === EPlanPageTitle.DirectLocalization);
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

  protected override getCommentPhaseForStepId(stepId: string): TCommentPhase {
    if (stepId === 'cover') return this.step1CommentPhase();
    if (stepId === 'overview') return this.step2CommentPhase();
    if (stepId === 'existingSaudi') return this.step3CommentPhase();
    if (stepId === 'directLocalization') return this.step4CommentPhase();
    return 'none';
  }

  // Used by the active step content components (they only render one step at a time)
  commentColor = computed(() => {
    const stepId = this.stepsWithId()[this.activeStep() - 1]?.id;
    return stepId ? this.getCommentColorForStep(this.getCommentPhaseForStepId(stepId)) : 'orange';
  });

  canApproveOrReject = computed(() => {
    return (![EInternalUserPlanStatus.ReturnedByDV, EInternalUserPlanStatus.ReturnedByDEPTManager].includes(this.planStatus() as EInternalUserPlanStatus))
    && ((this.step1CommentPhase() === 'none' && this.step2CommentPhase() === 'none' && this.step3CommentPhase() === 'none' && this.step4CommentPhase() === 'none')
    || (!this.hasSelectedFields() &&
     !this.hasComments()))
  });

  canAcknowledgeRejection = computed(() => {
    return this.planStatus() === EInternalUserPlanStatus.DEPT_REJECTED && this.isDVManagerPersona();
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
    const hasEmployeeRole = userProfile.roleCodes?.includes(ERoles.EMPLOYEE) ?? false;
    return hasEmployeeRole;
  });

      // Check if user is Division MANAGER persona
  isDVManagerPersona = computed(() => {
    const userProfile = this.authStore.userProfile();
    if (!userProfile) return false;
    const hasMangerRole = userProfile.roleCodes?.includes(ERoles.Division_MANAGER) ?? false;
    return hasMangerRole;
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
      title: EPlanPageTitle.CoverPage,
      description: 'Enter high-level submission and plan details',
      formState: this.serviceLocalizationFormService.step1_coverPage,
      hasErrors: this.step1CommentPhase() === 'none' || this.step1CommentPhase() === 'viewing',
      commentsCount: this.isViewMode() && this.planComments() ? this.step1CommentFields().length : this.step1SelectedInputs().length,
      commentColor: this.getCommentColorForStep(this.step1CommentPhase()),
    });

    pushStep({
      id: 'overview',
      title: EPlanPageTitle.Overview,
      description: 'Provide an overview of the localization plan',
      formState: this.serviceLocalizationFormService.step2_overview,
      hasErrors: this.step2CommentPhase() === 'none' || this.step2CommentPhase() === 'viewing',
      commentsCount: this.isViewMode() && this.planComments() ? this.step2CommentFields().length : this.step2SelectedInputs().length,
      commentColor: this.getCommentColorForStep(this.step2CommentPhase()),
    });

    if (this.showExistingSaudiStep()) {
      pushStep({
        id: 'existingSaudi',
        title: EPlanPageTitle.ExistingSaudi,
        description: 'Enter details of your existing presence in Saudi Arabia',
        formState: this.serviceLocalizationFormService.step3_existingSaudi,
        hasErrors: this.step3CommentPhase() === 'none' || this.step3CommentPhase() === 'viewing',
        commentsCount: this.isViewMode() && this.planComments() ? this.step3CommentFields().length : this.step3SelectedInputs().length,
        commentColor: this.getCommentColorForStep(this.step3CommentPhase()),
      });
    }

    if (this.showDirectLocalizationStep()) {
      pushStep({
        id: 'directLocalization',
        title: EPlanPageTitle.DirectLocalization,
        description: 'Provide direct localization and investment details',
        formState: this.serviceLocalizationFormService.step4_directLocalization,
        hasErrors: this.step4CommentPhase() === 'none' || this.step4CommentPhase() === 'viewing',
        commentsCount: this.isViewMode() && this.planComments() ? this.step4CommentFields().length : this.step4SelectedInputs().length,
        commentColor: this.getCommentColorForStep(this.step4CommentPhase()),
      });
    }

    // Summary always last
    pushStep({
      id: 'summary',
      title: EPlanPageTitle.Summary,
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
    const incomingStepsComments = [this.hasIncomingStep1Comments(), this.hasIncomingStep2Comments(), this.hasIncomingStep3Comments(), this.hasIncomingStep4Comments()];
    return mode === 'resubmit' && (this.steps().every(step => !step.commentsCount) || (incomingStepsComments.every(step => !step)));
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
  planStatus = this.planStore.planStatus;
  statusLabel = computed(() => {
    const status = this.planStatus();
    const statusService = this.planStatusFactory.handleValidateStatus();
    return statusService.getStatusLabel(status ?? EInvestorPlanStatus.DRAFT);
  });
  statusBadgeClass = computed<TColors>(() => {
    const status = this.planStatus();
    const statusService = this.planStatusFactory.handleValidateStatus();
    return statusService.getStatusBadgeClass(status ?? EInvestorPlanStatus.DRAFT);
  });
  isViewMode = computed(() => this.planStore.wizardMode() === 'view');
  isReviewMode = computed(() => this.planStore.wizardMode() === 'Review');
  isResubmitMode = computed(() => this.planStore.wizardMode() === 'resubmit');
  shouldShowStatusTag = computed(() => {
    const mode = this.planStore.wizardMode();
    return ['view', 'edit', 'Review', 'resubmit'].includes(mode);
  });


  validationErrors = signal<Map<number, boolean>>(new Map());

  // Computed signal to check if Add Comment button should be disabled
  override isAddCommentButtonDisabled = computed(() => {
    const stepId = this.stepsWithId()[this.activeStep() - 1]?.id;
    if (!stepId) return false;
    const currentStepCommentPhase = this.getCommentPhaseForStepId(stepId);
    return currentStepCommentPhase !== 'none';
  });

  // Centralized wizard actions using the action factory
  wizardActions = new WizardActionFactory().generateActions({
    context: 'service-plan',
    state: {
      mode: this.mode,
      activeStep: this.activeStep,
      totalSteps: this.stepsCount,
      isLoading: this.isLoading,
      isProcessing: this.isProcessing,
    },
    visibility: {
      hideSaveAsDraft: computed(() => this.isViewMode() || this.isReviewMode() || this.isResubmitMode()),
      canOpenTimeline: this.canOpenTimeline,
      isAddCommentButtonDisabled: this.isAddCommentButtonDisabled,
    },
    permissions: {
      canApproveOrReject: this.canApproveOrReject,
      allowUserToResubmit: this.allowUserToResubmit,
      canAcknowledgeRejection: this.canAcknowledgeRejection,
    },
    metadata: {
      persona: this.authStore?.userProfile()?.roleCodes,
      status: this.planStatus,
    },
    handlers: {
      onPrevious: () => this.previousStep(),
      onNext: () => this.nextStep(),
      onSaveAsDraft: () => this.saveAsDraft(),
      onSubmit: () => this.onSummarySubmitClick(),
      onApproveAndForward: () => this.onApproveAndForward(),
      onReject: () => this.onReject(),
      onSendBack: () => this.onSendBack(),
      onAddComment: () => this.onAddComment(this.commentColor()),
      onOpenTimeline: () => this.timelineVisibility.set(true),
      onResubmit: () => this.onSummarySubmitClick(),
      onAcknowledge: () => this.onAcknowledge(),
    },
  });

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

    // Single combined stream: one load at a time, guards against duplicate calls when same planId+mode re-emit
    combineLatest([
      toObservable(this.planStore.selectedPlanId, { injector: inject(Injector) }),
      toObservable(this.planStore.wizardMode, { injector: inject(Injector) }),
      toObservable(this.visibility, { injector: inject(Injector) }),
    ]).pipe(
      distinctUntilChanged((a, b) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2]),
      switchMap(([currentPlanId, currentMode, isVisible]) => {
        if (!isVisible) return EMPTY;
        if (currentPlanId && ['view', 'edit', 'Review', 'resubmit'].includes(currentMode)) {
          return this.loadPlanData$(currentPlanId).pipe(
            tap((data) => {

              if (data) this.applyLoadedPlanData(data, currentPlanId);
            })
          );
        }
        if (currentMode === 'create' && !currentPlanId) {
          this.serviceLocalizationFormService.resetAllForms();
          this.serviceLocalizationFormService.setInitialPlanTitle(this.planStore.newPlanTitle());
          this.enableAllForms();
          this.activeStep.set(1);
          this.isSubmitted.set(false);
          this.existingSignature.set(null);
          this.planSignature.set(null);
          const basicInfo = this.serviceLocalizationFormService.basicInformationFormGroup;
          const opportunityControl = basicInfo?.get(EMaterialsFormControls.opportunity);
          const applied = this.planStore.appliedOpportunity();
          const available = this.planStore.availableOpportunities()?.[0] ?? null;
          if (applied && opportunityControl) {
            opportunityControl.setValue(available, { emitEvent: true });
            opportunityControl.updateValueAndValidity({ emitEvent: true });
          }
          const benaVendorIDControl = this.serviceLocalizationFormService.step2_overview.get(
            `${EMaterialsFormControls.locationInformationFormGroup}.${EMaterialsFormControls.benaRegisteredVendorID}.${EMaterialsFormControls.value}`
          );
          const userCode = this.authStore.userCode();
          if (benaVendorIDControl && userCode) {
            benaVendorIDControl.setValue(userCode, { emitEvent: true });
          }
        }
        return EMPTY;
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  ngOnInit(): void {
    this.listenToConditionalSteps();
  }

  /** Returns observable that loads plan and emits response body; used by combined plan-load stream. */
  private loadPlanData$(planId: string) {
    this.isLoadingPlan.set(true);
    return this.planStore.getServicePlan(planId).pipe(
      map((response) => response?.body ?? null),
      finalize(() => this.isLoadingPlan.set(false))
    );
  }

  private applyLoadedPlanData(data: IServiceLocalizationPlanResponse, planId: string): void {
    if (this.isResubmitMode() || this.isViewMode()) {
      this.originalPlanResponse.set(data);
    }
    this.serviceLocalizationFormService.resetAllForms();
    const opportunityItem = this.planStore.availableOpportunities()?.[0] ?? null;
    mapServicePlanResponseToForm(data, this.serviceLocalizationFormService, { opportunityItem });
    if (data.signature?.signatureValue) {
      this.existingSignature.set(data.signature.signatureValue);
    } else {
      this.existingSignature.set(null);
    }
    this.planSignature.set(data.signature ?? null);
    const currentMode = this.planStore.wizardMode();
    if (['view', 'Review', 'resubmit'].includes(currentMode)) {
      this.disableAllForms();
      if (currentMode === 'view' || currentMode === 'resubmit') {
        this.activeStep.set(this.stepsWithId().length);
      }
      if (!(this.planStatus()! === EInternalUserPlanStatus.UNDER_REVIEW && this.isInvestorPersona())) {
        this.planStore.getPlanComments(planId)
          .pipe(
            takeUntilDestroyed(this.destroyRef),
            catchError(() => of(null))
          )
          .subscribe(() => {
            this.captureOriginalPlanCommentsForResubmit();
            this.mapCommentFieldsToSelectedInputs();
          });
        this.evaluateConditionalSteps();
      }
    } else if (currentMode === 'edit') {
      this.enableAllForms();
      const basicInfo = this.serviceLocalizationFormService.basicInformationFormGroup;
      const opportunityControl = basicInfo?.get(EMaterialsFormControls.opportunity);
      opportunityControl?.disable({ emitEvent: true });
    }
    this.triggerFormValidityUpdate();
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

    // Keep BENA Registered Vendor ID read-only in location information
    const locationInfo = this.serviceLocalizationFormService.locationInformationFormGroup;
    if (locationInfo) {
      const benaRegisteredVendorID = locationInfo.get(EMaterialsFormControls.benaRegisteredVendorID);
      if (benaRegisteredVendorID) {
        benaRegisteredVendorID.get(EMaterialsFormControls.value)?.disable({ emitEvent: false });
      }
    }

    // Keep Vendor ID with SEC read-only and synced in all Saudi company details items
    const saudiCompanyDetailsArray = this.serviceLocalizationFormService.saudiCompanyDetailsFormGroup;
    if (saudiCompanyDetailsArray) {
      saudiCompanyDetailsArray.controls.forEach((itemControl) => {
        if (itemControl instanceof FormGroup) {
          const vendorIdWithSecValueControl = itemControl.get(
            `${EMaterialsFormControls.registeredVendorIDwithSEC}.${EMaterialsFormControls.value}`
          );
          vendorIdWithSecValueControl?.disable({ emitEvent: false });
        }
      });
    }

    // Re-enabling the whole step also enables nested read-only controls.
    // Keep Step 2 company name disabled and synced with Step 1.
    this.serviceLocalizationFormService.syncCompanyNameFromCoverPageToOverview();

    // Keep Step 3 Vendor ID with SEC locked and synced from Step 2.
    this.serviceLocalizationFormService.syncExistingSaudiRegisteredVendorIdWithSecFromOverview();

    // Keep Service Name read-only in overview service details (synced from cover page).
    const serviceDetailsArray = this.serviceLocalizationFormService.getServiceDetailsFormArray();
    if (serviceDetailsArray) {
      serviceDetailsArray.controls.forEach((itemControl) => {
        if (itemControl instanceof FormGroup) {
          const serviceNameValueControl = itemControl.get(
            `${EMaterialsFormControls.serviceName}.${EMaterialsFormControls.value}`
          );
          serviceNameValueControl?.disable({ emitEvent: false });
        }
      });
    }
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

  protected override getIsResubmitMode(): boolean {
    return this.isResubmitMode();
  }

  protected override getIsInvestorPersona(): boolean {
    return this.isInvestorPersona();
  }

  protected override getShowCommentState(): WritableSignal<boolean> {
    return this.showCommentState;
  }

  protected override getActiveStep(): number {
    return this.activeStep();
  }

  protected override getStepFormForComment(step: number): FormGroup | null {
    const stepId = this.stepsWithId()[step - 1]?.id;
    if (!stepId) return null;
    if (stepId === 'cover') return this.serviceLocalizationFormService.step1_coverPage;
    if (stepId === 'overview') return this.serviceLocalizationFormService.step2_overview;
    if (stepId === 'existingSaudi') return this.serviceLocalizationFormService.step3_existingSaudi;
    if (stepId === 'directLocalization') return this.serviceLocalizationFormService.step4_directLocalization;
    return null;
  }

  protected override getStepIdFromStepIndex(step: number): string | undefined {
    return this.stepsWithId()[step - 1]?.id;
  }

  protected override getCommentPhaseSignalForStepId(stepId: string): WritableSignal<TCommentPhase> | null {
    if (stepId === 'cover') return this.step1CommentPhase;
    if (stepId === 'overview') return this.step2CommentPhase;
    if (stepId === 'existingSaudi') return this.step3CommentPhase;
    if (stepId === 'directLocalization') return this.step4CommentPhase;
    return null;
  }

  protected override resetCurrentStepCommentSelections(stepId: ServiceLocalizationWizardStepId | undefined): void {
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

  updateValidationErrors(errors: Map<number, IStepValidationStatus>): void {
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
          this.toasterService.success(this.i18nService.translate('Service localization plan submitted successfully'));
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

    const step1CoverPage = this.serviceLocalizationFormService.step1_coverPage;
    const coverPageCompanyInfo = step1CoverPage?.get(EMaterialsFormControls.coverPageCompanyInformationFormGroup) as FormGroup | null;
    const planTitleGroup = coverPageCompanyInfo?.get(EMaterialsFormControls.planTitle);
    const planTitleValueControl = planTitleGroup instanceof FormGroup
      ? (planTitleGroup.get(EMaterialsFormControls.value) as FormControl | null)
      : null;

    if (planTitleValueControl && planTitleValueControl.invalid) {
      planTitleValueControl.markAsDirty();
      planTitleValueControl.markAsTouched();
      coverPageCompanyInfo?.markAsDirty();
      coverPageCompanyInfo?.markAllAsTouched();
      step1CoverPage?.updateValueAndValidity({ emitEvent: true });

      this.toasterService.error('Please enter plan title to save as draft');
      return;
    }

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

      this.toasterService.error('Please select opportunity to save as draft');
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
        },
      });
  }

  /** Step comment descriptors for shared collect/validate logic (includes conditional steps). */
  private getCommentDescriptors(): IPlanWizardStepCommentDescriptor[] {
    return [
      { stepIndex: 0, getForm: () => this.serviceLocalizationFormService.step1_coverPage, getCommentPhase: () => this.step1CommentPhase(), getSelectedInputs: () => this.step1SelectedInputs(), setSelectedInputs: (inputs) => this.step1SelectedInputs.set(inputs), getComments: () => this.step1Comments(), getCommentFields: () => this.step1CommentFields(), getStepTitle: () => this.steps()[0]?.title ?? '' },
      { stepIndex: 1, getForm: () => this.serviceLocalizationFormService.step2_overview, getCommentPhase: () => this.step2CommentPhase(), getSelectedInputs: () => this.step2SelectedInputs(), setSelectedInputs: (inputs) => this.step2SelectedInputs.set(inputs), getComments: () => this.step2Comments(), getCommentFields: () => this.step2CommentFields(), getStepTitle: () => this.steps()[1]?.title ?? '' },
      { stepIndex: 2, getForm: () => this.serviceLocalizationFormService.step3_existingSaudi, getCommentPhase: () => this.step3CommentPhase(), getSelectedInputs: () => this.step3SelectedInputs(), setSelectedInputs: (inputs) => this.step3SelectedInputs.set(inputs), getComments: () => this.step3Comments(), getCommentFields: () => this.step3CommentFields(), getStepTitle: () => this.steps()[this.existingSaudiStepIndex() - 1]?.title ?? '', isVisible: () => this.showExistingSaudiStep() },
      { stepIndex: 3, getForm: () => this.serviceLocalizationFormService.step4_directLocalization, getCommentPhase: () => this.step4CommentPhase(), getSelectedInputs: () => this.step4SelectedInputs(), setSelectedInputs: (inputs) => this.step4SelectedInputs.set(inputs), getComments: () => this.step4Comments(), getCommentFields: () => this.step4CommentFields(), getStepTitle: () => this.steps()[this.directLocalizationStepIndex() - 1]?.title ?? '', isVisible: () => this.showDirectLocalizationStep() },
    ];
  }

  override collectAllPageComments(): IPageComment[] {
    return this.collectAllPageCommentsFromDescriptors(this.getCommentDescriptors(), this.planStore.wizardMode() === 'resubmit');
  }

  protected override validateCommentSubmission(): string | null {
    return this.validateCommentSubmissionFromDescriptors(this.getCommentDescriptors(), (title, phase) => this.getSendBackErrorMessage(title, phase));
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

  // Track original values and updated field keys for resubmit mode
  private originalValuesMap = new Map<string, unknown>();
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

  collectInvestorPageComments(): IPageComment[] {
    return this.collectInvestorPageCommentsFromDescriptors(this.getCommentDescriptors());
  }

  // Implement abstract method: canInvestorSubmit
  override canInvestorSubmit(): boolean {
    if (this.planStore.wizardMode() !== 'resubmit') return false;
    return this.remainingFieldsRequiringUpdate() === 0;
  }

  // Implement abstract method: buildResubmitFormData
  override buildResubmitFormData(): FormData {
    const planId = this.planStore.selectedPlanId() ?? '';

    // Build request (same shape as submit: include conditional steps so resubmit payload matches backend expectations)
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
      },
      {
        includeExistingSaudi: this.showExistingSaudiStep(),
        includeDirectLocalization: this.showDirectLocalizationStep(),
      }
    );

    // Convert to FormData
    const formData = convertServiceRequestToFormData(request);

    const investorComments = this.collectInvestorPageComments();
    this.appendCommentsToFormData(formData, investorComments);
    return formData;
  }

  override getResubmitPlanType(): 'product' | 'service' {
    return 'service';
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

    const isSentBackFromManager = [EInternalUserPlanStatus.ReturnedByDV, EInternalUserPlanStatus.ReturnedByDEPTManager];
    if (isSentBackFromManager.includes(this.planStore.planStatus?.() as EInternalUserPlanStatus)) {
      this.fillStepsFormsWithIncomingComments(this.getCommentDescriptors());
      this.markSelectedFieldsWithCheckboxes(this.getCommentDescriptors());
    }

  }

  /**
   * Handles edit step event from summary page
   * Maps summary step numbers (1-4) to actual wizard step indices
   */
  onEditStepFromSummary(summaryStepNumber: number): void {
    // Map summary step numbers to wizard step IDs
    // Step 1 = Cover Page (always step 1)
    // Step 2 = Overview (always step 2)
    // Step 3 = Existing Saudi (conditional, use existingSaudiStepIndex)
    // Step 4 = Direct Localization (conditional, use directLocalizationStepIndex)

    let targetStepIndex: number;

    if (summaryStepNumber === 1) {
      // Cover Page is always step 1
      targetStepIndex = 1;
    } else if (summaryStepNumber === 2) {
      // Overview is always step 2
      targetStepIndex = 2;
    } else if (summaryStepNumber === 3) {
      // Existing Saudi - use computed step index
      targetStepIndex = this.existingSaudiStepIndex();
    } else if (summaryStepNumber === 4) {
      // Direct Localization - use computed step index
      targetStepIndex = this.directLocalizationStepIndex();
    } else {
      // Fallback: use the summary step number as-is
      targetStepIndex = summaryStepNumber;
    }

    // Navigate to the target step
    if (targetStepIndex > 0) {
      this.navigateToStep(targetStepIndex);
    }
  }

  get EInternalUserPlanStatus() {
    return EInternalUserPlanStatus;
  }
}
