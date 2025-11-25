import { FieldState } from "@angular/forms/signals";

export interface IWizardStepState {
  title: string;
  description: string;
  isActive: boolean;
  formState: FieldState<unknown, string | number>;
}