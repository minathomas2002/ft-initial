import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { IPhoneNumberControl } from 'src/app/shared/interfaces';
import { onlyTextValidator } from 'src/app/shared/validators/only-text.validator';
import { phoneNumberPatternValidator } from 'src/app/shared/validators/phone-number.validator';
import { passwordMatchValidator } from '../../validators/password-match-validator';

@Injectable()
export class RegisterFormService {
  private fb = inject(FormBuilder);
  registerForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.maxLength(100), onlyTextValidator()]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
    password: ['', [Validators.required]],
    confirmPassword: ['', [Validators.required]],
    phone: this.fb.control<IPhoneNumberControl | null>(null, [Validators.required, phoneNumberPatternValidator()])
  }, { validators: passwordMatchValidator });

  get fullName(): FormControl<string | null> {
    return this.registerForm.get('fullName') as FormControl<string | null>;
  }

  get email(): FormControl<string | null> {
    return this.registerForm.get('email') as FormControl<string | null>;
  }

  get password(): FormControl<string | null> {
    return this.registerForm.get('password') as FormControl<string | null>;
  }

  get phone(): FormControl<any | null> {
    return this.registerForm.get('phone') as FormControl<any | null>;
  }

  get confirmPassword(): FormControl<string | null> {
    return this.registerForm.get('confirmPassword') as FormControl<string | null>;
  }
}

