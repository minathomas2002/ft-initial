import { Component, Input, OnInit } from '@angular/core';
import { ControlContainer, FormGroupDirective, FormControl } from '@angular/forms';
import { PasswordModule } from 'primeng/password';
import { ReactiveFormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Component({
  selector: 'app-password-policy',
  imports: [PasswordModule, ReactiveFormsModule, NgClass],
  templateUrl: './password-policy.html',
  styleUrl: './password-policy.scss',
  viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }],
})
export class PasswordPolicy implements OnInit {
  @Input() controlName!: string;

  get control(): FormControl | null {
    const parent = this.controlContainer?.control;
    return parent?.get(this.controlName) as FormControl;
  }

  constructor(private controlContainer: ControlContainer) {}

  ngOnInit() {
    // Add validator dynamically
    if (this.control) {
      const validators = this.control.validator
        ? [this.control.validator, passwordPolicyValidator()]
        : [passwordPolicyValidator()];

      this.control.setValidators(validators);
      this.control.updateValueAndValidity();
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

    if (value.length < 8) {
      errors['minLength'] = { requiredLength: 8, actualLength: value.length };
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      errors['specialChar'] = true;
    }

    // Return null if no errors
    return Object.keys(errors).length > 0 ? errors : null;
  };
}
