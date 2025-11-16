import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { IPhoneNumberControl } from 'src/app/shared/interfaces';

@Injectable()
export class RegisterFormService {
  private fb = inject(FormBuilder);
  registerForm = this.fb.group({
    fullName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    phone: this.fb.control<IPhoneNumberControl | null>(null, Validators.required)
  });
  
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
}

