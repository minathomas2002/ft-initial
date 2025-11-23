import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type StepState = 'empty' | 'in-progress' | 'valid' | 'error';

@Component({
  selector: 'app-wizard-step-state',
  imports: [CommonModule],
  templateUrl: './wizard-step-state.component.html',
  styleUrl: './wizard-step-state.component.scss',
  standalone: true,
})
export class WizardStepStateComponent {
  // Step information
  title = input.required<string>();
  description = input.required<string>();

  // Step state properties
  isValid = input<boolean>(false);
  hasStarted = input<boolean>(false);
  hasErrors = input<boolean>(false);

  // Active step information
  activeStep = input.required<number>();
  stepNumber = input.required<number>();

  // Computed state
  stepState = computed<StepState>(() => {
    // If step is valid and not active, show checkmark
    if (this.isValid()) {
      return 'valid';
    }

    // If there are errors (invalid format, not empty), show error
    if (this.hasErrors()) {
      return 'error';
    }

    // If started but not valid, show in-progress
    if (this.hasStarted()) {
      return 'in-progress';
    }

    return 'empty';
  });

  isActive = computed(() => this.activeStep() === this.stepNumber());
}

