import { ChangeDetectionStrategy, Component, computed, inject, model, OnInit, output, signal } from '@angular/core';
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
import { EOpportunityStatus, EViewMode } from 'src/app/shared/enums';
import { OpportunitiesStore } from 'src/app/shared/stores/opportunities/opportunities.store';
import { OpportunitiesFilterService } from '../../services/opportunities-filter/investor-opportunities-filter-service';
import { IOpportunityDetails } from 'src/app/shared/interfaces/opportunities.interface';
import { TColors } from 'src/app/shared/interfaces/colors.interface';
import { BaseTagComponent } from 'src/app/shared/components/base-components/base-tag/base-tag.component';

@Component({
  selector: 'app-create-edit-opportunity-dialog',
  imports: [
    BaseWizardDialog,
    StepContentDirective,
    OpportunityInformationForm,
    OpportunityLocalizationForm,
    ButtonModule,
    TranslatePipe,
    BaseTagComponent
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
  viewMode = this.adminOpportunitiesStore.viewMode;
  opportunity = signal<IOpportunityDetails | null>(null);
  steps = computed<IWizardStepState[]>(() => [
    {
      title: this.i18nService.translate('opportunity.wizard.opportunityInformation'),
      description: this.i18nService.translate('opportunity.wizard.opportunityInformationDescription'),
      isActive: this.activeStep() === 1,
      formState: this.opportunityFormService.opportunityInformationForm,
      hasErrors: true,
    },
    {
      title: this.i18nService.translate('opportunity.wizard.opportunityLocalization'),
      description: this.i18nService.translate('opportunity.wizard.opportunityLocalizationDescription'),
      isActive: this.activeStep() === 2,
      formState: this.opportunityFormService.opportunityLocalizationForm,
      hasErrors: true,
    },
  ])
  activeStep = signal<number>(1);
  onSuccess = output<void>();
  wizardTitle = computed(() => (this.viewMode() === EViewMode.Edit ? this.i18nService.translate('opportunity.wizard.editOpportunity') : this.i18nService.translate('opportunity.wizard.createOpportunity')));

  ngOnInit() {
    this.opportunityFormService.resetForm();

    if (this.viewMode() === EViewMode.Edit && this.adminOpportunitiesStore.selectedOpportunityId()) {
      this.opportunitiesStore.getOpportunityDetails(this.adminOpportunitiesStore.selectedOpportunityId()!).subscribe({
        next: async (res) => {
          this.opportunity.set(res.body);
          await this.opportunityFormService.setFormValue(res.body);
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
    // Check if the field is invalid
    if (opportunityTitleField?.invalid) {
      // Mark as touched to show validation errors
      this.toasterService.error("Title field is required.")
      opportunityTitleField.markAsTouched();
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
    this.opportunityFormService.resetForm();
    this.activeStep.set(1);
  }
}
