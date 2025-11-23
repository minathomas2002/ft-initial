import { Component, computed, inject, model, signal } from '@angular/core';
import { BaseWizardDialog } from 'src/app/shared/components/base-components/base-wizard-dialog/base-wizard-dialog';
import { StepContentDirective } from 'src/app/shared/directives/step-content.directive';
import { OpportunityInformationForm } from '../opportunity-information-form/opportunity-information-form';
import { OpportunityFormService } from '../../services/opportunity-form/opportunity-form-service';
import { AdminOpportunitiesStore } from 'src/app/shared/stores/admin-opportunities/admin-opportunities.store';
import { ToasterService } from 'src/app/shared/services/toaster/toaster.service';
import { Utilities } from 'src/app/shared/classes/utilities';

@Component({
  selector: 'app-create-edit-opportunity-dialog',
  imports: [BaseWizardDialog, StepContentDirective, OpportunityInformationForm],
  templateUrl: './create-edit-opportunity-dialog.html',
  styleUrl: './create-edit-opportunity-dialog.scss',
})
export class CreateEditOpportunityDialog {
  visible = model<boolean>(false);
  opportunityFormService = inject(OpportunityFormService);
  adminOpportunitiesStore = inject(AdminOpportunitiesStore);
  toasterService = inject(ToasterService);
  steps = computed(() => [
    {
      title: 'Opportunity Information',
      description: 'Enter Opportunity details',
      isValid: this.opportunityFormService.opportunityInformationForm().valid(),
      hasStarted: !this.opportunityFormService.opportunityInformationForm().touched(),
    },
    {
      title: 'Opportunity Localization',
      description: 'Enter Opportunity localization details',
      isValid: this.opportunityFormService.opportunityLocalizationForm().valid(),
      hasStarted: !this.opportunityFormService.opportunityLocalizationForm().touched(),
    },
  ])
  activeStep = signal<number>(1);
  isNextStepDisabled = computed(() => !this.steps()[this.activeStep() - 1].isValid);
  nextStep = () => {
    this.activeStep.set(this.activeStep() + 1);
  }
  previousStep = () => {
    this.activeStep.set(this.activeStep() - 1);
  }
  saveAsDraft() {
    const opportunityTitleField = this.opportunityFormService.opportunityInformationForm.title()
    // Check if the field is invalid
    if (opportunityTitleField.invalid()) {
      // Mark as touched to show validation errors
      opportunityTitleField.markAsTouched();
      return;
    }

    const opportunityDraftRequest = this.opportunityFormService.formValue();
    const formData = new Utilities().objToFormData(opportunityDraftRequest);

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
}
