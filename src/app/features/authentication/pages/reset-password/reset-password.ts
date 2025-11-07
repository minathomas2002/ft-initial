import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { InputTextModule } from 'primeng/inputtext';
import { BaseLabelComponent } from 'src/app/shared/components/base-components/base-label/base-label.component';
import { TranslatePipe } from 'src/app/shared/pipes';
import { PasswordPolicy } from '../../components/password-policy/password-policy';
import { ResetPasswordFormService } from '../../services/reset-password-form/reset-password-form';

@Component({
  selector: 'app-reset-password',
  imports: [
    ReactiveFormsModule,
    RouterModule,
    ButtonModule,
    PasswordModule,
    InputTextModule,
    BaseLabelComponent,
    TranslatePipe,
    PasswordPolicy
  ],
  providers: [ResetPasswordFormService],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
})
export class ResetPassword {
  resetPasswordFormService = inject(ResetPasswordFormService);
  resetPasswordForm = this.resetPasswordFormService.resetForm;

  onSubmit() {
    if (this.resetPasswordForm.valid) {
      console.log('Reset Password Data:', this.resetPasswordForm.value);
      // call reset password API here
    } else {
      this.resetPasswordForm.markAllAsTouched();
    }
  }
}

