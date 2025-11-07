import { Component, inject } from '@angular/core';
import { ForgotPasswordFormService } from '../../services/forgot-password-form/forgot-password-form';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { BaseLabelComponent } from 'src/app/shared/components/base-components/base-label/base-label.component';
import { TranslatePipe } from 'src/app/shared/pipes';

@Component({
  selector: 'app-forgot-password',
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    CheckboxModule,
    RouterModule,
    BaseLabelComponent,
    TranslatePipe,
  ],
  providers: [ForgotPasswordFormService],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
})
export class ForgotPassword {
  forgotPasswordFormService = inject(ForgotPasswordFormService);
  forgotPasswordForm = this.forgotPasswordFormService.forgotForm;
  onSubmit() {
    if (this.forgotPasswordForm.valid) {
      console.log('Form Data:', this.forgotPasswordForm.value);
      // call your Forgot API here
    } else {
      this.forgotPasswordForm.markAllAsTouched();
    }
  }
}
