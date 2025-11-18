import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { InputTextModule } from 'primeng/inputtext';
import { BaseLabelComponent } from 'src/app/shared/components/base-components/base-label/base-label.component';
import { TranslatePipe } from 'src/app/shared/pipes';
import { PasswordPolicy } from '../../components/password-policy/password-policy';
import { ResetPasswordFormService } from '../../services/reset-password-form/reset-password-form';
import { AuthStore } from 'src/app/shared/stores/auth/auth.store';
import { ERoutes } from 'src/app/shared/enums';
import { IResetPasswordRequest } from 'src/app/shared/interfaces';

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
    PasswordPolicy,
  ],
  providers: [ResetPasswordFormService],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
})
export class ResetPassword implements OnInit {
  resetPasswordFormService = inject(ResetPasswordFormService);
  resetPasswordForm = this.resetPasswordFormService.resetForm;
  authStore = inject(AuthStore);
  route = inject(ActivatedRoute);
  router = inject(Router);

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
      }
    });
  }

  onSubmit() {
    if (this.resetPasswordForm.valid) {
      var formValue = this.resetPasswordForm.value as IResetPasswordRequest;

      this.authStore.resetPassword(formValue).subscribe({
        next: (response) => {
          if (response.success) {
            // Redirect to login on success
            this.router.navigate(['/', ERoutes.auth, ERoutes.login]);
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
