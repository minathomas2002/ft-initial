import { ChangeDetectionStrategy, Component, computed, effect, inject, input, model, OnDestroy, output, signal, viewChild } from "@angular/core";
import { BaseWizardDialog } from "../../base-components/base-wizard-dialog/base-wizard-dialog";
import { Step01OverviewCompanyInformationForm } from "../step-01-overviewCompanyInformation/step-01-overviewCompanyInformationForm";
import { Step02ProductPlantOverviewForm } from "../step-02-productPlantOverview/step-02-productPlantOverviewForm";
import { Step03ValueChainForm } from "../step-03-valueChain/step-03-valueChainForm";
import { Step04SaudizationForm } from "../step-04-saudization/step-04-saudizationForm";
import { Step05Summary } from "../step-05-summary/step-05-summary";
import { ButtonModule } from "primeng/button";
import { BaseTagComponent } from "../../base-components/base-tag/base-tag.component";
import { StepContentDirective } from "src/app/shared/directives";
import { ProductPlanFormService } from "src/app/shared/services/plan/materials-form-service/product-plan-form-service";
import { ProductPlanValidationService } from "src/app/shared/services/plan/validation/product-plan-validation.service";
import { IWizardStepState } from "src/app/shared/interfaces/wizard-state.interface";
import { PlanStore } from "src/app/shared/stores/plan/plan.store";
import { mapProductLocalizationPlanFormToRequest, convertRequestToFormData, mapProductPlanResponseToForm } from "src/app/shared/utils/product-localization-plan.mapper";
import { DestroyRef } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ToasterService } from "src/app/shared/services/toaster/toaster.service";
import { EMaterialsFormControls } from "src/app/shared/enums";
import { SubmissionConfirmationModalComponent } from "../submission-confirmation-modal/submission-confirmation-modal.component";
import { Signature } from "src/app/shared/interfaces/plans.interface";

@Component({
  selector: 'app-product-localization-plan-wizard',
  imports: [
    BaseWizardDialog,
    Step01OverviewCompanyInformationForm,
    Step02ProductPlantOverviewForm,
    Step03ValueChainForm,
    Step04SaudizationForm,
    Step05Summary,
    ButtonModule,
    BaseTagComponent,
    StepContentDirective,
    SubmissionConfirmationModalComponent
  ],
  templateUrl: './product-localization-plan-wizard.html',
  styleUrl: './product-localization-plan-wizard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductLocalizationPlanWizard implements OnDestroy {
  productPlanFormService = inject(ProductPlanFormService);
  toasterService = inject(ToasterService);
  planStore = inject(PlanStore);
  destroyRef = inject(DestroyRef);
  validationService = inject(ProductPlanValidationService);
  visibility = model(false);
  activeStep = signal<number>(1);
  doRefresh = output<void>();

  // Mode and plan ID inputs
  mode = input<'create' | 'edit' | 'view'>('create');
  planId = input<string | null>(null);

  // Track validation errors for stepper indicators
  validationErrors = signal<Map<number, boolean>>(new Map());

  steps = computed<IWizardStepState[]>(() => {
    const errors = this.validationErrors();
    return [
      {
        title: 'Overview & Company Information',
        description: 'Enter basic plan details and company information',
        isActive: this.activeStep() === 1,
        formState: this.productPlanFormService.overviewCompanyInformation,
        hasErrors: true
      },
      {
        title: 'Product & Plant Overview',
        description: 'Enter product details and plant information',
        isActive: this.activeStep() === 2,
        formState: this.productPlanFormService.step2_productPlantOverview,
        hasErrors: true
      },
      {
        title: 'Value Chain',
        description: 'Define value chain components and localization',
        isActive: this.activeStep() === 3,
        formState: this.productPlanFormService.step3_valueChain,
        hasErrors: true
      },
      {
        title: 'Saudization',
        description: 'Enter saudization projections and attachments',
        isActive: this.activeStep() === 4,
        formState: this.productPlanFormService.step4_saudization,
        hasErrors: true
      },
      {
        title: 'Summary',
        description: 'Review your localization plan before final submission',
        isActive: this.activeStep() === 5,
        formState: null,
        hasErrors: false
      }
    ];
  });
  wizardTitle = computed(() => {
    const currentMode = this.mode();
    if (currentMode === 'edit') return 'Edit Plan';
    if (currentMode === 'view') return 'View Plan';
    return 'Product Localization Plan';
  });
  isLoading = signal(false);
  isProcessing = signal(false);
  isLoadingPlan = signal(false);

  // Reference to Step 5 Summary component
  summaryComponent = viewChild<Step05Summary>('summaryComponent');

  // Submission confirmation modal
  showSubmissionModal = signal(false);
  existingSignature = signal<string | null>(null);

  // Computed signal for view mode
  isViewMode = computed(() => this.mode() === 'view');

  constructor() {
    // Effect to load plan data when planId and mode are set
    effect(() => {
      const currentPlanId = this.planId();
      const currentMode = this.mode();

      if (currentPlanId && (currentMode === 'edit' || currentMode === 'view') && this.visibility()) {
        this.loadPlanData(currentPlanId);
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

  handleSubmit(): void {
    // This will be called from Step 5 Summary component after validation passes
    // For now, just log - actual submission logic can be added here
    console.log('Submit clicked - validation passed');
    // TODO: Open signature modal or proceed with submission
  }

  onSummarySubmitClick(): void {
    // Check if all forms are valid
    if (!this.productPlanFormService.areAllFormsValid()) {
      // Mark all controls as dirty to show validation errors
      this.productPlanFormService.markAllControlsAsDirty();
      this.toasterService.error('Please fix all validation errors before submitting');
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
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (response.body) {
            // Map response to form
            mapProductPlanResponseToForm(response.body, this.productPlanFormService);

            // Store existing signature if present
            if (response.body.signature?.signatureValue) {
              this.existingSignature.set(response.body.signature.signatureValue);
            }

            // Disable forms if in view mode
            if (this.isViewMode()) {
              this.disableAllForms();
            }
          }
          this.isLoadingPlan.set(false);
        },
        error: (error) => {
          this.isLoadingPlan.set(false);
          this.toasterService.error('Error loading plan data. Please try again.');
          console.error('Error loading plan:', error);
          this.visibility.set(false);
        }
      });
  }

  disableAllForms(): void {
    this.productPlanFormService.step1_overviewCompanyInformation.disable();
    this.productPlanFormService.step2_productPlantOverview.disable();
    this.productPlanFormService.step3_valueChain.disable();
    this.productPlanFormService.step4_saudization.disable();
  }

  enableAllForms(): void {
    this.productPlanFormService.step1_overviewCompanyInformation.enable();
    this.productPlanFormService.step2_productPlantOverview.enable();
    this.productPlanFormService.step3_valueChain.enable();
    this.productPlanFormService.step4_saudization.enable();
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
    const currentPlanId = this.mode() === 'edit' ? (this.planId() ?? '') : '';

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
          this.toasterService.success('Product localization plan submitted successfully');
          // Reset all forms after successful submission
          this.productPlanFormService.resetAllForms();
          // Reset wizard state
          this.activeStep.set(1);
          this.doRefresh.emit();
          this.visibility.set(false);
          this.showSubmissionModal.set(false);
        },
        error: (error) => {
          this.isProcessing.set(false);
          this.toasterService.error('Error submitting plan. Please try again.');
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
    const planTitle = basicInfoFormGroup?.get(EMaterialsFormControls.planTitle)?.value;
    const opportunity = basicInfoFormGroup?.get(EMaterialsFormControls.opportunity)?.value;

    // Check if plan title and opportunity are selected
    if (!planTitle || !opportunity) {
      this.toasterService.error('Please select a plan title and opportunity');
      return;
    }

    // Get plan ID if in edit mode
    const currentPlanId = this.mode() === 'edit' ? (this.planId() ?? '') : '';
    const isEditMode = this.mode() === 'edit';

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
            ? 'Draft updated successfully.'
            : 'Product localization plan saved as draft successfully';
          this.toasterService.success(successMessage);

          // Only reset forms if not in edit mode (to preserve data)
          if (!isEditMode) {
            this.productPlanFormService.resetAllForms();
            this.activeStep.set(1);
          }

          this.doRefresh.emit();
          this.visibility.set(false);
        },
        error: (error) => {
          this.isProcessing.set(false);
          this.toasterService.error('Error saving draft. Please try again.');
          console.error('Error saving draft:', error);
        }
      });
  }


  ngOnDestroy(): void {
    // Reset forms when component is destroyed
    if (this.mode() === 'create') {
      this.productPlanFormService.resetAllForms();
    }
  }
}
