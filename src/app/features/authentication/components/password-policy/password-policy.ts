import { Component, input, OnInit } from '@angular/core';
import { ControlContainer, FormGroupDirective, FormControl } from '@angular/forms';
import { PasswordModule } from 'primeng/password';
import { ReactiveFormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { BaseLabelComponent } from 'src/app/shared/components/base-components/base-label/base-label.component';
import { TranslatePipe } from 'src/app/shared/pipes';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-password-policy',
  imports: [
    PasswordModule,
    ReactiveFormsModule,
    NgClass,
    BaseLabelComponent,
    TranslatePipe,
    InputTextModule
  ],
  templateUrl: './password-policy.html',
  styleUrl: './password-policy.scss',
  viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }],
})
export class PasswordPolicy implements OnInit {
  formControl = input.required<FormControl>({
    alias: 'passwordFormControl',
  });

  constructor(private controlContainer: ControlContainer) {}

  ngOnInit() {
    // Add validator dynamically
    if (this.formControl()) {
      const validators = this.formControl().validator
        ? [this.formControl().validator, passwordPolicyValidator()]
        : [passwordPolicyValidator()];

      this.formControl().setValidators(validators as ValidatorFn[]);
      this.formControl().updateValueAndValidity();
    }
  }
}

export function passwordPolicyValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value || '';

    // Track each error separately
    const errors: ValidationErrors = {};

    if (!value) {
      errors['required'] = true;
      // If empty, no need to check other rules
      return errors;
    }

    // Min 8 and Max 20 characters
    if (value.length < 8) {
      errors['minLength'] = { requiredLength: 8, actualLength: value.length };
    }
    if (value.length > 20) {
      errors['maxLength'] = { requiredLength: 20, actualLength: value.length };
    }

    // At least 1 uppercase letter
    if (!/[A-Z]/.test(value)) {
      errors['uppercase'] = true;
    }

    // At least 1 lowercase letter
    if (!/[a-z]/.test(value)) {
      errors['lowercase'] = true;
    }

    // At least 1 number
    if (!/[0-9]/.test(value)) {
      errors['number'] = true;
    }

    // At least 1 special character
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      errors['specialChar'] = true;
    }

    // Return null if no errors
    return Object.keys(errors).length > 0 ? errors : null;
  };
}
