import { ChangeDetectionStrategy, Component, inject, model, signal } from '@angular/core';
import { BaseWizardDialog } from '../../../base-components/base-wizard-dialog/base-wizard-dialog';
import { IWizardStepState } from 'src/app/shared/interfaces/wizard-state.interface';
import { MaterialsFormService } from 'src/app/shared/services/plan/materials-form-service/materials-form-service';
import { OverviewCompanyInformationForm } from '../../overviewCompanyInformation/overviewCompanyInformationForm/overviewCompanyInformationForm';
import { ButtonModule } from 'primeng/button';
import { BaseTagComponent } from '../../../base-components/base-tag/base-tag.component';
import { StepContentDirective } from 'src/app/shared/directives';

@Component({
  selector: 'app-materials-sourcing-plan-wizard',
  imports: [
    BaseWizardDialog,
    OverviewCompanyInformationForm,
    ButtonModule,
    BaseTagComponent,
    StepContentDirective
  ],
  templateUrl: './materials-sourcing-plan-wizard.html',
  styleUrl: './materials-sourcing-plan-wizard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MaterialsSourcingPlanWizard {
  materialsFormService = inject(MaterialsFormService);
  visibility = model(false);
  activeStep = signal<number>(1);
  steps = signal<IWizardStepState[]>([
    {
      title: 'Overview & Company Information',
      description: 'Enter basic plan details and company information',
      isActive: true,
      formState: this.materialsFormService.overviewCompanyInformation
    }
  ]);
  wizardTitle = signal('Material Sourcing Plan – Cables');
  isLoading = signal(false);
  isProcessing = signal(false);

  previousStep(): void {
  }
  nextStep(): void { }

  saveAsDraft(): void { }
}
