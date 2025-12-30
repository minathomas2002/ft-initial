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

  visibility = model(false);
  doRefresh = output<void>();
  isLoading = signal(false);
  activeStep = signal<number>(1);
  destroyRef = inject(DestroyRef);

  steps = computed<IWizardStepState[]>(() => {
    this.i18nService.currentLanguage();
    const list: IWizardStepState[] = [];

    // Always present steps
    list.push({
      title: 'Cover Page',
      description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit',
      isActive: this.activeStep() === list.length + 1,
      formState: null,
      hasErrors: true,
    });

    list.push({
      title: 'Overview',
      description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit',
      isActive: this.activeStep() === list.length + 1,
      formState: null,
      hasErrors: true,
    });

    if (this.showExistingSaudiStep()) {
      list.push({
        title: 'Existing Saudi Co.',
        description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit',
        isActive: this.activeStep() === list.length + 1,
        formState: null,
        hasErrors: true,
      });
    }

    if (this.showDirectLocalizationStep()) {
      list.push({
        title: 'Direct Localization',
        description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit',
        isActive: this.activeStep() === list.length + 1,
        formState: null,
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

    // Only evaluate when user changes methodology, not on init
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

  saveAsDraft(): void {
    // // Access nested form controls correctly
    // const basicInfoFormGroup = this.productPlanFormService.basicInformationFormGroup;
    // const planTitle = basicInfoFormGroup?.get(EMaterialsFormControls.planTitle)?.value;
    // const opportunity = basicInfoFormGroup?.get(EMaterialsFormControls.opportunity)?.value;
    // // Check if plan title and opportunity are selected
    // if (!planTitle) {
    //   this.toasterService.error('Plan title is required');
    //   return;
    // }
    // if (!planTitle || !opportunity) {
    //   this.toasterService.error('Please select opportunity to save as draft');
    //   return;
    // }
    // // Get plan ID if in edit mode
    // const currentPlanId =
    //   this.planStore.wizardMode() === 'edit' ? this.planStore.selectedPlanId() ?? '' : '';
    // const isEditMode = this.planStore.wizardMode() === 'edit';
    // // Map form values to request structure
    // const request = mapProductLocalizationPlanFormToRequest(
    //   this.productPlanFormService,
    //   currentPlanId
    // );
    // // Convert request to FormData
    // const formData = convertRequestToFormData(request);
    // // Set processing state
    // this.isProcessing.set(true);
    // // Call store method to save as draft
    // this.planStore
    //   .saveAsDraftProductLocalizationPlan(formData)
    //   .pipe(takeUntilDestroyed(this.destroyRef))
    //   .subscribe({
    //     next: () => {
    //       this.isProcessing.set(false);
    //       const successMessage = isEditMode
    //         ? this.i18nService.translate('plans.wizard.messages.draftUpdatedSuccess')
    //         : this.i18nService.translate('plans.wizard.messages.draftSavedSuccess');
    //       this.toasterService.success(successMessage);
    //       // Only reset forms if not in edit mode (to preserve data)
    //       if (!isEditMode) {
    //         this.productPlanFormService.resetAllForms();
    //         this.activeStep.set(1);
    //         // Reset wizard state in store for create mode
    //         this.planStore.resetWizardState();
    //       }
    //       this.doRefresh.emit();
    //       this.visibility.set(false);
    //       this.isSubmitted.set(true);
    //     },
    //     error: (error) => {
    //       this.isProcessing.set(false);
    //       this.toasterService.error(this.i18nService.translate('plans.wizard.messages.draftError'));
    //       console.error('Error saving draft:', error);
    //     },
    //   });
  }
}
