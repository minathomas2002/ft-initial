import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { merge } from 'rxjs';
import { ErrorMessagesService } from 'src/app/shared/services/error-messages/error-messages.service';
import { I18nService } from 'src/app/shared/services/i18n/i18n.service';
import { BaseErrorComponent } from '../base-error/base-error.component';

@Component({
  selector: 'app-base-error-messages',
  imports: [BaseErrorComponent],
  templateUrl: './base-error-messages.html',
  styleUrl: './base-error-messages.scss',
})
export class BaseErrorMessages {
  private readonly errorMessagesService = inject(ErrorMessagesService);
  private readonly i18n = inject(I18nService);

  control = input.required<AbstractControl>();
  label = input.required<string>();
  customRequiredMessage = input<string | null>(null);

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
    const messages = this.errorMessagesService.getErrorMessages(
      this.control(),
      this.label()
    );
    const customRequiredMessage = this.customRequiredMessage();

    if (!customRequiredMessage) {
      return messages;
    }

    const defaultRequiredMessage = this.i18n.translate('common.validation.required', {
      label: this.label(),
    });
    return messages.map((message) =>
      message === defaultRequiredMessage ? customRequiredMessage : message
    );
  });
}
