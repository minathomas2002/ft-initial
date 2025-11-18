import { inject, Injectable } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, ValidationErrors, Validators } from '@angular/forms';
import { passwordMatchValidator } from '../../validators/password-match-validator';

@Injectable()
export class ResetPasswordFormService {
  private fb = inject(FormBuilder);

  resetForm = this.fb.group(
    {
      token: ['', [Validators.required]],
      newPassword: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator }
  );

  get newPassword(): FormControl<string | null> {
    return this.resetForm.get('newPassword') as FormControl<string | null>;
  }

  get confirmPassword(): FormControl<string | null> {
    return this.resetForm.get('confirmPassword') as FormControl<string | null>;
  }

  get token(): FormControl<string | null> {
    return this.resetForm.get('token') as FormControl<string | null>;
  }
}