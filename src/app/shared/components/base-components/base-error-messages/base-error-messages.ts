import { Component, computed, effect, input, signal } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { merge } from 'rxjs';
import { ErrorMessagesFactory } from 'src/app/shared/classes/error-messages.factory';
import { BaseErrorComponent } from '../base-error/base-error.component';

@Component({
  selector: 'app-base-error-messages',
  imports: [BaseErrorComponent],
  templateUrl: './base-error-messages.html',
  styleUrl: './base-error-messages.scss',
})
export class BaseErrorMessages {
  control = input.required<AbstractControl>();
  label = input.required<string>();

  private controlChangeTrigger = signal(0);

  constructor() {
    effect(() => {
      const control = this.control();

      // Subscribe to both value and status changes to trigger reactivity
      const subscription = merge(
        control.valueChanges,
        control.statusChanges
      ).subscribe(() => {
        // Increment trigger to notify computed of changes
        this.controlChangeTrigger.update((v) => v + 1);
      });

      // Initialize trigger
      this.controlChangeTrigger.set(0);

      // Cleanup subscription when control changes
      return () => subscription.unsubscribe();
    });
  }

  errorMessages = computed(() => {
    // Read trigger to make computed reactive to input changes
    this.controlChangeTrigger();
    return ErrorMessagesFactory.getErrorMessages(this.control(), this.label());
  });
}
