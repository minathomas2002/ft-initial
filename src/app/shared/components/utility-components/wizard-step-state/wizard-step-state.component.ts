import { Component, computed, inject, input, effect, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeModule } from 'primeng/badge';
import { EWizardStepState } from 'src/app/shared/enums/wizard-step-state.enum';
import { IWizardStepState } from 'src/app/shared/interfaces/wizard-state.interface';
import { FormUtilityService } from 'src/app/shared/services/form-utility/form-utility.service';
import { merge, interval, startWith } from 'rxjs';
import { map } from 'rxjs';

export type StepState = 'empty' | 'in-progress' | 'valid' | 'error';

@Component({
  selector: 'app-wizard-step-state',
  imports: [BadgeModule],
  templateUrl: './wizard-step-state.component.html',
  styleUrl: './wizard-step-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WizardStepStateComponent {
  private formUtilityService = inject(FormUtilityService);
  stepState = input.required<IWizardStepState>();
  formState = computed(() => this.stepState().formState);

  // Signal to track form state - updated reactively
  private formStateSignal = signal<{ valid: boolean; invalid: boolean; dirty: boolean; touched: boolean }>({
    valid: false,
    invalid: false,
    dirty: false,
    touched: false,
  });

  constructor() {
    // Set up reactive form state tracking using effect
    effect(() => {
      const form = this.formState();

      // Update initial state
      this.updateFormState(form);

      // Merge form observables with periodic checks to catch programmatic changes
      const formStateObservable = merge(
        form.statusChanges.pipe(startWith(null)),
        form.valueChanges.pipe(startWith(null)),
        // Check every 100ms to catch programmatic changes quickly
        interval(100).pipe(startWith(0))
      ).pipe(
        map(() => ({
          valid: form.valid,
          invalid: form.invalid,
          dirty: form.dirty,
          touched: form.touched,
        }))
      );

      // Subscribe to form state changes
      const subscription = formStateObservable.subscribe((state) => {
        this.formStateSignal.set(state);
      });

      // Cleanup
      return () => {
        subscription.unsubscribe();
      };
    });
  }

  private updateFormState(form: any) {
    this.formStateSignal.set({
      valid: form.valid,
      invalid: form.invalid,
      dirty: form.dirty,
      touched: form.touched,
    });
  }

  errorsNumber = computed(() => {
    // Read both signals to ensure reactivity
    const form = this.formState();
    const state = this.formStateSignal();

    // Show errors if form is invalid and (dirty or touched)
    if (state.invalid && (state.dirty || state.touched)) {
      const errorCount = this.formUtilityService.countFormErrors(form);
      return errorCount;
    }
    return 0;
  });

  status = computed(() => {
    // Read signal to ensure reactivity
    const state = this.formStateSignal();
    if (state.valid) {
      return EWizardStepState.Completed;
    } else if (state.dirty && state.invalid) {
      return EWizardStepState.Error;
    }
    return EWizardStepState.Incomplete;
  });

  get EWizardStepState() {
    return EWizardStepState;
  }
}

