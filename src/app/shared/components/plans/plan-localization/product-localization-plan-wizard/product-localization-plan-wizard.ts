import { ChangeDetectionStrategy, Component, computed, effect, inject, Injector, model, OnDestroy, output, signal, viewChild, WritableSignal } from "@angular/core";
import { AbstractControl, FormArray, FormControl, FormGroup } from "@angular/forms";
import { BaseWizardDialog } from "../../../base-components/base-wizard-dialog/base-wizard-dialog";
import { ButtonModule } from "primeng/button";
import { BaseTagComponent } from "../../../base-components/base-tag/base-tag.component";
import { StepContentDirective } from "src/app/shared/directives";
import { ProductPlanFormService } from "src/app/shared/services/plan/product-plan-form-service/product-plan-form-service";
import { ProductPlanValidationService } from "src/app/shared/services/plan/validation/product-plan-validation.service";
import { IWizardStepState } from "src/app/shared/interfaces/wizard-state.interface";
import { PlanStore } from "src/app/shared/stores/plan/plan.store";
import { mapProductLocalizationPlanFormToRequest, convertRequestToFormData, mapProductPlanResponseToForm } from "src/app/shared/utils/product-localization-plan.mapper";
import { takeUntilDestroyed, toObservable } from "@angular/core/rxjs-interop";
import { switchMap, catchError, finalize, of, map, tap, combineLatest, EMPTY, distinctUntilChanged, Observable } from "rxjs";
import { ToasterService } from "src/app/shared/services/toaster/toaster.service";
import { EMaterialsFormControls, EOpportunityType, EPlanPageTitle } from "src/app/shared/enums";
import { SubmissionConfirmationModalComponent } from "../../submission-confirmation-modal/submission-confirmation-modal.component";
import { IFieldInformation, IPageComment, IProductPlanResponse, Signature } from "src/app/shared/interfaces/plans.interface";
import { I18nService } from "src/app/shared/services/i18n/i18n.service";
import { HandlePlanStatusFactory } from "src/app/shared/services/plan/planStatusFactory/handle-plan-status-factory";
import { TimelineDialog } from "../../../timeline/timeline-dialog/timeline-dialog";
import { EInternalUserPlanStatus, IPlanRecord } from "src/app/shared/interfaces/dashboard-plans.interface";
import { PlanLocalizationStep04SaudizationForm } from "../plan-localization-step-04-saudization/plan-localization-step-04-saudizationForm";
import { PlanLocalizationStep01OverviewCompanyInformationForm } from "../plan-localization-step-01-overviewCompanyInformation/plan-localization-step-01-overviewCompanyInformationForm";
import { PlanLocalizationStep02ProductPlantOverviewForm } from "../plan-localization-step-02-productPlantOverview/plan-localization-step-02-productPlantOverviewForm";
import { PlanLocalizationStep03ValueChainForm } from "../plan-localization-step-03-valueChain/plan-localization-step-03-valueChainForm";
import { GeneralConfirmationDialogComponent } from "../../../utility-components/general-confirmation-dialog/general-confirmation-dialog.component";
import { ApproveRejectDialogComponent } from "../../../utility-components/approve-reject-dialog/approve-reject-dialog.component";
import { TranslatePipe } from "../../../../pipes/translate.pipe";
import { TColors } from "src/app/shared/interfaces";
import { ERoles } from "src/app/shared/enums/roles.enum";
import { EInvestorPlanStatus } from "src/app/shared/interfaces/dashboard-plans.interface";
import { PageCommentBox } from "../../page-comment-box/page-comment-box";
import { BasePlanWizard } from '../../../../classes/plans/base-classes/base-plan-wizard';
import { ProductPlanSummaryPage } from "../product-plan-summary-page/product-plan-summary-page";
import { WizardActionFactory } from "src/app/shared/services/wizard/wizard-action-factory";
import { SkeletonModule } from "primeng/skeleton";

export type TCommentPhase = 'none' | 'adding' | 'editing' | 'viewing';
export interface ICommentsCountAndPhase {
  count: number;
  phase: TCommentPhase;
}
import { IPlanWizardStepCommentDescriptor, IStepValidationStatus } from "src/app/shared/types/plan-comments.types";
import { OpportunitiesStore } from "src/app/shared/stores/opportunities/opportunities.store";
type ProductLocalizationWizardStepId =
  | 'overview'
  | 'productPlant'
  | 'valueChain'
  | 'saudization'
  | 'summary';

@Component({
  selector: 'app-product-localization-plan-wizard',
  imports: [
    BaseWizardDialog,
    PlanLocalizationStep01OverviewCompanyInformationForm,
    PlanLocalizationStep02ProductPlantOverviewForm,
    PlanLocalizationStep03ValueChainForm,
    PlanLocalizationStep04SaudizationForm,
    ProductPlanSummaryPage,
    ButtonModule,
    SkeletonModule,
    BaseTagComponent,
    StepContentDirective,
    SubmissionConfirmationModalComponent,
    TimelineDialog,
    GeneralConfirmationDialogComponent,
    ApproveRejectDialogComponent,
    TranslatePipe,
    PageCommentBox
  ],
  templateUrl: './product-localization-plan-wizard.html',
  styleUrl: './product-localization-plan-wizard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductLocalizationPlanWizard extends BasePlanWizard implements OnDestroy {

  readonly opportunitiesStore = inject(OpportunitiesStore);
  readonly productPlanFormService = inject(ProductPlanFormService);
  override readonly toasterService = inject(ToasterService);
  override readonly planStore = inject(PlanStore);
  readonly validationService = inject(ProductPlanValidationService);
  private readonly i18nService = inject(I18nService);
  private readonly planStatusFactory = inject(HandlePlanStatusFactory);
  visibility = model(false);
  activeStep = signal<number>(1);
  doRefresh = output<void>();
  isSubmitted = signal<boolean>(false);
  showWarningMesageDeletedOpportunity = computed(() => {
    return this.planStore.linkedToDeletedOpportunity() && this.planStatus() === EInvestorPlanStatus.DRAFT
  });

  timelineVisibility = signal(false);
  selectedPlan = signal<IPlanRecord | null>(null);

  // Mode and plan ID from store
  mode = this.planStore.wizardMode;
  planId = this.planStore.selectedPlanId;
  canOpenTimeline = computed(() => {
    return (this.visibility() && (this.mode() == 'view' || this.mode() == 'Review' || this.mode() == 'resubmit') && this.planStatus() !== null && this.planStatus() !== EInvestorPlanStatus.DRAFT && this.activeStep() < 5)
  })
  sendBackConfirmationMessage = computed(() => {
    if (this.isDVManagerPersona()) {
      return "This action cannot be undone and the plan will go directly to the Employee."
    }

    if (this.isEmployeePersona()) {
      return "This action cannot be undone and the plan will go directly to the Investor."
    }

    return "This action cannot be undone and the plan will go directly to the Division Manager.";
  })

  readonly approvalDialogTitle = computed(() => {
    if (this.isDVManagerPersona()) {
      return "Are you sure you want to approve this plan and forward it to the Department Manager for review?"
    }

    if (this.isEmployeePersona()) {
      return this.planStatus() === EInternalUserPlanStatus.DEPT_APPROVED
        ? "Are you sure you want to approve this plan and forward it to the Investor?"
        : 'Are you sure you want to approve this plan and forward it to the Division Manager for review?'
    }

    return "Are you sure you want to approve this plan and forward it to the Employee for review?"
  })

  readonly rejectionDialogTitle = computed(() => {
    if (this.isDVManagerPersona()) {
      return 'Are you sure you want to reject this plan and return it to the Employee for final rejection submission to the Investor?'
    }

    if (this.isEmployeePersona()) {
      return 'Are you sure you want to reject the plan as final rejection?'
    }

    return 'Are you sure you want to reject this plan and return it to the Division Manager for acknowledgement?'
  })

  // Track validation errors for stepper indicators
  validationErrors = signal<Map<number, boolean>>(new Map());

  // Get comment phase for current active step
  currentStepCommentPhase = computed<TCommentPhase>(() => {
    const step = this.activeStep();
    if (step === 1) return this.step1CommentPhase();
    if (step === 2) return this.step2CommentPhase();
    if (step === 3) return this.step3CommentPhase();
    if (step === 4) return this.step4CommentPhase();
    return 'none';
  });

  protected override getCommentPhaseForStepId(stepId: ProductLocalizationWizardStepId): TCommentPhase {
    if (stepId === 'overview') return this.step1CommentPhase();
    if (stepId === 'productPlant') return this.step2CommentPhase();
    if (stepId === 'valueChain') return this.step3CommentPhase();
    if (stepId === 'saudization') return this.step4CommentPhase();
    return 'none';
  }

  // Used by the active step content components (they only render one step at a time)
  commentColor = computed(() => {
    const stepId = this.getStepIdFromStepIndex(this.activeStep());
    return stepId ? this.getCommentColorForStep(this.getCommentPhaseForStepId(stepId)) : 'orange';
  });

  steps = computed<IWizardStepState[]>(() => {
    this.i18nService.currentLanguage();
    return [
      {
        title: EPlanPageTitle.OverviewAndCompanyInformation,
        description: this.i18nService.translate('plans.wizard.step1.description'),
        isActive: this.activeStep() === 1,
        formState: this.productPlanFormService.overviewCompanyInformation,
        hasErrors: this.step1CommentPhase() === 'none' || this.step1CommentPhase() === 'viewing',
        commentsCount: this.isViewMode() && this.planComments() ? this.step1CommentFields().length : this.step1SelectedInputs().length,
        commentColor: this.getCommentColorForStep(this.step1CommentPhase()),
      },
      {
        title: EPlanPageTitle.ProductAndPlantOverview,
        description: this.i18nService.translate('plans.wizard.step2.description'),
        isActive: this.activeStep() === 2,
        formState: this.productPlanFormService.step2_productPlantOverview,
        hasErrors: this.step2CommentPhase() === 'none' || this.step2CommentPhase() === 'viewing',
        commentsCount: this.isViewMode() && this.planComments() ? this.step2CommentFields().length : this.step2SelectedInputs().length,
        commentColor: this.getCommentColorForStep(this.step2CommentPhase()),
      },
      {
        title: EPlanPageTitle.ValueChain,
        description: this.i18nService.translate('plans.wizard.step3.description'),
        isActive: this.activeStep() === 3,
        formState: this.productPlanFormService.step3_valueChain,
        hasErrors: this.step3CommentPhase() === 'none' || this.step3CommentPhase() === 'viewing',
        commentsCount: this.isViewMode() && this.planComments() ? this.step3CommentFields().length : this.step3SelectedInputs().length,
        commentColor: this.getCommentColorForStep(this.step3CommentPhase()),
      },
      {
        title: EPlanPageTitle.Saudization,
        description: this.i18nService.translate('plans.wizard.step4.description'),
        isActive: this.activeStep() === 4,
        formState: this.productPlanFormService.step4_saudization,
        hasErrors: this.step4CommentPhase() === 'none' || this.step4CommentPhase() === 'viewing',
        commentsCount: this.isViewMode() && this.planComments() ? this.step4CommentFields().length : this.step4SelectedInputs().length,
        commentColor: this.getCommentColorForStep(this.step4CommentPhase()),
      },
      {
        title: EPlanPageTitle.Summary,
        description: this.i18nService.translate('plans.wizard.step5.description'),
        isActive: this.activeStep() === 5,
        formState: null,
        hasErrors: false
      }
    ];
  });
  step1SelectedInputs = signal<IFieldInformation[]>([]);
  step2SelectedInputs = signal<IFieldInformation[]>([]);
  step3SelectedInputs = signal<IFieldInformation[]>([]);
  step4SelectedInputs = signal<IFieldInformation[]>([]);

  // Plan comments from API
  planComments = this.planStore.planComments;
  incomingCommentPersona = this.planStore.commentPersona;


  showCommentState = signal(false)

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

  // Computed signals to map comments to each step based on pageTitleForTL
  step1Comments = computed<IPageComment[]>(() => {
    const comments = this.planComments()?.comments || [];
    // Match by step title translation key or actual title
    return comments.filter(c => {
      const stepTitle = EPlanPageTitle.OverviewAndCompanyInformation;
      return c.pageTitleForTL === stepTitle;
    });
  });

  step2Comments = computed<IPageComment[]>(() => {
    const comments = this.planComments()?.comments || [];
    const stepTitle = this.i18nService.translate('plans.wizard.step2.title');
    return comments.filter(c => c.pageTitleForTL === stepTitle || c.pageTitleForTL === EPlanPageTitle.ProductAndPlantOverview);
  });

  step3Comments = computed<IPageComment[]>(() => {
    const comments = this.planComments()?.comments || [];
    const stepTitle = this.i18nService.translate('plans.wizard.step3.title');
    return comments.filter(c => c.pageTitleForTL === stepTitle || c.pageTitleForTL === EPlanPageTitle.ValueChain);
  });

  step4Comments = computed<IPageComment[]>(() => {
    const comments = this.planComments()?.comments || [];
    const stepTitle = this.i18nService.translate('plans.wizard.step4.title');
    return comments.filter(c => c.pageTitleForTL === stepTitle || c.pageTitleForTL === EPlanPageTitle.Saudization);
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

  // Computed signals for corrected fields (filtered to only those with IDs)
  step1CorrectedFieldsFiltered = computed<IPageComment[]>(() => {
    return this.step1Comments();
  });

  step2CorrectedFieldsFiltered = computed<IPageComment[]>(() => {
    return this.step2Comments();
  });

  step3CorrectedFieldsFiltered = computed<IPageComment[]>(() => {
    return this.step3Comments();
  });

  step4CorrectedFieldsFiltered = computed<IPageComment[]>(() => {
    return this.step4Comments();
  });

  // Computed signals to extract corrected field IDs from comments
  step1CorrectedFieldIds = computed<string[]>(() => {
    return this.step1Comments()
      .flatMap(comment => comment.fields)
      .filter(field => field.id)
      .map(field => field.id!)
      .filter((id, index, self) => self.indexOf(id) === index); // Remove duplicates
  });

  step2CorrectedFieldIds = computed<string[]>(() => {
    return this.step2Comments()
      .flatMap(comment => comment.fields)
      .filter(field => field.id)
      .map(field => field.id!)
      .filter((id, index, self) => self.indexOf(id) === index); // Remove duplicates
  });

  step3CorrectedFieldIds = computed<string[]>(() => {
    return this.step3Comments()
      .flatMap(comment => comment.fields)
      .filter(field => field.id)
      .map(field => field.id!)
      .filter((id, index, self) => self.indexOf(id) === index); // Remove duplicates
  });

  step4CorrectedFieldIds = computed<string[]>(() => {
    return this.step4Comments()
      .flatMap(comment => comment.fields)
      .filter(field => field.id)
      .map(field => field.id!)
      .filter((id, index, self) => self.indexOf(id) === index); // Remove duplicates
  });


  step1CommentsCountAndPhase = computed<ICommentsCountAndPhase>(() => {
    return {
      count: this.steps()[0].commentsCount ?? 0,
      phase: this.step1CommentPhase()
    };
  });

  step2CommentsCountAndPhase = computed<ICommentsCountAndPhase>(() => {
    return {
      count: this.steps()[1].commentsCount ?? 0,
      phase: this.step2CommentPhase()
    };
  });

  step3CommentsCountAndPhase = computed<ICommentsCountAndPhase>(() => {
    return {
      count: this.steps()[2].commentsCount ?? 0,
      phase: this.step3CommentPhase()
    };
  });

  step4CommentsCountAndPhase = computed<ICommentsCountAndPhase>(() => {
    return {
      count: this.steps()[3].commentsCount ?? 0,
      phase: this.step4CommentPhase()
    };
  });

  // Computed signals to check if incoming comments exist and have content
  hasIncomingStep1Comments = computed(() => {
    const step = this.steps()[0];
    return this.step1Comments().length > 0 && this.step1Comments()[0].comment && (
      this.isViewMode() ||
      (this.isInvestorPersona() ? (step?.commentsCount ?? 0 > 0) : true) &&
      !this.planStore.currentUserPageComments().includes(step.title)
    );
  });

  hasIncomingStep2Comments = computed(() => {
    const step = this.steps()[1];
    return this.step2Comments().length > 0 && this.step2Comments()[0].comment && (
      this.isViewMode() ||
      (this.isInvestorPersona() ? (step?.commentsCount ?? 0 > 0) : true) &&
      !this.planStore.currentUserPageComments().includes(step.title)
    );
  });

  hasIncomingStep3Comments = computed(() => {
    const step = this.steps()[2];
    return this.step3Comments().length > 0 && this.step3Comments()[0].comment && (
      this.isViewMode() ||
      (this.isInvestorPersona() ? (step?.commentsCount ?? 0 > 0) : true) &&
      !this.planStore.currentUserPageComments().includes(step.title)
    );
  });

  hasIncomingStep4Comments = computed(() => {
    const step = this.steps()[3];
    return this.step4Comments().length > 0 && this.step4Comments()[0].comment && (
      this.isViewMode() ||
      (this.isInvestorPersona() ? (step?.commentsCount ?? 0 > 0) : true) &&
      !this.planStore.currentUserPageComments().includes(step.title)
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

  wizardTitle = computed(() => {
    const currentMode = this.planStore.wizardMode();
    this.i18nService.currentLanguage();
    if (currentMode === 'edit') return this.i18nService.translate('plans.wizard.title.edit');
    if (currentMode === 'view') return this.i18nService.translate('plans.wizard.title.view');
    if (currentMode === 'Review') return 'Review Product Localization Plan';
    if (currentMode === 'resubmit') return 'Resubmit Product Localization Plan';
    return this.i18nService.translate('plans.wizard.title.create');
  });
  isLoadingPlan = signal(false);
  isLoadingOpportunityLocalizationTablesValidation = this.opportunitiesStore.loadingOpportunityLocalizationTablesValidation;

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

  // Value Chain: non-investor add-comments info dialog
  showValueChainAddCommentInfoDialog = signal<boolean>(false);
  // Store original plan response for before/after comparison
  originalPlanResponse = signal<IProductPlanResponse | null>(null);
  // Computed signal for view mode
  isViewMode = computed(() => this.planStore.wizardMode() === 'view');
  isReviewMode = computed(() => this.planStore.wizardMode() === 'Review');
  isResubmitMode = computed(() => this.planStore.wizardMode() === 'resubmit');

  // Check if user is investor persona
  isInvestorPersona = computed(() => {
    const userProfile = this.authStore.userProfile();
    if (!userProfile) return false;
    // Check if user has investorCode and no employeeID, or has INVESTOR role
    const hasInvestorCode = !!userProfile.investorCode;
    const hasNoEmployeeId = !userProfile.employeeID;
    const hasInvestorRole = userProfile.roleCodes?.includes(ERoles.INVESTOR) ?? false;
    return (hasInvestorCode && hasNoEmployeeId) || hasInvestorRole;
  });

  // Check if user is employee persona
  isEmployeePersona = computed(() => {
    const userProfile = this.authStore.userProfile();
    if (!userProfile) return false;
    // Check if user has employeeID or has EMPLOYEE role
    const hasEmployeeRole = userProfile.roleCodes?.includes(ERoles.EMPLOYEE) ?? false;
    return hasEmployeeRole;
  });

  // Check if user is Division MANAGER persona
  isDVManagerPersona = computed(() => {
    const userProfile = this.authStore.userProfile();
    if (!userProfile) return false;
    // Check if user has employeeID or has EMPLOYEE role
    const hasMangerRole = userProfile.roleCodes?.includes(ERoles.Division_MANAGER) ?? false;
    return hasMangerRole;
  });
  // Check if plan is in pending status for investor
  isPendingStatusForInvestor = computed(() => {
    const status = this.planStatus();
    if (status === null) return false;
    // Compare numeric values since status can be either enum type
    return (status as number) === EInvestorPlanStatus.PENDING;
  });

  // Check if this is investor view mode (investor persona viewing pending plan)
  isInvestorViewMode = computed(() => {
    return this.isViewMode() && this.isInvestorPersona() && this.isPendingStatusForInvestor();
  });

  override onAddComment(): void {
    // Requirement: For non-investors, show an info/confirmation dialog when starting comments on Value Chain step.
    if (!this.isInvestorPersona() && this.activeStep() === 3 && !this.showValueChainAddCommentInfoDialog()) {
      this.showValueChainAddCommentInfoDialog.set(true);
      return;
    }
    super.onAddComment(this.commentColor());
  }

  onConfirmValueChainAddCommentInfo(): void {
    this.showValueChainAddCommentInfoDialog.set(false);
    super.onAddComment(this.commentColor());
  }

  // Computed signals for plan status tag
  planStatus = this.planStore.planStatus;
  statusLabel = computed(() => {
    const status = this.planStatus();
    if (status === null) return '';
    const statusService = this.planStatusFactory.handleValidateStatus();
    return statusService.getStatusLabel(status);
  });
  statusBadgeClass = computed<TColors>(() => {
    const status = this.planStatus();
    if (status === null) return 'gray';
    const statusService = this.planStatusFactory.handleValidateStatus();
    return statusService.getStatusBadgeClass(status);
  });
  shouldShowStatusTag = computed(() => {
    const mode = this.planStore.wizardMode();
    return ['view', 'edit', 'Review', 'resubmit'].includes(mode);
  });

  allowUserToResubmit = computed(() => {
    const mode = this.planStore.wizardMode();
    const incomingStepsComments = [this.hasIncomingStep1Comments(), this.hasIncomingStep2Comments(), this.hasIncomingStep3Comments(), this.hasIncomingStep4Comments()];
    return mode === 'resubmit' && (this.steps().every(step => !step.commentsCount) || (incomingStepsComments.every(step => !step)));
  });

  showHasCommentControl = signal<boolean>(false);
  // Separate comment phases for each step
  step1CommentPhase = signal<TCommentPhase>('none');
  step2CommentPhase = signal<TCommentPhase>('none');
  step3CommentPhase = signal<TCommentPhase>('none');
  step4CommentPhase = signal<TCommentPhase>('none');

  // Computed signals for action controls
  hasSelectedFields = computed(() => {
    // In review/view flows, incoming (already-saved) comment fields are mapped
    // into selectedInputs so the UI can highlight them. Those should NOT disable
    // Approve/Reject.
    //
    // Only treat selectedInputs as blocking when the reviewer is actively in a
    // comment phase for that step (i.e., orange state).
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

  canApproveOrReject = computed(() => {
    return (![EInternalUserPlanStatus.ReturnedByDV, EInternalUserPlanStatus.ReturnedByDEPTManager].includes(this.planStatus() as EInternalUserPlanStatus))
      && ((this.step1CommentPhase() === 'none' && this.step2CommentPhase() === 'none' && this.step3CommentPhase() === 'none' && this.step4CommentPhase() === 'none')
        || (!this.hasSelectedFields() &&
          !this.hasComments()))
  });

  canAcknowledgeRejection = computed(() => {
    return this.planStatus() === EInternalUserPlanStatus.DEPT_REJECTED && this.isDVManagerPersona()
  })

  hasComments = computed(() => {
    // // Check if any step has saved comments
    const planComments = this.planStore.planComments()?.comments ?? [];
    const currentUserPageComments = this.planStore.currentUserPageComments();
    const returnedByManagerStatus = [EInternalUserPlanStatus.ReturnedByDEPTManager, EInternalUserPlanStatus.ReturnedByDV];

    if (returnedByManagerStatus.includes(this.planStatus() as EInternalUserPlanStatus)) {
      return planComments.every(comment => currentUserPageComments.includes(comment.pageTitleForTL));
    }

    return currentUserPageComments.length > 0;
  });

  // Computed signal for total steps count
  totalSteps = computed(() => this.steps().length);

  // Computed signal to check if Add Comment button should be disabled
  override isAddCommentButtonDisabled = computed(() => {
    return this.currentStepCommentPhase() !== 'none';
  });

  wizardActions = new WizardActionFactory().generateActions({
    context: 'product-plan',
    state: {
      mode: this.mode,
      activeStep: this.activeStep,
      totalSteps: this.totalSteps,
      isLoading: this.isLoadingPlan,
      isProcessing: this.isProcessing,
    },
    visibility: {
      hideSaveAsDraft: computed(() => this.isViewMode() || this.isReviewMode() || this.isResubmitMode() || this.isInvestorViewMode()),
      canOpenTimeline: this.canOpenTimeline,
      isAddCommentButtonDisabled: this.isAddCommentButtonDisabled,
      isInvestorViewMode: this.isInvestorViewMode,
    },
    permissions: {
      canApproveOrReject: this.canApproveOrReject,
      allowUserToResubmit: this.allowUserToResubmit,
      canAcknowledgeRejection: this.canAcknowledgeRejection,
      hasComments: this.hasComments,
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
      onAddComment: () => this.onAddComment(),
      onOpenTimeline: () => this.timelineVisibility.set(true),
      onResubmit: () => this.onSummarySubmitClick(),
      onAcknowledge: () => this.onAcknowledge(),
    },
  });

  constructor() {
    super();
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
            tap((responseBody) => {
              if (responseBody) this.mapPlanDataToForm(responseBody);
              if (this.roleService.hasAnyRoleSignal([ERoles.INVESTOR])()) {
                this.opportunitiesStore.getOpportunityLocalizationTablesValidation(this.planStore.productPlanData()?.productPlan.id ?? '')
                  .pipe(takeUntilDestroyed(this.destroyRef))
                  .subscribe((validation) => { })
              }
            })
          );
        }
        if (currentMode === 'create' && !currentPlanId) {
          this.productPlanFormService.resetAllForms();
          this.enableAllForms();
          this.activeStep.set(1);
          this.isSubmitted.set(false);
          this.existingSignature.set(null);
          const appliedOpportunity = this.planStore.appliedOpportunity();
          if (appliedOpportunity) this.initializeOpportunityFromApplied();
          else this.loadAvailableOpportunities();
        }
        return EMPTY;
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();

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
      if (currentStep === 1 && this.step1CommentPhase() === 'none') {
        this.step1CommentPhase.set('adding');
      } else if (currentStep === 2 && this.step2CommentPhase() === 'none') {
        this.step2CommentPhase.set('adding');
      } else if (currentStep === 3 && this.step3CommentPhase() === 'none') {
        this.step3CommentPhase.set('adding');
      } else if (currentStep === 4 && this.step4CommentPhase() === 'none') {
        this.step4CommentPhase.set('adding');
      }
    });
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

  /**
   * Handles edit step event from summary page
   * Maps summary step numbers (1-4) to actual wizard step indices
   */
  onEditStepFromSummary(summaryStepNumber: number): void {
    // For product localization, all steps are always present:
    // Step 1 = Overview & Company Information (always step 1)
    // Step 2 = Product & Plant Overview (always step 2)
    // Step 3 = Value Chain (always step 3)
    // Step 4 = Saudization (always step 4)

    // Navigate directly to the step number (no conditional steps to handle)
    if (summaryStepNumber >= 1 && summaryStepNumber <= 4) {
      this.navigateToStep(summaryStepNumber);
    }
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
    if (step === 1) return this.productPlanFormService.step1_overviewCompanyInformation;
    if (step === 2) return this.productPlanFormService.step2_productPlantOverview;
    if (step === 3) return this.productPlanFormService.step3_valueChain;
    if (step === 4) return this.productPlanFormService.step4_saudization;
    return null;
  }

  protected override getStepIdFromStepIndex(step: number): ProductLocalizationWizardStepId | undefined {
    if (step === 1) return 'overview';
    if (step === 2) return 'productPlant';
    if (step === 3) return 'valueChain';
    if (step === 4) return 'saudization';
    if (step === 5) return 'summary';
    return undefined;
  }

  protected override getCommentPhaseSignalForStepId(stepId: string): WritableSignal<TCommentPhase> | null {
    if (stepId === 'overview') return this.step1CommentPhase;
    if (stepId === 'productPlant') return this.step2CommentPhase;
    if (stepId === 'valueChain') return this.step3CommentPhase;
    if (stepId === 'saudization') return this.step4CommentPhase;
    return null;
  }

  onSummarySubmitClick(): void {
    // In resubmit mode, only validate steps that have corrected fields. Steps with no comments
    // or highlighted inputs are fully disabled; we must not block resubmit due to their validity.
    // Use actual corrected field count (not comment entry count) to decide which
    // steps need validation. A step with a comment but zero fields has nothing to
    // validate and its FormGroup may be fully DISABLED.
    const resubmitStepsToValidate = this.isResubmitMode()
      ? {
        step1: this.step1CommentFields().length > 0,
        step2: this.step2CommentFields().length > 0,
        step3: this.step3CommentFields().length > 0,
        step4: this.step4CommentFields().length > 0,
      }
      : undefined;
    // Check if all forms are valid
    if (!this.productPlanFormService.areAllFormsValid({ resubmitStepsToValidate })) {
      // Mark all controls as dirty to show validation errors
      this.productPlanFormService.markAllControlsAsDirty();
      this.toasterService.error(this.i18nService.translate('plans.wizard.messages.fixValidationErrors'));
      return;
    }

    // Mark all controls as dirty
    this.productPlanFormService.markAllControlsAsDirty();

    // Open submission confirmation modal
    this.showSubmissionModal.set(true);
  }

  /** Returns observable that loads plan and emits response body; used by combined plan-load stream. */
  private loadPlanData$(planId: string): Observable<IProductPlanResponse | null> {
    this.isLoadingPlan.set(true);
    return this.planStore.getProductPlan(planId).pipe(
      map((response) => response?.body ?? null),
      finalize(() => this.isLoadingPlan.set(false))
    );
  }

  private mapPlanDataToForm(response: IProductPlanResponse): void {
    // Store original plan response for before/after comparison in resubmit mode or view mode
    if (this.isResubmitMode() || this.isViewMode()) {
      // Store original plan response for before/after comparison
      this.originalPlanResponse.set(response);
    }

    // Map response to form
    mapProductPlanResponseToForm(response, this.productPlanFormService);

    // Store signature for summary display (view/edit modes)
    this.planSignature.set(response.signature ?? null);

    // Store existing signature if present
    if (response.signature?.signatureValue) {
      this.existingSignature.set(response.signature.signatureValue);
    }

    const currentMode = this.planStore.wizardMode();

    // Handle forms based on mode
    if (['view', 'Review', 'resubmit'].includes(currentMode)) {
      // Disable all forms in view mode
      this.disableAllForms();
      // Default to summary page when opening in view mode (especially for investor)
      this.activeStep.set(5);

      // Fetch comments in review, view, and resubmit modes
      const planId = this.planStore.selectedPlanId();
      if (planId) {
        // Always fetch comments in these modes
        if (!(this.planStatus() === EInvestorPlanStatus.UNDER_REVIEW && this.isInvestorPersona())) {
          this.planStore.getPlanComments(planId)
            .pipe(
              takeUntilDestroyed(this.destroyRef),
              catchError(() => of(null))
            )
            .subscribe(() => {
              this.captureOriginalPlanCommentsForResubmit();
              this.mapCommentFieldsToSelectedInputs();
            });
        }
      }
    } else if (currentMode === 'edit') {
      // Enable all forms in edit mode without resetting read-only field values
      this.enableAllFormsWithoutResettingReadOnly();

      // Disable opportunity input in edit mode (but keep other fields enabled)
      const basicInfoForm = this.productPlanFormService.basicInformationFormGroup;
      const opportunityControl = basicInfoForm?.get(EMaterialsFormControls.opportunity);
      if (opportunityControl) {
        opportunityControl.disable({ emitEvent: false });
      }
    }
  }

  disableAllForms(): void {
    this.productPlanFormService.step1_overviewCompanyInformation.disable();
    this.productPlanFormService.step2_productPlantOverview.disable();
    this.productPlanFormService.step3_valueChain.disable();
    this.productPlanFormService.step4_saudization.disable();

    // Re-enable all hasComment controls
    this.enableHasCommentControls(this.productPlanFormService.step1_overviewCompanyInformation);
    this.enableHasCommentControls(this.productPlanFormService.step2_productPlantOverview);
    this.enableHasCommentControls(this.productPlanFormService.step3_valueChain);
    this.enableHasCommentControls(this.productPlanFormService.step4_saudization);
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

  enableAllForms(): void {
    this.productPlanFormService.step1_overviewCompanyInformation.enable();
    this.productPlanFormService.step2_productPlantOverview.enable();
    this.productPlanFormService.step3_valueChain.enable();
    this.productPlanFormService.step4_saudization.enable();

    // Re-disable opportunityType and submissionDate after enabling all forms
    // Only set values if they're not already set (for create mode)
    this.disableReadOnlyFields(false);
  }

  /**
   * Enable all forms without resetting read-only field values (for edit mode)
   */
  private enableAllFormsWithoutResettingReadOnly(): void {
    this.productPlanFormService.step1_overviewCompanyInformation.enable();
    this.productPlanFormService.step2_productPlantOverview.enable();
    this.productPlanFormService.step3_valueChain.enable();
    this.productPlanFormService.step4_saudization.enable();

    // Disable read-only fields without resetting their values
    this.disableReadOnlyFields(true);
  }

  /**
   * Initialize opportunity from applied opportunity (when user applies to an opportunity)
   */
  private initializeOpportunityFromApplied(): void {
    const appliedOpportunity = this.planStore.appliedOpportunity();
    const availableOpportunities = this.planStore.availableOpportunities();

    if (appliedOpportunity && availableOpportunities.length > 0) {
      const basicInfoForm = this.productPlanFormService.basicInformationFormGroup;
      const opportunityControl = basicInfoForm?.get(EMaterialsFormControls.opportunity);

      if (opportunityControl) {
        // Set the opportunity value from available opportunities
        opportunityControl.setValue(availableOpportunities[0]);
        // Disable the opportunity field
        opportunityControl.disable({ emitEvent: false });
      }
    }
  }

  /**
   * Load available opportunities for create mode (when creating from scratch)
   */
  private loadAvailableOpportunities(): void {
    // Ensure opportunity field is enabled when creating from scratch
    const basicInfoForm = this.productPlanFormService.basicInformationFormGroup;
    const opportunityControl = basicInfoForm?.get(EMaterialsFormControls.opportunity);
    if (opportunityControl && opportunityControl.disabled) {
      opportunityControl.enable({ emitEvent: false });
    }

    const opportunityType = this.planStore.newPlanOpportunityType();
    if (opportunityType) {
      this.planStore.getActiveOpportunityLookUps()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe();
    }
  }

  /**
   * Disable read-only fields that should always be disabled
   * @param preserveValues If true, only disable without resetting values (for edit mode). If false, set default values (for create mode).
   */
  private disableReadOnlyFields(preserveValues: boolean = false): void {
    const basicInfo = this.productPlanFormService.basicInformationFormGroup;
    if (basicInfo) {
      const opportunityTypeControl = basicInfo.get(EMaterialsFormControls.opportunityType);
      if (opportunityTypeControl) {
        if (!preserveValues) {
          opportunityTypeControl.setValue(EOpportunityType.PRODUCT.toString());
        }
        opportunityTypeControl.disable({ emitEvent: false });
      }
      const submissionDateControl = basicInfo.get(EMaterialsFormControls.submissionDate);
      if (submissionDateControl) {
        if (!preserveValues) {
          submissionDateControl.setValue(new Date());
        }
        submissionDateControl.disable({ emitEvent: false });
      }
    }
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
      this.resubmitProductLocalizationPlan(formData);
    } else {
      // Map form values to request structure with signature
      const request = mapProductLocalizationPlanFormToRequest(
        this.productPlanFormService,
        currentPlanId,
        signature
      );

      // Convert request to FormData
      const formData = convertRequestToFormData(request);

      // Call store method to submit plan
      this.submitProductLocalizationPlan(formData);
    }
  }

  submitProductLocalizationPlan(formData: FormData): void {
    this.planStore.submitProductLocalizationPlan(formData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isProcessing.set(false);
          this.toasterService.success(this.i18nService.translate('plans.wizard.messages.submitSuccess'));
          // Reset all forms after successful submission
          this.productPlanFormService.resetAllForms();
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
        }
      });
  }

  resubmitProductLocalizationPlan(formData: FormData): void {
    this.planStore.investorResubmitProductPlan(formData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isProcessing.set(false);
          this.toasterService.success(this.i18nService.translate('plans.wizard.messages.submitSuccess'));
          // Reset all forms after successful submission
          this.productPlanFormService.resetAllForms();
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
        }
      });
  }

  onSubmissionCancel(): void {
    this.showSubmissionModal.set(false);
  }

  /** Updates validation errors map for stepper error indicators. */
  updateValidationErrors(errors: Map<number, IStepValidationStatus>): void {
    const errorMap = new Map<number, boolean>();
    errors.forEach((stepErrors, stepNumber) => {
      errorMap.set(stepNumber, stepErrors.hasErrors);
    });
    this.validationErrors.set(errorMap);
  }

  saveAsDraft(): void {
    // Access nested form controls correctly
    const basicInfoFormGroup = this.productPlanFormService.basicInformationFormGroup;
    const planTitleControl = basicInfoFormGroup?.get(EMaterialsFormControls.planTitle)?.get(EMaterialsFormControls.value)
    const planTitle = planTitleControl?.value;
    const opportunityControl = basicInfoFormGroup?.get(EMaterialsFormControls.opportunity);
    const opportunity = basicInfoFormGroup?.get(EMaterialsFormControls.opportunity)?.value;
    // Check if plan title and opportunity are selected
    if (!planTitle) {
      planTitleControl?.markAsDirty()
      planTitleControl?.markAsTouched();
      basicInfoFormGroup?.get(EMaterialsFormControls.planTitle)?.updateValueAndValidity()
      this.toasterService.error('Plan title is required to save as draft');
      return;
    }
    if (!opportunity) {
      opportunityControl?.markAsDirty();
      opportunityControl?.markAsTouched();
      this.toasterService.error('Please select opportunity to save as draft');
      return;
    }

    // Validate step 03 value chain (check if step 3 has any data)
    const validationError = this.validateStep03ValueChain();
    if (validationError) {
      this.toasterService.error(validationError);
      return;
    }

    // Get plan ID if in edit mode
    const currentPlanId = this.planStore.wizardMode() === 'edit' ? (this.planStore.selectedPlanId() ?? '') : '';
    const isEditMode = this.planStore.wizardMode() === 'edit';

    // Map form values to request structure
    const request = mapProductLocalizationPlanFormToRequest(this.productPlanFormService, currentPlanId);

    // Convert request to FormData
    const formData = convertRequestToFormData(request);

    // Set processing state
    this.isProcessing.set(true);

    // Call store method to save as draft
    this.planStore.saveAsDraftProductLocalizationPlan(formData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isProcessing.set(false);
          const successMessage = isEditMode
            ? this.i18nService.translate('plans.wizard.messages.draftUpdatedSuccess')
            : this.i18nService.translate('plans.wizard.messages.draftSavedSuccess');
          this.toasterService.success(successMessage);

          // Only reset forms if not in edit mode (to preserve data)
          if (!isEditMode) {
            this.productPlanFormService.resetAllForms();
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
          this.toasterService.error(this.i18nService.translate('plans.wizard.messages.draftError'));
        }
      });
  }

  /**
   * Validates step 03 value chain form arrays.
   * For every form array item that has a value in cost, in-house, or years but empty expenseHeader,
   * marks that expenseHeader control as dirty. Marks all invalid expenseHeader controls across all
   * sections, then returns a single error message if any were invalid.
   */
  private validateStep03ValueChain(): string | null {
    const formArrays = [
      { name: 'Design & Engineering', formArray: this.productPlanFormService.getValueChainSectionFormArray(EMaterialsFormControls.designEngineeringFormGroup) },
      { name: 'Sourcing', formArray: this.productPlanFormService.getValueChainSectionFormArray(EMaterialsFormControls.sourcingFormGroup) },
      { name: 'Manufacturing', formArray: this.productPlanFormService.getValueChainSectionFormArray(EMaterialsFormControls.manufacturingFormGroup) },
      { name: 'Assembly & Testing', formArray: this.productPlanFormService.getValueChainSectionFormArray(EMaterialsFormControls.assemblyTestingFormGroup) },
      { name: 'After-Sales', formArray: this.productPlanFormService.getValueChainSectionFormArray(EMaterialsFormControls.afterSalesFormGroup) }
    ];

    const invalidExpenseHeaderControls: { control: FormControl<unknown>; sectionName: string }[] = [];

    for (const section of formArrays) {
      if (!section.formArray) {
        continue;
      }

      for (let i = 0; i < section.formArray.length; i++) {
        const itemControl = section.formArray.at(i) as any; // FormGroup
        if (!itemControl) {
          continue;
        }

        const expenseHeaderControl = itemControl.get(EMaterialsFormControls.expenseHeader);
        const costPercentageControl = itemControl.get(EMaterialsFormControls.costPercentage);
        const inHouseOrProcuredControl = itemControl.get(EMaterialsFormControls.inHouseOrProcured);
        const yearControls = [
          itemControl.get(EMaterialsFormControls.year1),
          itemControl.get(EMaterialsFormControls.year2),
          itemControl.get(EMaterialsFormControls.year3),
          itemControl.get(EMaterialsFormControls.year4),
          itemControl.get(EMaterialsFormControls.year5),
          itemControl.get(EMaterialsFormControls.year6),
          itemControl.get(EMaterialsFormControls.year7)
        ];

        const expenseHeaderValueControl = expenseHeaderControl ? this.productPlanFormService.getValueControl(expenseHeaderControl) : null;
        const costPercentageValueControl = costPercentageControl ? this.productPlanFormService.getValueControl(costPercentageControl) : null;
        const inHouseOrProcuredValueControl = inHouseOrProcuredControl ? this.productPlanFormService.getValueControl(inHouseOrProcuredControl) : null;
        const yearValueControls = yearControls
          .filter(control => control !== null)
          .map(control => this.productPlanFormService.getValueControl(control!));

        const hasDirtyControl =
          (costPercentageValueControl?.dirty) ||
          (inHouseOrProcuredValueControl?.dirty) ||
          yearValueControls.some(control => control?.dirty);

        const hasValue =
          (costPercentageValueControl?.value) ||
          (inHouseOrProcuredValueControl?.value) ||
          yearValueControls.some(control => control?.value);

        if (hasDirtyControl && expenseHeaderValueControl && hasValue) {
          const expenseHeaderValue = expenseHeaderValueControl.value;
          if (!expenseHeaderValue || (typeof expenseHeaderValue === 'string' && expenseHeaderValue.trim() === '')) {
            invalidExpenseHeaderControls.push({ control: expenseHeaderValueControl, sectionName: section.name });
          }
        }
      }
    }

    // Mark all invalid expenseHeader controls as dirty
    const sectionNames = [...new Set(invalidExpenseHeaderControls.map(x => x.sectionName))];
    for (const { control } of invalidExpenseHeaderControls) {
      control?.markAsDirty();
      control?.updateValueAndValidity();
    }

    if (invalidExpenseHeaderControls.length > 0) {
      const sectionsText = sectionNames.length === 1
        ? sectionNames[0]
        : sectionNames.join(', ');
      return `Expense Header is required in ${sectionsText} section(s). Please fill it before saving as draft.`;
    }

    return null;
  }

  onConfirmLeave(): void {
    this.showConfirmLeaveDialog.set(false);
    this.productPlanFormService.resetAllForms();
    this.activeStep.set(1);
    this.doRefresh.emit();
    this.visibility.set(false);
    this.isSubmitted.set(false);
    // Reset wizard state in store
    this.planStore.resetWizardState();
  }

  onContinueEditing(): void {
    this.showConfirmLeaveDialog.set(false);
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

  ngOnDestroy(): void {
    this.productPlanFormService.resetAllForms();
    this.opportunitiesStore.resetOpportunityLocalizationTablesValidation();
  }

  /** Step comment descriptors for shared collect/validate logic. */
  private getCommentDescriptors(): IPlanWizardStepCommentDescriptor[] {
    return [
      { stepIndex: 0, getForm: () => this.productPlanFormService.overviewCompanyInformation, getCommentPhase: () => this.step1CommentPhase(), getSelectedInputs: () => this.step1SelectedInputs(), setSelectedInputs: (inputs) => this.step1SelectedInputs.set(inputs), getComments: () => this.step1Comments(), getCommentFields: () => this.step1CommentFields(), getStepTitle: () => this.steps()[0]?.title ?? '' },
      { stepIndex: 1, getForm: () => this.productPlanFormService.step2_productPlantOverview, getCommentPhase: () => this.step2CommentPhase(), getSelectedInputs: () => this.step2SelectedInputs(), setSelectedInputs: (inputs) => this.step2SelectedInputs.set(inputs), getComments: () => this.step2Comments(), getCommentFields: () => this.step2CommentFields(), getStepTitle: () => this.steps()[1]?.title ?? '' },
      { stepIndex: 2, getForm: () => this.productPlanFormService.step3_valueChain, getCommentPhase: () => this.step3CommentPhase(), getSelectedInputs: () => this.step3SelectedInputs(), setSelectedInputs: (inputs) => this.step3SelectedInputs.set(inputs), getComments: () => this.step3Comments(), getCommentFields: () => this.step3CommentFields(), getStepTitle: () => this.steps()[2]?.title ?? '' },
      { stepIndex: 3, getForm: () => this.productPlanFormService.step4_saudization, getCommentPhase: () => this.step4CommentPhase(), getSelectedInputs: () => this.step4SelectedInputs(), setSelectedInputs: (inputs) => this.step4SelectedInputs.set(inputs), getComments: () => this.step4Comments(), getCommentFields: () => this.step4CommentFields(), getStepTitle: () => this.steps()[3]?.title ?? '' },
    ];
  }

  override collectAllPageComments(): IPageComment[] {
    return this.collectAllPageCommentsFromDescriptors(this.getCommentDescriptors(), this.isResubmitMode());
  }

  protected override validateCommentSubmission(): string | null {
    return this.validateCommentSubmissionFromDescriptors(this.getCommentDescriptors(), (title, phase) => this.getSendBackErrorMessage(title, phase));
  }

  // Base class provides all the review/approval/rejection methods
  // We only need to implement the abstract methods and step-specific logic

  // Track original values and updated field keys for resubmit mode
  private originalValuesMap = new Map<string, unknown>();
  private updatedFieldsSet = new Set<string>();

  // Computed signal for remaining fields requiring update
  remainingFieldsRequiringUpdate = computed(() => {
    if (!this.isResubmitMode()) return 0;
    const totalCorrected = this.step1CorrectedFieldsFiltered().length +
      this.step2CorrectedFieldsFiltered().length +
      this.step3CorrectedFieldsFiltered().length +
      this.step4CorrectedFieldsFiltered().length;
    return totalCorrected - this.updatedFieldsSet.size;
  });

  collectInvestorPageComments(): IPageComment[] {
    return this.collectInvestorPageCommentsFromDescriptors(this.getCommentDescriptors());
  }

  // Implement abstract method: canInvestorSubmit
  override canInvestorSubmit(): boolean {
    if (!this.isResubmitMode()) return false;
    return this.remainingFieldsRequiringUpdate() === 0;
  }

  // Implement abstract method: buildResubmitFormData
  override buildResubmitFormData(): FormData {
    const planId = this.planStore.selectedPlanId() ?? '';

    // Build request (same as submit)
    const request = mapProductLocalizationPlanFormToRequest(
      this.productPlanFormService,
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
    const formData = convertRequestToFormData(request);

    const investorComments = this.collectInvestorPageComments();
    this.appendCommentsToFormData(formData, investorComments);
    return formData;
  }

  override getResubmitPlanType(): 'product' | 'service' {
    return 'product';
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
      // this.fillStepsFormsWithIncomingComments(this.getCommentDescriptors());
      this.markSelectedFieldsWithCheckboxes(this.getCommentDescriptors());
    }
  }

  /**
   * Resets selected inputs and hasComment controls for the current step
   * Called when employee clicks Add Comment to clear previous investor comment selections
   */
  protected override resetCurrentStepCommentSelections(stepId: ProductLocalizationWizardStepId | undefined): void {
    if (!stepId) return;

    // Reset stepper counter + highlight state (bound to selectedInputs)
    if (stepId === 'overview') {
      this.step1SelectedInputs.set([]);
      this.resetHasCommentControls(this.productPlanFormService.step1_overviewCompanyInformation);
      return;
    }

    if (stepId === 'productPlant') {
      this.step2SelectedInputs.set([]);
      this.resetHasCommentControls(this.productPlanFormService.step2_productPlantOverview);
      return;
    }

    if (stepId === 'valueChain') {
      this.step3SelectedInputs.set([]);
      this.resetHasCommentControls(this.productPlanFormService.step3_valueChain);
      return;
    }

    if (stepId === 'saudization') {
      this.step4SelectedInputs.set([]);
      this.resetHasCommentControls(this.productPlanFormService.step4_saudization);
      return;
    }
  }

  /**
   * Recursively resets all hasComment controls in a form to false
   */
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

  // Implement abstract methods from BasePlanWizard
  protected closeWizard(): void {
    this.visibility.set(false);
  }

  protected refresh(): void {
    this.doRefresh.emit();
  }

  get EInternalUserPlanStatus() {
    return EInternalUserPlanStatus;
  }
}
