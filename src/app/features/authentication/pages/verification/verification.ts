import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';
import { ResetButton } from '../../components/reset-button/reset-button';
import { ERoutes } from 'src/app/shared/enums';
import { TranslatePipe } from 'src/app/shared/pipes';
import { I18nService } from 'src/app/shared/services/i18n';
import { ToasterService } from 'src/app/shared/services/toaster/toaster.service';
import { AuthStore } from 'src/app/shared/stores/auth/auth.store';

@Component({
  selector: 'app-verification',
  imports: [ButtonModule, TranslatePipe, ResetButton],
  templateUrl: './verification.html',
  styleUrl: './verification.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Verification implements OnInit {
  authStore = inject(AuthStore);
  route = inject(ActivatedRoute);
  router = inject(Router);
  toast = inject(ToasterService);
  i18nService = inject(I18nService);

  email = signal<string | null>(null);
  isButtonLoading = signal(false);
  resendSuccessToken = 0;

  ngOnInit(): void {
    const emailParam = this.route.snapshot.queryParams['email'];
    if (emailParam) {
      this.email.set(emailParam);
      this.resendVerificationEmail();
    }
  }

  resendVerificationEmail() {
    const email = this.email();
    if (email) {
      this.isButtonLoading.set(true);
      this.authStore.resentVerifyEmail(email)
      .pipe(finalize(() => this.isButtonLoading.set(false)))
      .subscribe({
        next: (response) => {
          if (response.statusCode === 200 || response.statusCode === 201) {
            this.toast.success(this.i18nService.translate('auth.login.resendVerificationSuccess'));
            this.resendSuccessToken++;
          }
        },
        error: (error) => {
          console.error('Resend verification email error:', error);
        },
      });
    }
  }

  onBackToLogin() {
    this.router.navigate(['/', ERoutes.auth, ERoutes.login]);
  }
}
