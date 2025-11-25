import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeModule } from 'primeng/badge';
import { FieldState } from '@angular/forms/signals';
import { EWizardStepState } from 'src/app/shared/enums/wizard-step-state.enum';
import { IWizardStepState } from 'src/app/shared/interfaces/wizard-state.interface';

export type StepState = 'empty' | 'in-progress' | 'valid' | 'error';

@Component({
  selector: 'app-wizard-step-state',
  imports: [BadgeModule],
  templateUrl: './wizard-step-state.component.html',
  styleUrl: './wizard-step-state.component.scss',
  standalone: true,
})
export class WizardStepStateComponent {
  stepState = input.required<IWizardStepState>();
  formState = computed(() => this.stepState().formState);
  errorsNumber = computed(() =>
    this.formState().dirty()
      ? this.formState().errors?.length ?? 0 : 0);

  status = computed(() => {
    if (this.formState().valid()) {
      return EWizardStepState.Completed;
    } else if (this.formState().dirty() && this.formState().invalid()) {
      return EWizardStepState.Error;
    }
    return EWizardStepState.Incomplete;
  });

  get EWizardStepState() {
    return EWizardStepState;
  }
}

