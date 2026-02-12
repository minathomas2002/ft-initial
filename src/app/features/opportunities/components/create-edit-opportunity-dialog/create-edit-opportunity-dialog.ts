import { ChangeDetectionStrategy, Component, computed, effect, inject, model, OnInit, output, signal } from '@angular/core';
import { BaseWizardDialog } from 'src/app/shared/components/base-components/base-wizard-dialog/base-wizard-dialog';
import { StepContentDirective } from 'src/app/shared/directives/step-content.directive';
import { OpportunityInformationForm } from '../opportunity-information-form/opportunity-information-form';
import { OpportunityFormService } from '../../services/opportunity-form/opportunity-form-service';
import { AdminOpportunitiesStore } from 'src/app/shared/stores/admin-opportunities/admin-opportunities.store';
import { ToasterService } from 'src/app/shared/services/toaster/toaster.service';
import { Utilities } from 'src/app/shared/classes/utilities';
import { OpportunityLocalizationForm } from '../opportunity-localization-form/opportunity-localization-form';
import { OpportunityRequestsAdapter } from '../../classes/opportunity-requests-adapter';
import { IWizardStepState } from 'src/app/shared/interfaces/wizard-state.interface';
import { ButtonModule } from 'primeng/button';
import { I18nService } from 'src/app/shared/services/i18n/i18n.service';
import { TranslatePipe } from 'src/app/shared/pipes/translate.pipe';
import { EOpportunityStatus, EPlanPageTitle, EViewMode } from 'src/app/shared/enums';
import { OpportunitiesStore } from 'src/app/shared/stores/opportunities/opportunities.store';
import { OpportunitiesFilterService } from '../../services/opportunities-filter/investor-opportunities-filter-service';
import { IOpportunityDetails } from 'src/app/shared/interfaces/opportunities.interface';
import { TColors } from 'src/app/shared/interfaces/colors.interface';
import { BaseTagComponent } from 'src/app/shared/components/base-components/base-tag/base-tag.component';
import { GeneralConfirmationDialogComponent } from 'src/app/shared/components/utility-components/general-confirmation-dialog/general-confirmation-dialog.component';
import { WizardActionFactory } from 'src/app/shared/services/wizard/wizard-action-factory.service';
import { IBaseWizardAction } from 'src/app/shared/components/base-components/base-wizard-actions/base-wizard-actions';

@Component({
  selector: 'app-create-edit-opportunity-dialog',
  imports: [
    BaseWizardDialog,
    StepContentDirective,
    OpportunityInformationForm,
    OpportunityLocalizationForm,
    ButtonModule,
    TranslatePipe,
    BaseTagComponent,
    GeneralConfirmationDialogComponent
  ],
  templateUrl: './create-edit-opportunity-dialog.html',
  styleUrl: './create-edit-opportunity-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateEditOpportunityDialog implements OnInit {
  visible = model<boolean>(false);
  opportunityFormService = inject(OpportunityFormService);
  adminOpportunitiesStore = inject(AdminOpportunitiesStore);
  opportunitiesStore = inject(OpportunitiesStore);
  toasterService = inject(ToasterService);
  i18nService = inject(I18nService);
  opportunityFilterService = inject(OpportunitiesFilterService);
  private readonly wizardActionFactory = inject(WizardActionFactory);
  viewMode = this.adminOpportunitiesStore.viewMode;
  opportunity = signal<IOpportunityDetails | null>(null);
  steps = computed<IWizardStepState[]>(() => [
    {
      title: EPlanPageTitle.OpportunityInformation,
      description: this.i18nService.translate('opportunity.wizard.opportunityInformationDescription'),
      isActive: this.activeStep() === 1,
      formState: this.opportunityFormService.opportunityInformationForm,
      hasErrors: true,
    },
    {
      title: EPlanPageTitle.OpportunityLocalization,
      description: this.i18nService.translate('opportunity.wizard.opportunityLocalizationDescription'),
      isActive: this.activeStep() === 2,
      formState: this.opportunityFormService.opportunityLocalizationForm,
      hasErrors: true,
    },
  ])
  activeStep = signal<number>(1);
  onSuccess = output<void>();
  wizardTitle = computed(() => (this.viewMode() === EViewMode.Edit ? this.i18nService.translate('opportunity.wizard.editOpportunity') : this.i18nService.translate('opportunity.wizard.createOpportunity')));
  showConfirmLeaveDialog = signal<boolean>(false);

  // Total steps computed signal
  totalSteps = computed(() => this.steps().length);

  // Centralized wizard actions using the action factory (mode as signal so actions react to mode changes)
  wizardActions = this.wizardActionFactory.generateActions({
    context: 'opportunity-wizard',
    mode: computed(() => (this.viewMode() === EViewMode.Edit ? 'edit' : 'create')),
    activeStep: this.activeStep,
    totalSteps: this.totalSteps,
    isLoading: this.adminOpportunitiesStore.isLoading,
    isProcessing: this.adminOpportunitiesStore.isProcessing,
    isSavingAsDraft: this.adminOpportunitiesStore.isSavingAsDraft,
    onPrevious: () => this.previousStep(),
    onNext: () => this.nextStep(),
    onSaveAsDraft: () => this.saveAsDraft(),
    onPublish: () => this.publishOpportunity()
  });

  constructor() {
    // Reset form and handle mode changes when dialog becomes visible
    effect(() => {
      const isVisible = this.visible();
      const currentViewMode = this.viewMode();

      if (isVisible) {
        // Reset form when dialog opens to ensure clean state
        this.opportunityFormService.resetForm();

        // Load opportunity data if in edit mode
        if (currentViewMode === EViewMode.Edit && this.adminOpportunitiesStore.selectedOpportunityId()) {
          this.opportunitiesStore.getOpportunityDetails(this.adminOpportunitiesStore.selectedOpportunityId()!).subscribe({
            next: async (res) => {
              this.opportunity.set(res.body);
              await this.opportunityFormService.setFormValue(res.body);
              // Disable opportunityType if hasActivePlans in edit mode
              if (res.body.hasActivePlans) {
                this.opportunityFormService.opportunityInformationForm.get('opportunityType')?.disable({ emitEvent: false });
              } else {
                this.opportunityFormService.opportunityInformationForm.get('opportunityType')?.enable({ emitEvent: false });
              }
            },
          });
        } else {
          // Clear opportunity data when switching to create mode
          this.opportunity.set(null);
          // Ensure title and opportunityType are enabled in create mode
          this.opportunityFormService.opportunityInformationForm.get('title')?.enable({ emitEvent: false });
          this.opportunityFormService.opportunityInformationForm.get('opportunityType')?.enable({ emitEvent: false });
        }
      }
    });
  }

  ngOnInit() {
    // Initial setup is handled in constructor effect
  }

  nextStep = () => {
    this.activeStep.set(this.activeStep() + 1);
  }
  previousStep = () => {
    this.activeStep.set(this.activeStep() - 1);
  }


  get EOpportunityStatus(): typeof EOpportunityStatus {
    return EOpportunityStatus
  }

  getStatusConfig(): { label: string; color: TColors } {
    const status = this.opportunity()?.status;
    if (status === EOpportunityStatus.PUBLISHED) {
      return { label: 'opportunity.status.published', color: 'green' as const };
    } else {
      return { label: 'opportunity.status.draft', color: 'gray' as const };
    }
  }

  getStateConfig(): { label: string; color: TColors } {
    const isActive = this.opportunity()?.isActive;
    if (isActive) {
      return { label: 'opportunity.state.active', color: 'green' as const };
    } else {
      return { label: 'opportunity.state.inactive', color: 'red' as const };
    }
  }

  async saveAsDraft() {
    this.opportunityFormService.enableDraftValidators();
    const opportunityTitleField = this.opportunityFormService.opportunityInformationForm.get('title');
    const startDateField = this.opportunityFormService.opportunityInformationForm.get('startDate');
    const endDateField = this.opportunityFormService.opportunityInformationForm.get('endDate');

    // Ensure cross-field date validation runs before checking.
    endDateField?.updateValueAndValidity({ emitEvent: false });

    // Check if the field is invalid
    if (opportunityTitleField?.invalid) {
      // Mark as touched to show validation errors
      this.toasterService.error("Title field is required.")
      opportunityTitleField.markAsTouched();
      return;
    }

    const hasStartDate = !!startDateField?.value;
    const hasEndDate = !!endDateField?.value;

    // Draft should require both dates if the user entered either one.
    if (hasStartDate !== hasEndDate) {
      this.toasterService.error('Please provide both start date and end date.');
      startDateField?.markAsTouched();
      endDateField?.markAsTouched();
      return;
    }

    // Draft should still enforce a valid date range when both dates are provided.
    if (hasStartDate && hasEndDate && endDateField?.hasError('dateRangeInvalid')) {
      this.toasterService.error('End date must be after start date.');
      startDateField.markAsTouched();
      endDateField.markAsTouched();
      return;
    }

    const formValue = this.opportunityFormService.formValue();
    const opportunityInformationFormValue = await new OpportunityRequestsAdapter().toOpportunityRequest(formValue);
    const formData = new Utilities().objToFormData(opportunityInformationFormValue);

    // Continue with save as draft logic...
    this.adminOpportunitiesStore.draftOpportunity(
      formData
    ).subscribe({
      next: (res) => {
        this.toasterService.success(this.i18nService.translate('opportunity.messages.savedAsDraft'));
        this.opportunityFormService.resetForm();
        this.activeStep.set(1);
        this.visible.set(false);
        this.onSuccess.emit();
      },
    });
  }

  async publishOpportunity() {

    this.opportunityFormService.markAsDirty();
    this.opportunityFormService.enableFullValidators();
    if (this.opportunityFormService.opportunityForm.invalid) {
      //this.opportunityFormService.opportunityForm.markAllAsTouched();  // show errors
      return;
    }
    const formValue = this.opportunityFormService.formValue();
    const opportunityInformationFormValue = await new OpportunityRequestsAdapter().toOpportunityRequest(formValue);
    const formData = new Utilities().objToFormData(opportunityInformationFormValue);
    if (this.viewMode() === EViewMode.Edit) {
      this.adminOpportunitiesStore.updateOpportunity(formData).subscribe({
        next: (res) => {
          this.toasterService.success(this.i18nService.translate('opportunity.messages.updatedSuccessfully'));
          this.opportunityFormService.resetForm();
          this.activeStep.set(1);
          this.visible.set(false);
          this.onSuccess.emit();
        },
      });
    } else {
      this.adminOpportunitiesStore.createOpportunity(formData).subscribe({
        next: (res) => {
          this.toasterService.success(this.i18nService.translate('opportunity.messages.createdSuccessfully'));
          this.opportunityFormService.resetForm();
          this.activeStep.set(1);
          this.visible.set(false);
          this.onSuccess.emit();
        },
      });
    }
  }

  onClose() {
    if (this.viewMode() === EViewMode.Edit || this.viewMode() === EViewMode.Create) {
      if (this.opportunityFormService.hasFormChanged()) {
        // Keep the wizard open and show confirmation dialog
        this.visible.set(true);
        this.showConfirmLeaveDialog.set(true);
        return;
      }
    }
    this.opportunityFormService.resetForm();
    this.activeStep.set(1);
    this.visible.set(false);
  }

  onConfirmLeave(): void {
    this.showConfirmLeaveDialog.set(false);
    this.opportunityFormService.resetForm();
    this.activeStep.set(1);
    this.visible.set(false);
  }
}
