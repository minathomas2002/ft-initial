import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ForgotPasswordFormService } from '../../services/forgot-password-form/forgot-password-form';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { BaseLabelComponent } from 'src/app/shared/components/base-components/base-label/base-label.component';
import { BaseErrorComponent } from 'src/app/shared/components/base-components/base-error/base-error.component';
import { TranslatePipe } from 'src/app/shared/pipes';
import { AuthStore } from 'src/app/shared/stores/auth/auth.store';
import { I18nService } from 'src/app/shared/services/i18n';
import { ToasterService } from 'src/app/shared/services/toaster/toaster.service';
import { finalize } from 'rxjs';
import { ResetButton } from '../../components/reset-button/reset-button';

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
    BaseErrorComponent,
    TranslatePipe,
    ResetButton,
  ],
  providers: [ForgotPasswordFormService],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPassword {
  forgotPasswordFormService = inject(ForgotPasswordFormService);
  forgotPasswordForm = this.forgotPasswordFormService.forgotForm;
  authStore = inject(AuthStore);
  toast = inject(ToasterService);
  i18nService = inject(I18nService);
  resendSuccessToken = 0;
  protected readonly isSubmitLoading = signal(false);
  protected readonly showResendResetLink = signal(false);
  protected readonly isResendLoading = signal(false);
  protected readonly isResetPasswordDisabled = signal(false);

  onSubmit() {
    if (this.forgotPasswordForm.valid) {
      const email = this.forgotPasswordForm.value.email!;

      this.isSubmitLoading.set(true);
      this.authStore
        .forgotPassword(email)
        .pipe(finalize(() => this.isSubmitLoading.set(false)))
        .subscribe({
          next: (response) => {
            if (response.statusCode === 200 || response.statusCode === 201) {
              this.showResendResetLink.set(true);
              this.isResetPasswordDisabled.set(true);
              this.resendSuccessToken++;
              this.toast.success(response.body.message);
            }
          },
          error: (error) => {
            console.error('Forgot password error:', error);
          },
        });
    } else {
      this.forgotPasswordForm.markAllAsTouched();
    }
  }

  resendEmail() {
    const email = this.forgotPasswordForm.value.email!;
    if (email) {
      this.isResendLoading.set(true);
      this.authStore
        .forgotPassword(email)
        .pipe(finalize(() => this.isResendLoading.set(false)))
        .subscribe({
          next: (response) => {
            if (response.statusCode === 200 || response.statusCode === 201) {
              this.toast.success(this.i18nService.translate('auth.forgot.success'));
              this.resendSuccessToken++;
            }
          },
          error: (error) => {
            console.error('Resend reset link error:', error);
          },
        });
    }
  }
}
