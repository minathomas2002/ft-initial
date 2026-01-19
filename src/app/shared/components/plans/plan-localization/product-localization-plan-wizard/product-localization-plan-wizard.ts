import { ChangeDetectionStrategy, Component, computed, effect, inject, model, OnDestroy, output, signal, viewChild } from "@angular/core";
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
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { switchMap, catchError, finalize, of, map, tap } from "rxjs";
import { ToasterService } from "src/app/shared/services/toaster/toaster.service";
import { EMaterialsFormControls, EOpportunityType } from "src/app/shared/enums";
import { SubmissionConfirmationModalComponent } from "../../submission-confirmation-modal/submission-confirmation-modal.component";
import { IFieldInformation, IPageComment, IProductPlanResponse, Signature } from "src/app/shared/interfaces/plans.interface";
import { I18nService } from "src/app/shared/services/i18n/i18n.service";
import { HandlePlanStatusFactory } from "src/app/shared/services/plan/planStatusFactory/handle-plan-status-factory";
import { TimelineDialog } from "../../../timeline/timeline-dialog/timeline-dialog";
import { EInternalUserPlanStatus, IPlanRecord } from "src/app/shared/interfaces/dashboard-plans.interface";
import { PlanLocalizationStep05Summary } from "../plan-localization-step-05-summary/plan-localization-step-05-summary";
import { PlanLocalizationStep04SaudizationForm } from "../plan-localization-step-04-saudization/plan-localization-step-04-saudizationForm";
import { PlanLocalizationStep01OverviewCompanyInformationForm } from "../plan-localization-step-01-overviewCompanyInformation/plan-localization-step-01-overviewCompanyInformationForm";
import { PlanLocalizationStep02ProductPlantOverviewForm } from "../plan-localization-step-02-productPlantOverview/plan-localization-step-02-productPlantOverviewForm";
import { PlanLocalizationStep03ValueChainForm } from "../plan-localization-step-03-valueChain/plan-localization-step-03-valueChainForm";
import { GeneralConfirmationDialogComponent } from "../../../utility-components/general-confirmation-dialog/general-confirmation-dialog.component";
import { ApproveRejectDialogComponent } from "../../../utility-components/approve-reject-dialog/approve-reject-dialog.component";
import { TranslatePipe } from "../../../../pipes/translate.pipe";
import { TColors } from "src/app/shared/interfaces";
import { AuthStore } from "src/app/shared/stores/auth/auth.store";
import { ERoles } from "src/app/shared/enums/roles.enum";
import { EInvestorPlanStatus } from "src/app/shared/interfaces/dashboard-plans.interface";
import { PageCommentBox } from "../../page-comment-box/page-comment-box";
import { BasePlanWizard } from '../../base-wizard-class/base-plan-wizard';

export type TCommentPhase = 'none' | 'adding' | 'editing' | 'viewing';

@Component({
  selector: 'app-product-localization-plan-wizard',
  imports: [
    BaseWizardDialog,
    PlanLocalizationStep01OverviewCompanyInformationForm,
    PlanLocalizationStep02ProductPlantOverviewForm,
    PlanLocalizationStep03ValueChainForm,
    PlanLocalizationStep04SaudizationForm,
    PlanLocalizationStep05Summary,
    ButtonModule,
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
  productPlanFormService = inject(ProductPlanFormService);
  override readonly toasterService = inject(ToasterService);
  override readonly planStore = inject(PlanStore);
  validationService = inject(ProductPlanValidationService);
  private readonly i18nService = inject(I18nService);
  private readonly planStatusFactory = inject(HandlePlanStatusFactory);
  private readonly authStore = inject(AuthStore);
  visibility = model(false);
  activeStep = signal<number>(1);
  doRefresh = output<void>();
  isSubmitted = signal<boolean>(false);

  timelineVisibility = signal(false);
  selectedPlan = signal<IPlanRecord | null>(null);

  // Mode and plan ID from store
  mode = this.planStore.wizardMode;
  planId = this.planStore.selectedPlanId;
  canOpenTimeline = computed(() => {
    return (this.visibility() && (this.mode() == 'view' || this.mode() == 'Review' || this.mode() == 'resubmit') && this.planStatus() !== null && this.activeStep() < 5)
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

  commentColor = computed(() => {
    return (this.isViewMode() && this.planStore.planStatus() === EInternalUserPlanStatus.UNDER_REVIEW) ?
      'green' :
      (
        (this.step1CommentPhase() === 'none' && this.planStore.planStatus() === EInternalUserPlanStatus.UNDER_REVIEW) ?
          'green' : 'orange')
      ;
  });

  selectedInputColor = computed<TColors>(() => this.currentStepCommentPhase() === 'none' ? 'green' : 'orange');
  steps = computed<IWizardStepState[]>(() => {
    const errors = this.validationErrors();
    this.i18nService.currentLanguage();
    return [
      {
        title: this.i18nService.translate('plans.wizard.step1.title'),
        description: this.i18nService.translate('plans.wizard.step1.description'),
        isActive: this.activeStep() === 1,
        formState: this.productPlanFormService.overviewCompanyInformation,
        hasErrors: this.step1CommentPhase() === 'none',
        commentsCount: this.isViewMode() && this.planComments() ? this.step1CommentFields().length : this.step1SelectedInputs().length,
        commentColor: this.commentColor(),
      },
      {
        title: this.i18nService.translate('plans.wizard.step2.title'),
        description: this.i18nService.translate('plans.wizard.step2.description'),
        isActive: this.activeStep() === 2,
        formState: this.productPlanFormService.step2_productPlantOverview,
        hasErrors: this.step2CommentPhase() === 'none',
        commentsCount: this.isViewMode() && this.planComments() ? this.step2CommentFields().length : this.step2SelectedInputs().length,
        commentColor: this.commentColor(),
      },
      {
        title: this.i18nService.translate('plans.wizard.step3.title'),
        description: this.i18nService.translate('plans.wizard.step3.description'),
        isActive: this.activeStep() === 3,
        formState: this.productPlanFormService.step3_valueChain,
        hasErrors: this.step3CommentPhase() === 'none',
        commentsCount: this.isViewMode() && this.planComments() ? this.step3CommentFields().length : this.step3SelectedInputs().length,
        commentColor: this.commentColor(),
      },
      {
        title: this.i18nService.translate('plans.wizard.step4.title'),
        description: this.i18nService.translate('plans.wizard.step4.description'),
        isActive: this.activeStep() === 4,
        formState: this.productPlanFormService.step4_saudization,
        hasErrors: this.step4CommentPhase() === 'none',
        commentsCount: this.isViewMode() && this.planComments() ? this.step4CommentFields().length : this.step4SelectedInputs().length,
        commentColor: this.commentColor(),
      },
      {
        title: this.i18nService.translate('plans.wizard.step5.title'),
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
    return mode === 'view' || mode === 'Review' || mode === 'resubmit';
  });

  // Computed signals to map comments to each step based on pageTitleForTL
  step1Comments = computed<IPageComment[]>(() => {
    const comments = this.planComments()?.comments || [];
    // Match by step title translation key or actual title
    return comments.filter(c => {
      const stepTitle = this.i18nService.translate('plans.wizard.step1.title');
      return c.pageTitleForTL === stepTitle || c.pageTitleForTL === 'Overview & Company Information';
    });
  });

  step2Comments = computed<IPageComment[]>(() => {
    const comments = this.planComments()?.comments || [];
    const stepTitle = this.i18nService.translate('plans.wizard.step2.title');
    return comments.filter(c => c.pageTitleForTL === stepTitle || c.pageTitleForTL === 'Product Plant Overview');
  });

  step3Comments = computed<IPageComment[]>(() => {
    const comments = this.planComments()?.comments || [];
    const stepTitle = this.i18nService.translate('plans.wizard.step3.title');
    return comments.filter(c => c.pageTitleForTL === stepTitle || c.pageTitleForTL === 'Value Chain');
  });

  step4Comments = computed<IPageComment[]>(() => {
    const comments = this.planComments()?.comments || [];
    const stepTitle = this.i18nService.translate('plans.wizard.step4.title');
    return comments.filter(c => c.pageTitleForTL === stepTitle || c.pageTitleForTL === 'Saudization');
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

  // Computed signals for comment text display
  step1CommentText = computed<string>(() => {
    return this.step1Comments().map(c => c.comment).join('\n\n');
  });

  step2CommentText = computed<string>(() => {
    return this.step2Comments().map(c => c.comment).join('\n\n');
  });

  step3CommentText = computed<string>(() => {
    return this.step3Comments().map(c => c.comment).join('\n\n');
  });

  step4CommentText = computed<string>(() => {
    return this.step4Comments().map(c => c.comment).join('\n\n');
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
    return this.step1CommentText();
  }

  getIncomingStep2CommentText(): string {
    return this.step2CommentText();
  }

  getIncomingStep3CommentText(): string {
    return this.step3CommentText();
  }

  getIncomingStep4CommentText(): string {
    return this.step4CommentText();
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
  isLoading = signal(false);
  isLoadingPlan = signal(false);

  // Reference to Step 5 Summary component
  summaryComponent = viewChild<PlanLocalizationStep05Summary>('summaryComponent');

  // Submission confirmation modal
  showSubmissionModal = signal(false);
  existingSignature = signal<string | null>(null);
  planSignature = signal<Signature | null>(null);
  showConfirmLeaveDialog = model(false);
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
    const hasEmployeeId = !!userProfile.employeeID;
    const hasEmployeeRole = userProfile.roleCodes?.includes(ERoles.EMPLOYEE) ?? false;
    return hasEmployeeId || hasEmployeeRole;
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

  // Computed signals for plan status tag
  planStatus = signal<EInternalUserPlanStatus | null>(null);
  statusLabel = computed(() => {
    const status = this.planStatus();
    if (status === null) return 'Draft';
    const statusService = this.planStatusFactory.handleValidateStatus();
    return statusService.getStatusLabel(status);
  });
  statusBadgeClass = computed(() => {
    const status = this.planStatus();
    if (status === null) return 'bg-gray-50 text-gray-700 border-gray-200';
    const statusService = this.planStatusFactory.handleValidateStatus();
    return statusService.getStatusBadgeClass(status);
  });
  shouldShowStatusTag = computed(() => {
    const mode = this.planStore.wizardMode();
    return ['view', 'edit', 'Review', 'resubmit'].includes(mode);
  });

  showHasCommentControl = signal<boolean>(false);
  // Separate comment phases for each step
  step1CommentPhase = signal<TCommentPhase>('none');
  step2CommentPhase = signal<TCommentPhase>('none');
  step3CommentPhase = signal<TCommentPhase>('none');
  step4CommentPhase = signal<TCommentPhase>('none');

  // Computed signals for action controls
  hasSelectedFields = computed(() => {
    return this.step1SelectedInputs().length > 0 ||
      this.step2SelectedInputs().length > 0 ||
      this.step3SelectedInputs().length > 0 ||
      this.step4SelectedInputs().length > 0;
  });

  canApproveOrReject = computed(() => {
    return !this.hasSelectedFields() && !this.hasComments();
  });

  hasComments = computed(() => {
    // Check if any step has saved comments (comment phase is 'viewing' and comment exists)
    const step1Form = this.productPlanFormService.overviewCompanyInformation;
    const step1CommentControl = step1Form.get(EMaterialsFormControls.comment) as FormControl<string>;
    const step1HasComment = step1CommentControl?.value && step1CommentControl.value.trim().length > 0;

    // Step 2 comments
    const step2Form = this.productPlanFormService.step2_productPlantOverview;
    const step2CommentControl = step2Form.get(EMaterialsFormControls.comment) as FormControl<string>;
    const step2HasComment = step2CommentControl?.value && step2CommentControl.value.trim().length > 0;

    // Step 3 comments - check if step3SelectedInputs has items (indicates comment was saved)
    const step3HasComment = this.step3SelectedInputs().length > 0;

    // Step 4 comments
    const step4Form = this.productPlanFormService.step4_saudization;
    const step4CommentControl = step4Form.get(EMaterialsFormControls.comment) as FormControl<string>;
    const step4HasComment = step4CommentControl?.value && step4CommentControl.value.trim().length > 0;

    return step1HasComment || step2HasComment || step3HasComment || step4HasComment;
  });

  constructor() {
    super();
    // Effect to load plan data when planId and mode are set
    effect(() => {
      const currentPlanId = this.planStore.selectedPlanId();
      const currentMode = this.planStore.wizardMode();
      const isVisible = this.visibility();

      // Only process when dialog is visible
      if (!isVisible) {
        return;
      }

      if (currentPlanId && ['view', 'edit', 'Review', 'resubmit'].includes(currentMode)) {
        this.loadPlanData(currentPlanId);
      } else if (currentMode === 'create' && !currentPlanId) {
        // Reset forms for create mode - this will set opportunityType and submissionDate
        this.productPlanFormService.resetAllForms();
        this.enableAllForms();
        this.activeStep.set(1);
        this.isSubmitted.set(false);
        this.existingSignature.set(null);
        this.planStatus.set(null);

        // Handle opportunity based on whether user is applying to an opportunity or creating from scratch
        const appliedOpportunity = this.planStore.appliedOpportunity();
        if (appliedOpportunity) {
          // User is applying to an opportunity - use the opportunity from store and disable the field
          this.initializeOpportunityFromApplied();
        } else {
          // User is creating new plan from scratch - load available opportunities and enable the field
          this.loadAvailableOpportunities();
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

  onAddComment(): void {
    if (this.isResubmitMode()) {
      this.showCommentState.set(true);
      return
    }
    const step = this.activeStep();

    // Set comment phase for the current active step
    if (step === 1 && this.step1CommentPhase() === 'none') {
      this.step1CommentPhase.set('adding');
    } else if (step === 2 && this.step2CommentPhase() === 'none') {
      this.step2CommentPhase.set('adding');
    } else if (step === 3 && this.step3CommentPhase() === 'none') {
      this.step3CommentPhase.set('adding');
    } else if (step === 4 && this.step4CommentPhase() === 'none') {
      this.step4CommentPhase.set('adding');
    }
    this.showHasCommentControl.set(true);
  }

  onSummarySubmitClick(): void {
    // Check if all forms are valid
    if (!this.productPlanFormService.areAllFormsValid()) {
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

  loadPlanData(planId: string): void {
    this.isLoadingPlan.set(true);
    this.planStore.getProductPlan(planId)
      .pipe(
        switchMap((response) => {
          if (!response.body) {
            return of(null);
          }

          // Get opportunity details and update availableOpportunities for edit mode
          const opportunityId = response.body.productPlan?.overviewCompanyInfo?.basicInfo?.opportunityId;
          const isEditOrViewOrReviewMode = this.planStore.wizardMode() === 'edit' || this.planStore.wizardMode() === 'view' || this.planStore.wizardMode() === 'Review';

          if (opportunityId && isEditOrViewOrReviewMode) {
            // Chain opportunity details loading, catch errors to continue with form mapping
            return this.planStore.getOpportunityDetailsAndUpdateOptions(opportunityId)
              .pipe(
                map(() => response.body),
                catchError((error) => {
                  console.error('Error loading opportunity details:', error);
                  // Return the response body so we can still map the form data even if opportunity loading fails
                  return of(response.body);
                })
              );
          } else {
            // Map response to form directly if no opportunity ID or not in edit/view mode
            return of(response.body);
          }
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
      .subscribe((responseBody) => {
        if (responseBody) {
          const status = responseBody.productPlan.status ?? null;
          this.planStatus.set(status);
          // Set plan status in store
          if (status !== null) {
            this.planStore.setPlanStatus(status);
          }
          this.mapPlanDataToForm(responseBody);
        }
      });
  }

  private mapPlanDataToForm(response: IProductPlanResponse): void {
    // Store original plan response for before/after comparison
    this.originalPlanResponse.set(response);

    // Map response to form
    mapProductPlanResponseToForm(response, this.productPlanFormService);

    // Store signature for summary display (view/edit modes)
    this.planSignature.set(response.signature ?? null);

    // Store existing signature if present
    if (response.signature?.signatureValue) {
      this.existingSignature.set(response.signature.signatureValue);
    }

    const currentMode = this.planStore.wizardMode();
    const planStatusValue = response.productPlan?.status;

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

    this.isLoadingPlan.set(false);
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
        .subscribe({
          next: () => {
            // Opportunities loaded successfully - opportunity field remains enabled
          },
          error: (error) => {
            console.error('Error loading available opportunities:', error);
          }
        });
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

    const locationInfo = this.productPlanFormService.locationInformationFormGroup;
    if (locationInfo) {
      const registeredVendorIDControl = locationInfo.get(EMaterialsFormControls.registeredVendorIDwithSEC);
      if (registeredVendorIDControl) {
        if (!preserveValues) {
          registeredVendorIDControl.setValue('');
        }
        registeredVendorIDControl.disable({ emitEvent: false });
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

    // Get plan ID if in edit mode
    const currentPlanId = this.planStore.wizardMode() === 'edit' ? (this.planStore.selectedPlanId() ?? '') : '';

    // Map form values to request structure with signature
    const request = mapProductLocalizationPlanFormToRequest(
      this.productPlanFormService,
      currentPlanId,
      signature
    );

    // Convert request to FormData
    const formData = convertRequestToFormData(request);

    // Set processing state
    this.isProcessing.set(true);

    // Call store method to submit plan
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
          console.error('Error submitting plan:', error);
        }
      });
  }

  onSubmissionCancel(): void {
    this.showSubmissionModal.set(false);
  }

  /**
   * Updates validation errors map for stepper error indicators
   */
  updateValidationErrors(errors: Map<number, any>): void {
    const errorMap = new Map<number, boolean>();
    errors.forEach((stepErrors, stepNumber) => {
      errorMap.set(stepNumber, stepErrors.hasErrors);
    });
    this.validationErrors.set(errorMap);
  }

  saveAsDraft(): void {
    // Access nested form controls correctly
    const basicInfoFormGroup = this.productPlanFormService.basicInformationFormGroup;
    const planTitleControl = basicInfoFormGroup?.get(EMaterialsFormControls.planTitle);
    const planTitle = planTitleControl instanceof FormGroup
      ? planTitleControl.get(EMaterialsFormControls.value)?.value
      : planTitleControl?.value;
    const opportunity = basicInfoFormGroup?.get(EMaterialsFormControls.opportunity)?.value;

    // Check if plan title and opportunity are selected
    if (!planTitle) {
      this.toasterService.error('Plan title is required');
      return;
    }
    if (!planTitle || !opportunity) {
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
          console.error('Error saving draft:', error);
        }
      });
  }

  /**
   * Validates step 03 value chain form arrays
   * If any form array item has dirty controls (cost, inhouse, or years) but expenseHeader is empty,
   * marks expenseHeader as dirty and returns error message
   */
  private validateStep03ValueChain(): string | null {
    const formArrays = [
      { name: 'Design & Engineering', formArray: this.productPlanFormService.getValueChainSectionFormArray(EMaterialsFormControls.designEngineeringFormGroup) },
      { name: 'Sourcing', formArray: this.productPlanFormService.getValueChainSectionFormArray(EMaterialsFormControls.sourcingFormGroup) },
      { name: 'Manufacturing', formArray: this.productPlanFormService.getValueChainSectionFormArray(EMaterialsFormControls.manufacturingFormGroup) },
      { name: 'Assembly & Testing', formArray: this.productPlanFormService.getValueChainSectionFormArray(EMaterialsFormControls.assemblyTestingFormGroup) },
      { name: 'After-Sales', formArray: this.productPlanFormService.getValueChainSectionFormArray(EMaterialsFormControls.afterSalesFormGroup) }
    ];

    for (const section of formArrays) {
      if (!section.formArray) {
        continue;
      }

      for (let i = 0; i < section.formArray.length; i++) {
        const itemControl = section.formArray.at(i) as any; // FormGroup
        if (!itemControl) {
          continue;
        }

        // Get form controls
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

        // Get actual value controls using getValueControl helper
        const expenseHeaderValueControl = expenseHeaderControl ? this.productPlanFormService.getValueControl(expenseHeaderControl) : null;
        const costPercentageValueControl = costPercentageControl ? this.productPlanFormService.getValueControl(costPercentageControl) : null;
        const inHouseOrProcuredValueControl = inHouseOrProcuredControl ? this.productPlanFormService.getValueControl(inHouseOrProcuredControl) : null;
        const yearValueControls = yearControls
          .filter(control => control !== null)
          .map(control => this.productPlanFormService.getValueControl(control!));

        // Check if any of these controls are dirty
        const hasDirtyControl =
          (costPercentageValueControl?.dirty) ||
          (inHouseOrProcuredValueControl?.dirty) ||
          yearValueControls.some(control => control?.dirty);

        // If any control is dirty, check if expenseHeader is filled
        if (hasDirtyControl && expenseHeaderValueControl) {
          const expenseHeaderValue = expenseHeaderValueControl.value;
          if (!expenseHeaderValue || (typeof expenseHeaderValue === 'string' && expenseHeaderValue.trim() === '')) {
            // Mark expenseHeader as dirty
            expenseHeaderValueControl.markAsDirty();
            expenseHeaderValueControl.updateValueAndValidity();
            return `Expense Header is required in ${section.name} section. Please fill it before saving as draft.`;
          }
        }
      }
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
  }

  /**
   * Collect all page comments from step forms
   */
  override collectAllPageComments(): IPageComment[] {
    const comments: IPageComment[] = [];

    // Step 1 comments
    const step1Form = this.productPlanFormService.overviewCompanyInformation;
    const step1CommentControl = step1Form.get(EMaterialsFormControls.comment) as FormControl<string>;
    if (step1CommentControl?.value && step1CommentControl.value.trim().length > 0 && this.step1SelectedInputs().length > 0) {
      comments.push({
        pageTitleForTL: this.steps()[0].title,
        comment: step1CommentControl.value.trim(),
        fields: this.step1SelectedInputs(),
      });
    }

    // Step 2 comments
    const step2Form = this.productPlanFormService.step2_productPlantOverview;
    const step2CommentControl = step2Form.get(EMaterialsFormControls.comment) as FormControl<string>;
    if (step2CommentControl?.value && step2CommentControl.value.trim().length > 0 && this.step2SelectedInputs().length > 0) {
      comments.push({
        pageTitleForTL: this.steps()[1].title,
        comment: step2CommentControl.value.trim(),
        fields: this.step2SelectedInputs(),
      });
    }

    // Step 3 comments
    const step3Form = this.productPlanFormService.step3_valueChain;
    const step3CommentControl = step3Form.get(EMaterialsFormControls.comment) as FormControl<string>;
    if (step3CommentControl?.value && step3CommentControl.value.trim().length > 0 && this.step3SelectedInputs().length > 0) {
      comments.push({
        pageTitleForTL: this.steps()[2].title,
        comment: step3CommentControl.value.trim(),
        fields: this.step3SelectedInputs(),
      });
    }

    // Step 4 comments
    const step4Form = this.productPlanFormService.step4_saudization;
    const step4CommentControl = step4Form.get(EMaterialsFormControls.comment) as FormControl<string>;
    if (step4CommentControl?.value && step4CommentControl.value.trim().length > 0 && this.step4SelectedInputs().length > 0) {
      comments.push({
        pageTitleForTL: this.steps()[3].title,
        comment: step4CommentControl.value.trim(),
        fields: this.step4SelectedInputs(),
      });
    }
    return comments;
  }
  /**
   * Validate that steps with selected inputs have submitted comments (not in 'adding' or 'editing' phase)
   */
  protected override validateCommentSubmission(): string | null {
    // Check Step 1 (Overview & Company Information)
    if (this.step1SelectedInputs().length > 0 &&
      (this.step1CommentPhase() === 'adding' || this.step1CommentPhase() === 'editing')) {
      return this.getSendBackErrorMessage(this.steps()[0].title, this.step1CommentPhase());
    }

    // Check Step 2 (Product & Plant Overview)
    if (this.step2SelectedInputs().length > 0 &&
      (this.step2CommentPhase() === 'adding' || this.step2CommentPhase() === 'editing')) {
      return this.getSendBackErrorMessage(this.steps()[1].title, this.step2CommentPhase());
    }

    // Check Step 3 (Value Chain)
    if (this.step3SelectedInputs().length > 0 &&
      (this.step3CommentPhase() === 'adding' || this.step3CommentPhase() === 'editing')) {
      return this.getSendBackErrorMessage(this.steps()[2].title, this.step3CommentPhase());
    }

    // Check Step 4 (Saudization)
    if (this.step4SelectedInputs().length > 0 &&
      (this.step4CommentPhase() === 'adding' || this.step4CommentPhase() === 'editing')) {
      return this.getSendBackErrorMessage(this.steps()[3].title, this.step4CommentPhase());
    }

    return null;
  }

  // Base class provides all the review/approval/rejection methods
  // We only need to implement the abstract methods and step-specific logic

  // Track original values for resubmit mode
  private originalValuesMap = new Map<string, any>();
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

  // Collect investor page comments (from investorCommentControl in each step)
  collectInvestorPageComments(): IPageComment[] {
    const comments: IPageComment[] = [];

    // Step 1 investor comments
    const step1Form = this.productPlanFormService.overviewCompanyInformation;
    const step1InvestorCommentControl = step1Form.get('investorComment') as FormControl<string> | null;
    if (step1InvestorCommentControl?.value && step1InvestorCommentControl.value.trim().length > 0) {
      // Get selected inputs from step1 (fields that investor has corrected)
      const correctedFields = this.step1CommentFields().filter(f => f.id);
      if (correctedFields.length > 0) {
        comments.push({
          pageTitleForTL: this.steps()[0].title,
          comment: step1InvestorCommentControl.value.trim(),
          fields: correctedFields,
        });
      }
    }

    // Step 2 investor comments
    const step2Form = this.productPlanFormService.step2_productPlantOverview;
    const step2InvestorCommentControl = step2Form.get('investorComment') as FormControl<string> | null;
    if (step2InvestorCommentControl?.value && step2InvestorCommentControl.value.trim().length > 0) {
      const correctedFields = this.step2CommentFields().filter(f => f.id);
      if (correctedFields.length > 0) {
        comments.push({
          pageTitleForTL: this.steps()[1].title,
          comment: step2InvestorCommentControl.value.trim(),
          fields: correctedFields,
        });
      }
    }

    // Step 3 investor comments
    const step3Form = this.productPlanFormService.step3_valueChain;
    const step3InvestorCommentControl = step3Form.get('investorComment') as FormControl<string> | null;
    if (step3InvestorCommentControl?.value && step3InvestorCommentControl.value.trim().length > 0) {
      const correctedFields = this.step3CommentFields().filter(f => f.id);
      if (correctedFields.length > 0) {
        comments.push({
          pageTitleForTL: this.steps()[2].title,
          comment: step3InvestorCommentControl.value.trim(),
          fields: correctedFields,
        });
      }
    }

    // Step 4 investor comments
    const step4Form = this.productPlanFormService.step4_saudization;
    const step4InvestorCommentControl = step4Form.get('investorComment') as FormControl<string> | null;
    if (step4InvestorCommentControl?.value && step4InvestorCommentControl.value.trim().length > 0) {
      const correctedFields = this.step4CommentFields().filter(f => f.id);
      if (correctedFields.length > 0) {
        comments.push({
          pageTitleForTL: this.steps()[3].title,
          comment: step4InvestorCommentControl.value.trim(),
          fields: correctedFields,
        });
      }
    }

    return comments;
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

    // Append investor page comments as JSON string
    const investorComments = this.collectInvestorPageComments();
    if (investorComments.length > 0) {
      formData.append('comments', JSON.stringify(investorComments));
    }

    return formData;
  }

  // Implement abstract method: getResubmitPlanType
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
  }

  // Implement abstract methods from BasePlanWizard
  protected closeWizard(): void {
    this.visibility.set(false);
  }

  protected refresh(): void {
    this.doRefresh.emit();
  }
}
