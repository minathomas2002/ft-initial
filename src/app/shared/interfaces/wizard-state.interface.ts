import { FormGroup } from "@angular/forms";
import { TColors } from "./colors.interface";

export interface IWizardStepState {
  title: string;
  description: string;
  isActive: boolean;
  formState: FormGroup | null;
  hasErrors?: boolean; // Optional flag to indicate if step has validation errors
  commentsCount?: number;
  commentColor?: TColors;
  fieldsRequiringUpdate?: number; // Number of fields requiring updates (for investor view)
}