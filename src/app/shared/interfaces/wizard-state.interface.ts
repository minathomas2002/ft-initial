import { FormGroup } from "@angular/forms";

export interface IWizardStepState {
  title: string;
  description: string;
  isActive: boolean;
  formState: FormGroup | null;
  hasErrors?: boolean; // Optional flag to indicate if step has validation errors
}