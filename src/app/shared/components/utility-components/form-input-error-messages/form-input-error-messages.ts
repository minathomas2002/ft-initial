import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { MessageModule } from 'primeng/message';

interface ErrorMessage {
  message: string;
}

@Component({
  selector: 'app-form-input-error-messages',
  imports: [MessageModule],
  templateUrl: './form-input-error-messages.html',
  styleUrl: './form-input-error-messages.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormInputErrorMessages {
  control = input.required<AbstractControl>();

  // Convert FormControl errors to error messages format
  errors = computed<ErrorMessage[]>(() => {
    const ctrl = this.control();
    console.log(this.control());

    if (!ctrl || !ctrl.errors || !ctrl.touched || !ctrl.invalid) {
      return [];
    }

    const errorMessages: ErrorMessage[] = [];
    const errors = ctrl.errors;

    // Handle different error types
    for (const key in errors) {
      if (errors.hasOwnProperty(key)) {
        const error = errors[key];
        if (error && typeof error === 'object') {
          // Check if it's a custom error with message property
          if ('message' in error) {
            errorMessages.push({ message: error.message as string });
          } else {
            // Handle standard Angular validators
            const messages: Record<string, string> = {
              required: 'This field is required',
              maxlength: `Maximum length exceeded`,
              minlength: `Minimum length not met`,
              email: 'Invalid email format',
              pattern: 'Invalid format',
              minQuantityError: 'Min quantity must be less than max quantity',
              maxQuantityError: 'Max quantity must be greater than min quantity',
              invalidRange: 'You should select a date range',
              invalidArray: 'At least one valid entry is required',
            };
            errorMessages.push({ message: messages[key] || `Validation error: ${key}` });
          }
        } else {
          // Fallback for simple error values
          errorMessages.push({ message: `Validation error: ${key}` });
        }
      }
    }

    return errorMessages;
  });

  isInvalid = computed(() => {
    const ctrl = this.control();
    return ctrl ? (ctrl.invalid && ctrl.touched) : false;
  });
}
