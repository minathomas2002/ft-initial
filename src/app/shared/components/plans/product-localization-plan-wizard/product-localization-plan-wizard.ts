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
import { EMaterialsFormControls, EOpportunityType } from "src/app/shared/enums";
import { SubmissionConfirmationModalComponent } from "../submission-confirmation-modal/submission-confirmation-modal.component";
import { Signature } from "src/app/shared/interfaces/plans.interface";
import { ConfirmLeaveDialogComponent } from "../../utility-components/confirm-leave-dialog/confirm-leave-dialog.component";
import { I18nService } from "src/app/shared/services/i18n/i18n.service";
import { IProductPlanResponse } from "src/app/shared/interfaces/plans.interface";

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
    ConfirmLeaveDialogComponent,
    SubmissionConfirmationModalComponent
  ],
  templateUrl: './product-localization-plan-wizard.html',
  styleUrl: './product-localization-plan-wizard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductLocalizationPlanWizard {
  productPlanFormService = inject(ProductPlanFormService);
  toasterService = inject(ToasterService);
  planStore = inject(PlanStore);
  destroyRef = inject(DestroyRef);
  validationService = inject(ProductPlanValidationService);
  private readonly i18nService = inject(I18nService);
  visibility = model(false);
  activeStep = signal<number>(1);
  doRefresh = output<void>();
  isSubmitted = signal<boolean>(false);

  // Mode and plan ID from store
  mode = this.planStore.wizardMode;
  planId = this.planStore.selectedPlanId;

  // Track validation errors for stepper indicators
  validationErrors = signal<Map<number, boolean>>(new Map());

  steps = computed<IWizardStepState[]>(() => {
    const errors = this.validationErrors();
    this.i18nService.currentLanguage();
    return [
      {
        title: this.i18nService.translate('plans.wizard.step1.title'),
        description: this.i18nService.translate('plans.wizard.step1.description'),
        isActive: this.activeStep() === 1,
        formState: this.productPlanFormService.overviewCompanyInformation,
        hasErrors: true
      },
      {
        title: this.i18nService.translate('plans.wizard.step2.title'),
        description: this.i18nService.translate('plans.wizard.step2.description'),
        isActive: this.activeStep() === 2,
        formState: this.productPlanFormService.step2_productPlantOverview,
        hasErrors: true
      },
      {
        title: this.i18nService.translate('plans.wizard.step3.title'),
        description: this.i18nService.translate('plans.wizard.step3.description'),
        isActive: this.activeStep() === 3,
        formState: this.productPlanFormService.step3_valueChain,
        hasErrors: true
      },
      {
        title: this.i18nService.translate('plans.wizard.step4.title'),
        description: this.i18nService.translate('plans.wizard.step4.description'),
        isActive: this.activeStep() === 4,
        formState: this.productPlanFormService.step4_saudization,
        hasErrors: true
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
  wizardTitle = computed(() => {
    const currentMode = this.planStore.wizardMode();
    this.i18nService.currentLanguage();
    if (currentMode === 'edit') return this.i18nService.translate('plans.wizard.title.edit');
    if (currentMode === 'view') return this.i18nService.translate('plans.wizard.title.view');
    return this.i18nService.translate('plans.wizard.title.create');
  });
  isLoading = signal(false);
  isProcessing = signal(false);
  isLoadingPlan = signal(false);

  // Reference to Step 5 Summary component
  summaryComponent = viewChild<Step05Summary>('summaryComponent');

  // Submission confirmation modal
  showSubmissionModal = signal(false);
  existingSignature = signal<string | null>(null);
  showConfirmLeaveDialog = model(false);
  // Computed signal for view mode
  isViewMode = computed(() => this.planStore.wizardMode() === 'view');

  constructor() {
    // Effect to load plan data when planId and mode are set
    effect(() => {
      const currentPlanId = this.planStore.selectedPlanId();
      const currentMode = this.planStore.wizardMode();
      const isVisible = this.visibility();

      // Only process when dialog is visible
      if (!isVisible) {
        return;
      }

      if (currentPlanId && (currentMode === 'edit' || currentMode === 'view')) {
        this.loadPlanData(currentPlanId);
      } else if (currentMode === 'create' && !currentPlanId) {
        // Reset forms for create mode - this will set opportunityType and submissionDate
        this.productPlanFormService.resetAllForms();
        this.enableAllForms();
        this.activeStep.set(1);
        this.isSubmitted.set(false);
        this.existingSignature.set(null);

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
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (response.body) {
            // Get opportunity details and update availableOpportunities for edit mode
            const opportunityId = response.body.productPlan?.overviewCompanyInfo?.basicInfo?.opportunityId;
            if (opportunityId && (this.planStore.wizardMode() === 'edit' || this.planStore.wizardMode() === 'view')) {
              this.planStore.getOpportunityDetailsAndUpdateOptions(opportunityId)
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe({
                  next: () => {
                    // Map response to form after opportunity is loaded
                    this.mapPlanDataToForm(response.body);
                  },
                  error: (error) => {
                    console.error('Error loading opportunity details:', error);
                    // Still map the form data even if opportunity loading fails
                    this.mapPlanDataToForm(response.body);
                  }
                });
            } else {
              // Map response to form directly if no opportunity ID or not in edit/view mode
              this.mapPlanDataToForm(response.body);
            }
          }
        },
        error: (error) => {
          this.isLoadingPlan.set(false);
          this.toasterService.error(this.i18nService.translate('plans.wizard.messages.errorLoadingPlan'));
          console.error('Error loading plan:', error);
          this.visibility.set(false);
        }
      });
  }

  private mapPlanDataToForm(response: IProductPlanResponse): void {
    // Map response to form
    mapProductPlanResponseToForm(response, this.productPlanFormService);

    // Store existing signature if present
    if (response.signature?.signatureValue) {
      this.existingSignature.set(response.signature.signatureValue);
    }

    // Disable forms if in view mode
    if (this.isViewMode()) {
      this.disableAllForms();
    }

    // Disable opportunity input in edit mode
    if (this.planStore.wizardMode() === 'edit') {
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
  }

  enableAllForms(): void {
    this.productPlanFormService.step1_overviewCompanyInformation.enable();
    this.productPlanFormService.step2_productPlantOverview.enable();
    this.productPlanFormService.step3_valueChain.enable();
    this.productPlanFormService.step4_saudization.enable();

    // Re-disable opportunityType and submissionDate after enabling all forms
    this.disableReadOnlyFields();
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
   * Disable read-only fields that should always be disabled in create mode
   */
  private disableReadOnlyFields(): void {
    const basicInfo = this.productPlanFormService.basicInformationFormGroup;
    if (basicInfo) {
      const opportunityTypeControl = basicInfo.get(EMaterialsFormControls.opportunityType);
      if (opportunityTypeControl) {
        opportunityTypeControl.setValue(EOpportunityType.PRODUCT.toString());
        opportunityTypeControl.disable({ emitEvent: false });
      }
      const submissionDateControl = basicInfo.get(EMaterialsFormControls.submissionDate);
      if (submissionDateControl) {
        submissionDateControl.setValue(new Date());
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
    const planTitle = basicInfoFormGroup?.get(EMaterialsFormControls.planTitle)?.value;
    const opportunity = basicInfoFormGroup?.get(EMaterialsFormControls.opportunity)?.value;

    // Check if plan title and opportunity are selected
    if (!planTitle || !opportunity) {
      this.toasterService.error(this.i18nService.translate('plans.wizard.messages.selectPlanTitleAndOpportunity'));
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
    if (this.planStore.wizardMode() === 'create' || this.planStore.wizardMode() === 'edit') {
      if (!this.isSubmitted()) {
        // Keep the wizard open and show confirmation dialog
        this.visibility.set(true);
        this.showConfirmLeaveDialog.set(true);
        return;
      }
      this.productPlanFormService.resetAllForms();
      this.activeStep.set(1);
      this.doRefresh.emit();
      this.isSubmitted.set(false);
      // Reset wizard state in store
      this.planStore.resetWizardState();
    }

  }
}
