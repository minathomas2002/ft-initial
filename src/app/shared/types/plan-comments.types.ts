import type { FormGroup } from '@angular/forms';
import type { IFieldInformation, IPageComment } from '../interfaces/plans.interface';

export type TCommentPhase = 'none' | 'adding' | 'editing' | 'viewing';

export interface ICommentsCountAndPhase {
  count: number;
  phase: TCommentPhase;
}

/**
 * Descriptor for a single wizard step that participates in comment collection/validation.
 * Wizards provide an array of these so shared logic can collect/validate comments without per-step boilerplate.
 */
export interface IPlanWizardStepCommentDescriptor {
  /** 0-based index into the wizard steps array (for step title lookup). */
  stepIndex: number;
  getForm: () => FormGroup | null;
  getCommentPhase: () => TCommentPhase;
  getSelectedInputs: () => IFieldInformation[];
  getComments: () => IPageComment[];
  getCommentFields: () => IFieldInformation[];
  getStepTitle: () => string;
  /** If provided, step is skipped when false (e.g. conditional steps in service wizard). */
  isVisible?: () => boolean;
}

/** Validation status for a step (e.g. used for stepper error indicators). */
export interface IStepValidationStatus {
  hasErrors: boolean;
}

