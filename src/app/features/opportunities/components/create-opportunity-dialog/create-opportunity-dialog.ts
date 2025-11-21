import { Component, model } from '@angular/core';
import { BaseWizardDialog } from 'src/app/shared/components/base-components/base-wizard-dialog/base-wizard-dialog';
import { StepContentDirective } from 'src/app/shared/directives/step-content.directive';
import { BaseAlertComponent } from "src/app/shared/components/base-components/base-alert/base-alert.component";

@Component({
  selector: 'app-create-opportunity-dialog',
  imports: [BaseWizardDialog, StepContentDirective],
  templateUrl: './create-opportunity-dialog.html',
  styleUrl: './create-opportunity-dialog.scss',
})
export class CreateOpportunityDialog {
  visible = model<boolean>(false);
  steps = [{
    title: 'Opportunity Information',
    description: 'Enter Opportunity details',
    isValid: true,
  },
  {
    title: 'Opportunity Information 02',
    description: 'Enter Opportunity details',
    isValid: false,
  },
  {
    title: 'Opportunity Information 03',
    description: 'Enter Opportunity details',
    isValid: false,
  },]
}
