import { Component, inject } from '@angular/core';
import { ForgotPasswordFormService } from '../../services/forgot-password-form/forgot-password-form';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { BaseLabelComponent } from 'src/app/shared/components/base-components/base-label/base-label.component';
import { BaseErrorComponent } from 'src/app/shared/components/base-components/base-error/base-error.component';
import { TranslatePipe } from 'src/app/shared/pipes';
import { AuthStore } from 'src/app/shared/stores/auth/auth.store';
import { ERoutes } from 'src/app/shared/enums';
import { I18nService } from 'src/app/shared/services/i18n';
import { ToasterService } from 'src/app/shared/services/toaster/toaster.service';

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
  ],
  providers: [ForgotPasswordFormService],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
})
export class ForgotPassword {
  forgotPasswordFormService = inject(ForgotPasswordFormService);
  forgotPasswordForm = this.forgotPasswordFormService.forgotForm;
  authStore = inject(AuthStore);
  router = inject(Router);
  toast = inject(ToasterService);
  i18nService = inject(I18nService);

  onSubmit() {
    if (this.forgotPasswordForm.valid) {
      const email = this.forgotPasswordForm.value.email!;

      this.authStore.forgotPassword(email).subscribe({
        next: (response) => {
          if (response.statusCode === 200 || response.statusCode === 201) {
            this.toast.success(this.i18nService.translate('auth.forgot.success'));
            // Redirect to login on success
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
      this.authStore.resentVerifyEmail(email).subscribe({
        next: (response) => {
          if (response.statusCode === 200 || response.statusCode === 201) {
            this.router.navigate(['/', ERoutes.auth, ERoutes.login]);
          }
        },
      });
    }
  }
}
