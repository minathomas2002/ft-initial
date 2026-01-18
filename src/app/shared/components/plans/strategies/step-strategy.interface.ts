import { IWizardStepState } from 'src/app/shared/interfaces/wizard-state.interface';
import { IPageComment } from 'src/app/shared/interfaces/plans.interface';
import { TCommentPhase } from '../plan-localization/product-localization-plan-wizard/product-localization-plan-wizard';
import { IFieldInformation } from 'src/app/shared/interfaces/plans.interface';

/**
 * Strategy interface for handling step-specific logic
 * Uses Strategy pattern to encapsulate step behavior
 */
export interface IStepStrategy {
  /**
   * Get step configuration for wizard display
   */
  getStepConfig(): IWizardStepState;

  /**
   * Collect comments for this step
   */
  collectStepComments(): IPageComment | null;

  /**
   * Validate step data
   */
  validateStep(): string | null;

  /**
   * Get comment phase for this step
   */
  getCommentPhase(): TCommentPhase;

  /**
   * Get selected inputs for this step
   */
  getSelectedInputs(): IFieldInformation[];

  /**
   * Set comment phase for this step
   */
  setCommentPhase(phase: TCommentPhase): void;
}