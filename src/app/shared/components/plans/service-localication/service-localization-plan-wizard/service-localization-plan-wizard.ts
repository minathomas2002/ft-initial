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
import { ConfirmLeaveDialogComponent } from '../../../utility-components/confirm-leave-dialog/confirm-leave-dialog.component';
import { Signature } from 'src/app/shared/interfaces/plans.interface';
import { mapServiceLocalizationPlanFormToRequest, convertServiceRequestToFormData, mapServicePlanResponseToForm } from 'src/app/shared/utils/service-localization-plan.mapper';
import { ToasterService } from 'src/app/shared/services/toaster/toaster.service';
import { switchMap, of, map, catchError, finalize } from 'rxjs';
import { GeneralConfirmationDialogComponent } from "../../../utility-components/general-confirmation-dialog/general-confirmation-dialog.component";
import { TranslatePipe } from "../../../../pipes/translate.pipe";

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
    return this.visibility() && this.mode() === 'view' && this.planStatus() !== null;
  });

  // Submission confirmation modal
  showSubmissionModal = signal(false);
  existingSignature = signal<string | null>(null);
  showConfirmLeaveDialog = model(false);
  // Conditional step flags - initialize as false so all steps are visible initially
  showExistingSaudiStep = signal(false);
  showDirectLocalizationStep = signal(false);


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
      description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit',
      formState: this.serviceLocalizationFormService.step1_coverPage,
      hasErrors: true,
    });

    pushStep({
      id: 'overview',
      title: 'Overview',
      description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit',
      formState: this.serviceLocalizationFormService.step2_overview,
      hasErrors: true,
    });

    if (this.showExistingSaudiStep()) {
      pushStep({
        id: 'existingSaudi',
        title: 'Existing Saudi Co.',
        description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit',
        formState: this.serviceLocalizationFormService.step3_existingSaudi,
        hasErrors: true,
      });
    }

    if (this.showDirectLocalizationStep()) {
      pushStep({
        id: 'directLocalization',
        title: 'Direct Localization',
        description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit',
        formState: this.serviceLocalizationFormService.step4_directLocalization,
        hasErrors: true,
      });
    }

    // Summary always last
    pushStep({
      id: 'summary',
      title: 'Summary',
      description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit',
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
  shouldShowStatusTag = computed(() => {
    const mode = this.planStore.wizardMode();
    const status = this.planStatus();
    return (mode === 'view' || mode === 'edit') && status !== null;
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
    }, { allowSignalWrites: true });

    // Effect to load plan data when planId and mode are set (mirrors product localization wizard)
    effect(() => {
      const currentPlanId = this.planStore.selectedPlanId();
      const currentMode = this.planStore.wizardMode();
      const isVisible = this.visibility();

      if (!isVisible) return;

      if (currentPlanId && (currentMode === 'edit' || currentMode === 'view')) {
        this.loadPlanData(currentPlanId);
      } else if (currentMode === 'create' && !currentPlanId) {
        this.serviceLocalizationFormService.resetAllForms();
        this.enableAllForms();
        this.activeStep.set(1);
        this.isSubmitted.set(false);
        this.existingSignature.set(null);
        this.planStore.setPlanStatus(null);
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

        const currentMode = this.planStore.wizardMode();
        if (currentMode === 'view') {
          this.disableAllForms();
          this.activeStep.set(this.stepsWithId().length);
        } else if (currentMode === 'edit') {
          this.enableAllForms();
          const basicInfo = this.serviceLocalizationFormService.basicInformationFormGroup;
          const opportunityControl = basicInfo?.get(EMaterialsFormControls.opportunity);
          opportunityControl?.disable({ emitEvent: true });
        }

      });
  }

  private disableAllForms(): void {
    this.serviceLocalizationFormService.step1_coverPage.disable({ emitEvent: false });
    this.serviceLocalizationFormService.step2_overview.disable({ emitEvent: false });
    this.serviceLocalizationFormService.step3_existingSaudi.disable({ emitEvent: false });
    this.serviceLocalizationFormService.step4_directLocalization.disable({ emitEvent: false });
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
  }

  // Initialize watcher on service details form array to set flags
  private listenToConditionalSteps() {
    const detailsArray = this.serviceLocalizationFormService.getServiceDetailsFormArray();
    if (!detailsArray) return;

    const evaluate = () => {
      const items = (detailsArray.value ?? []) as Array<{ serviceLocalizationMethodology?: { value?: unknown } }>;
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
    };

    // Evaluate once (handles edit/view prefilled forms), then react to changes
    evaluate();
    detailsArray.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(evaluate);
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

      // Already submitted, close without confirmation
      this.visibility.set(false);
      this.activeStep.set(1);
      this.doRefresh.emit();
      this.isSubmitted.set(false);
      this.planStore.resetWizardState();
    }
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
          this.toasterService.success(this.i18nService.translate('plans.wizard.messages.draftSaved'));
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

  ngOnDestroy(): void {
    this.serviceLocalizationFormService.resetAllForms();
  }
}
