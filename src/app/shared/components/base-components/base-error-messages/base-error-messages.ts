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
    const control = this.control();
    const label = this.label();
    const messages = this.errorMessagesService.getErrorMessages(control, label);
    const customRequiredMessage = this.customRequiredMessage();

    // #region agent log
    // if (messages.length > 0) {
    //   const hasObjectMessage = messages.some(m => typeof m !== 'string');
    //   fetch('http://127.0.0.1:7242/ingest/5b034c01-0b5b-4320-b714-d662075e070b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'bd8107'},body:JSON.stringify({sessionId:'bd8107',location:'base-error-messages.ts:errorMessages',message:'errorMessages computed',data:{labelType:typeof label,labelValue:label,messages,messagesTypes:messages.map(m=>typeof m),hasObjectMessage,controlErrors:control?.errors},timestamp:Date.now(),hypothesisId:'H2'})}).catch(()=>{});
    // }
    // #endregion

    if (!customRequiredMessage) {
      return messages;
    }

    const labelForDefault = typeof this.label() === 'string' ? this.label() : 'Field';
    const defaultRequiredMessage = this.i18n.translate('common.validation.required', {
      label: labelForDefault,
    });
    return messages.map((message) =>
      message === defaultRequiredMessage ? customRequiredMessage : message
    );
  });
}
