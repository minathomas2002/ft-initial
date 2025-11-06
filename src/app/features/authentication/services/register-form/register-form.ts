import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';

@Injectable()
export class RegisterFormService {
  private fb = inject(FormBuilder);
  registerForm = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    phone: ['', [Validators.required]],
  });

  get name(): FormControl<string | null> {
    return this.registerForm.get('name') as FormControl<string | null>;
  }

  get email(): FormControl<string | null> {
    return this.registerForm.get('email') as FormControl<string | null>;
  }

  get password(): FormControl<string | null> {
    return this.registerForm.get('password') as FormControl<string | null>;
  }

  get phone(): FormControl<string | null> {
    return this.registerForm.get('phone') as FormControl<string | null>;
  }
}

