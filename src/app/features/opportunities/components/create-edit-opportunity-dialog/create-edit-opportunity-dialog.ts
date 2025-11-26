import { Component, computed, inject, model, OnInit, signal } from '@angular/core';
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
import { EViewMode } from 'src/app/shared/enums';
import { OpportunitiesStore } from 'src/app/shared/stores/opportunities/opportunities.store';

@Component({
  selector: 'app-create-edit-opportunity-dialog',
  imports: [
    BaseWizardDialog,
    StepContentDirective,
    OpportunityInformationForm,
    OpportunityLocalizationForm,
    ButtonModule,
    TranslatePipe
  ],
  templateUrl: './create-edit-opportunity-dialog.html',
  styleUrl: './create-edit-opportunity-dialog.scss',
})
export class CreateEditOpportunityDialog implements OnInit {
  visible = model<boolean>(false);
  opportunityFormService = inject(OpportunityFormService);
  adminOpportunitiesStore = inject(AdminOpportunitiesStore);
  opportunitiesStore = inject(OpportunitiesStore);
  toasterService = inject(ToasterService);
  i18nService = inject(I18nService);
  steps = computed<IWizardStepState[]>(() => [
    {
      title: this.i18nService.translate('opportunity.wizard.opportunityInformation'),
      description: this.i18nService.translate('opportunity.wizard.opportunityInformationDescription'),
      isActive: this.activeStep() === 1,
      formState: this.opportunityFormService.opportunityInformationForm,
    },
    {
      title: this.i18nService.translate('opportunity.wizard.opportunityLocalization'),
      description: this.i18nService.translate('opportunity.wizard.opportunityLocalizationDescription'),
      isActive: this.activeStep() === 2,
      formState: this.opportunityFormService.opportunityLocalizationForm,
    },
  ])
  activeStep = signal<number>(1);
  wizardTitle = computed(() => this.i18nService.translate('opportunity.wizard.createOpportunity'));

  ngOnInit() {
    if (this.adminOpportunitiesStore.viewMode() === EViewMode.Edit && this.adminOpportunitiesStore.selectedOpportunityId()) {
      this.opportunitiesStore.getOpportunityDetails(this.adminOpportunitiesStore.selectedOpportunityId()!).subscribe({
        next: (res) => {
          this.opportunityFormService.setFormValue(res.body);
        },
      });
    }
  }

  nextStep = () => {
    this.activeStep.set(this.activeStep() + 1);
  }
  previousStep = () => {
    this.activeStep.set(this.activeStep() - 1);
  }
  async saveAsDraft() {
    const opportunityTitleField = this.opportunityFormService.opportunityInformationForm.get('title');
    // Check if the field is invalid
    if (opportunityTitleField?.invalid) {
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
    this.opportunityFormService.markAsDirty();

    if (this.opportunityFormService.opportunityForm.invalid) {
      console.log(this.opportunityFormService.opportunityForm);
      return;
    }
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
