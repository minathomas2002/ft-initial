import { Component, inject } from '@angular/core';
import { ForgotPasswordFormService } from '../../services/forgot-password-form/forgot-password-form';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { BaseLabelComponent } from 'src/app/shared/components/base-components/base-label/base-label.component';
import { TranslatePipe } from 'src/app/shared/pipes';
import { AuthStore } from 'src/app/shared/stores/auth/auth.store';
import { ERoutes } from 'src/app/shared/enums';

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
  authStore = inject(AuthStore);
  router = inject(Router);

  onSubmit() {
    if (this.forgotPasswordForm.valid) {
      const email = this.forgotPasswordForm.value.email!;
      
      this.authStore.forgotPassword(email).subscribe({
        next: (response) => {
          if (response.status === 200 || response.status === 201) {
            // Redirect to login on success
            this.router.navigate(['/', ERoutes.auth, ERoutes.login]);
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
}
