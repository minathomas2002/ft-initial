import { inject, Injectable } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, ValidationErrors, Validators } from '@angular/forms';
import { passwordMatchValidator } from '../../validators/password-match-validator';

@Injectable()
export class ResetPasswordFormService {
  private fb = inject(FormBuilder);

  resetForm = this.fb.group(
    {
      password: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator }
  );

  get password(): FormControl<string | null> {
    return this.resetForm.get('password') as FormControl<string | null>;
  }

  get confirmPassword(): FormControl<string | null> {
    return this.resetForm.get('confirmPassword') as FormControl<string | null>;
  }
}