import { Component, computed, inject, model, signal } from '@angular/core';
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

@Component({
  selector: 'app-create-edit-opportunity-dialog',
  imports: [
    BaseWizardDialog,
    StepContentDirective,
    OpportunityInformationForm,
    OpportunityLocalizationForm,
    ButtonModule
  ],
  templateUrl: './create-edit-opportunity-dialog.html',
  styleUrl: './create-edit-opportunity-dialog.scss',
})
export class CreateEditOpportunityDialog {
  visible = model<boolean>(false);
  opportunityFormService = inject(OpportunityFormService);
  adminOpportunitiesStore = inject(AdminOpportunitiesStore);
  toasterService = inject(ToasterService);
  steps = computed<IWizardStepState[]>(() => [
    {
      title: 'Opportunity Information',
      description: 'Enter Opportunity details',
      isActive: this.activeStep() === 1,
      formState: this.opportunityFormService.opportunityInformationForm(),
    },
    {
      title: 'Opportunity Localization',
      description: 'Enter Opportunity localization details',
      isActive: this.activeStep() === 2,
      formState: this.opportunityFormService.opportunityLocalizationForm(),
    },
  ])
  activeStep = signal<number>(1);

  nextStep = () => {
    this.activeStep.set(this.activeStep() + 1);
  }
  previousStep = () => {
    this.activeStep.set(this.activeStep() - 1);
  }
  async saveAsDraft() {
    const opportunityTitleField = this.opportunityFormService.opportunityInformationForm.title()
    // Check if the field is invalid
    if (opportunityTitleField.invalid()) {
      // Mark as touched to show validation errors
      opportunityTitleField.markAsTouched();
      return;
    }

    const formValue = this.opportunityFormService.formValue();
    const opportunityInformationFormValue = await new OpportunityRequestsAdapter().toOpportunityDraftRequest(formValue);
    const formData = new Utilities().objToFormData(opportunityInformationFormValue);

    // Continue with save as draft logic...
    this.adminOpportunitiesStore.draftOpportunity(
      formData
    ).subscribe({
      next: (res) => {
        this.toasterService.success('Opportunity saved as draft');
        this.opportunityFormService.resetForm();
        this.activeStep.set(1);
        this.visible.set(false);
      },
    });
  }

  async publishOpportunity() {
    this.opportunityFormService.markAsTouched();
    const formValue = this.opportunityFormService.formValue();
    const opportunityInformationFormValue = await new OpportunityRequestsAdapter().toOpportunityDraftRequest(formValue);
    const formData = new Utilities().objToFormData(opportunityInformationFormValue);
    this.adminOpportunitiesStore.createOpportunity(formData).subscribe({
      next: (res) => {
        this.toasterService.success('Opportunity created successfully');
        this.opportunityFormService.resetForm();
        this.activeStep.set(1);
        this.visible.set(false);
      },
    });
  }

  onClose() {
    this.opportunityFormService.resetForm();
    this.activeStep.set(1);
  }
}
