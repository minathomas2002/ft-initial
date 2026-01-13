import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { InputTextModule } from 'primeng/inputtext';
import { BaseLabelComponent } from 'src/app/shared/components/base-components/base-label/base-label.component';
import { BaseErrorComponent } from 'src/app/shared/components/base-components/base-error/base-error.component';
import { TranslatePipe } from 'src/app/shared/pipes';
import { PasswordToggleComponent } from 'src/app/shared/components/form/password-toggle/password-toggle.component';
import { PasswordPolicy } from '../../components/password-policy/password-policy';
import { ResetPasswordFormService } from '../../services/reset-password-form/reset-password-form';
import { AuthStore } from 'src/app/shared/stores/auth/auth.store';
import { ERoutes } from 'src/app/shared/enums';
import { IResetPasswordRequest } from 'src/app/shared/interfaces';
import { I18nService } from 'src/app/shared/services/i18n';
import { ToasterService } from 'src/app/shared/services/toaster/toaster.service';

@Component({
  selector: 'app-reset-password',
  imports: [
    ReactiveFormsModule,
    RouterModule,
    ButtonModule,
    PasswordModule,
    InputTextModule,
    BaseLabelComponent,
    BaseErrorComponent,
    TranslatePipe,
    PasswordPolicy,
    PasswordToggleComponent,
  ],
  providers: [ResetPasswordFormService],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPassword implements OnInit {
  resetPasswordFormService = inject(ResetPasswordFormService);
  resetPasswordForm = this.resetPasswordFormService.resetForm;
  authStore = inject(AuthStore);
  route = inject(ActivatedRoute);
  router = inject(Router);
  toast = inject(ToasterService);
  i18nService = inject(I18nService);
  isValidToken = signal(false);

  ngOnInit() {
    // Read token from URL query params and set it in the form
    this.route.queryParams.subscribe((params) => {
      const token = params['token'] || null;
      if (!token) {
        // If no token, redirect to login
        this.router.navigate(['/', ERoutes.auth, ERoutes.login]);
      } else {
        // Set token in hidden form field
        this.resetPasswordFormService.token.setValue(token);
        this.authStore.passwordResetTokenExpiry(token).subscribe({
          next: (response) => {
            if (response.success && response.body !== true) {
              this.toast.error(this.i18nService.translate('auth.reset.tokenExpired'));
              this.router.navigate(['/', ERoutes.auth, ERoutes.forgotPassword]);
            } else {
              this.isValidToken.set(true);
            }
          },
          error: (error) => {
            this.router.navigate(['/', ERoutes.auth, ERoutes.forgotPassword]);
          },
        });
      }
    });
  }

  onSubmit() {
    if (this.resetPasswordForm.valid) {
      var formValue: IResetPasswordRequest = {
        token: this.resetPasswordFormService.token.value ?? '',
        newPassword: this.resetPasswordFormService.password.value ?? '',
        confirmPassword: this.resetPasswordFormService.confirmPassword.value ?? '',
      };

      this.authStore.resetPassword(formValue).subscribe({
        next: (response) => {
          if (response.success) {
            // Redirect to login on success
            this.router.navigate(['/', ERoutes.auth, ERoutes.login]);
            this.toast.success(this.i18nService.translate('auth.reset.success'));
          }
        },
        error: (error) => {
          console.error('Reset password error:', error);
        },
      });
    } else {
      this.resetPasswordForm.markAllAsTouched();
    }
  }
}
