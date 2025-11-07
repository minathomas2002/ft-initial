import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';

@Injectable()
export class ForgotPasswordFormService {
  private fb = inject(FormBuilder);
  forgotForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]    
  });

  get email(): FormControl<string | null> {
    return this.forgotForm.get('email') as FormControl<string | null>;
  }
}
