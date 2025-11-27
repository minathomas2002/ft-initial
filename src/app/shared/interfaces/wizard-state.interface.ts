import { FormGroup } from "@angular/forms";

export interface IWizardStepState {
  title: string;
  description: string;
  isActive: boolean;
  formState: FormGroup;
}