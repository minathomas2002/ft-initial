import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  model,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { ELocalizationMethodology } from 'src/app/shared/enums';
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
import { IPlanRecord } from 'src/app/shared/interfaces/dashboard-plans.interface';
import { mapServiceLocalizationPlanFormToRequest, convertServiceRequestToFormData } from 'src/app/shared/utils/service-localization-plan.mapper';
import { ToasterService } from 'src/app/shared/services/toaster/toaster.service';

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
    ConfirmLeaveDialogComponent,
  ],
  templateUrl: './service-localization-plan-wizard.html',
  styleUrl: './service-localization-plan-wizard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceLocalizationPlanWizard implements OnInit {
  planStore = inject(PlanStore);
  i18nService = inject(I18nService);
  planStatusFactory = inject(HandlePlanStatusFactory);
  serviceLocalizationFormService = inject(ServicePlanFormService);
  toasterService = inject(ToasterService);

  visibility = model(false);
  doRefresh = output<void>();
  isLoading = signal(false);
  activeStep = signal<number>(1);
  destroyRef = inject(DestroyRef);

  timelineVisibility = signal(false);
  isSubmitted = signal(false);
  selectedPlan = signal<IPlanRecord | null>(null);

  // Mode and plan ID from store
  mode = this.planStore.wizardMode;
  planId = this.planStore.selectedPlanId;
  canOpenTimeline = computed(() => {
    return (this.visibility() && this.mode() == 'view' && this.planStatus() !== null)
  });

  // Submission confirmation modal
  showSubmissionModal = signal(false);
  existingSignature = signal<string | null>(null);
  showConfirmLeaveDialog = model(false);

  steps = computed<IWizardStepState[]>(() => {
    this.i18nService.currentLanguage();
    const list: IWizardStepState[] = [];

    // Always present steps
    list.push({
      title: 'Cover Page',
      description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit',
      isActive: this.activeStep() === list.length + 1,
      formState: this.serviceLocalizationFormService.step1_coverPage,
      hasErrors: true,
    });

    list.push({
      title: 'Overview',
      description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit',
      isActive: this.activeStep() === list.length + 1,
      formState: this.serviceLocalizationFormService.step2_overview,
      hasErrors: true,
    });

    if (this.showExistingSaudiStep()) {
      list.push({
        title: 'Existing Saudi Co.',
        description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit',
        isActive: this.activeStep() === list.length + 1,
        formState: this.serviceLocalizationFormService.step3_existingSaudi,
        hasErrors: true,
      });
    }

    if (this.showDirectLocalizationStep()) {
      list.push({
        title: 'Direct Localization',
        description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit',
        isActive: this.activeStep() === list.length + 1,
        formState: this.serviceLocalizationFormService.step4_directLocalization,
        hasErrors: true,
      });
    }

    // Summary always last
    list.push({
      title: 'Summary',
      description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit',
      isActive: this.activeStep() === list.length + 1,
      formState: null,
      hasErrors: false,
    });

    return list;
  });

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

  // Conditional step flags - initialize as true so all steps are visible initially
  showExistingSaudiStep = signal(true);
  showDirectLocalizationStep = signal(true);

  ngOnInit(): void {
    this.listenToConditionalSteps();
  }

  // Initialize watcher on service details form array to set flags
  private listenToConditionalSteps() {
    const detailsArray = this.serviceLocalizationFormService.getServiceDetailsFormArray();
    const evaluate = () => {
      const items = detailsArray?.value ?? [];

      const getMethod = (it: any) => {
        const v = it?.serviceLocalizationMethodology;
        return !v?.value ? null : String(v?.value);
      };

      const allMethodologiesNull = items.every((it: any) => getMethod(it) === null);

      if (allMethodologiesNull) {
        this.showExistingSaudiStep.set(true);
        this.showDirectLocalizationStep.set(true);
      } else {
        this.showExistingSaudiStep.set(
          items.some((it: any) => getMethod(it) === ELocalizationMethodology.Collaboration.toString())
        );
        this.showDirectLocalizationStep.set(
          items.some((it: any) => getMethod(it) === ELocalizationMethodology.Direct.toString())
        );
      }
    };

    // Evaluate once (handles edit/view prefilled forms), then react to changes
    evaluate();
    detailsArray?.valueChanges?.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => evaluate());
  };

  previousStep(): void {
    this.activeStep.set(this.activeStep() - 1);
  }
  nextStep(): void {
    this.activeStep.set(this.activeStep() + 1);
  }

  navigateToStep(stepNumber: number): void {
    this.activeStep.set(stepNumber);
  }

  getStepIndex(title: string): number {
    const idx = this.steps().findIndex((s) => s.title === title);
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
    // Reset active step to 1 when closing
    this.activeStep.set(1);
    // Reset wizard state in store
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
    const request = mapServiceLocalizationPlanFormToRequest(
      this.serviceLocalizationFormService,
      currentPlanId,
      signature
    );

    // Convert request to FormData
    const formData = convertServiceRequestToFormData(request);

    console.log(request)

    // Set processing state
    this.isProcessing.set(true);

    // Call store method to submit plan
    this.planStore.submitServiceLocalizationPlan(formData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isProcessing.set(false);
          // this.toasterServi.ce.success(this.i18nService.translate('plans.wizard.messages.submitSuccess'));
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
          // this.toasterService.error(this.i18nService.translate('plans.wizard.messages.submitError'));
          console.error('Error submitting plan:', error);
        }
      });
  }

  onSubmissionCancel(): void {
    this.showSubmissionModal.set(false);
  }

  onConfirmLeave(): void {
    this.showConfirmLeaveDialog.set(false);
    this.visibility.set(false);
    this.onClose();
  }

  onContinueEditing(): void {
    this.showConfirmLeaveDialog.set(false);
  }

  saveAsDraft(): void {
    // Get plan ID if in edit mode
    const currentPlanId =
      this.planStore.wizardMode() === 'edit' ? this.planStore.selectedPlanId() ?? '' : '';
    const isEditMode = this.planStore.wizardMode() === 'edit';

    // Map form values to request structure
    const request = mapServiceLocalizationPlanFormToRequest(
      this.serviceLocalizationFormService,
      currentPlanId
    );

    // Mark as draft
    request.servicePlan.isDraft = true;

    // Convert request to FormData
    const formData = convertServiceRequestToFormData(request);

    // Set processing state
    this.isProcessing.set(true);

    // Call store method to submit plan (as draft)
    this.planStore
      .submitServiceLocalizationPlan(formData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isProcessing.set(false);
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
}
