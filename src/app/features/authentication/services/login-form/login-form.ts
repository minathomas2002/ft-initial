import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';

@Injectable()
export class LoginFormService {
  private fb = inject(FormBuilder);
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    rememberMe: [false],
  });

  get email(): FormControl<string | null> {
    return this.loginForm.get('email') as FormControl<string | null>;
  }

  get password(): FormControl<string | null> {
    return this.loginForm.get('password') as FormControl<string | null>;
  }

  get rememberMe(): FormControl<boolean | null> {
    return this.loginForm.get('rememberMe') as FormControl<boolean | null>;
  }
}
