import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ERoutes } from 'src/app/shared/enums';
import { TranslatePipe } from 'src/app/shared/pipes';
import { I18nService } from 'src/app/shared/services/i18n';
import { ToasterService } from 'src/app/shared/services/toaster/toaster.service';
import { AuthStore } from 'src/app/shared/stores/auth/auth.store';

@Component({
  selector: 'app-verification',
  imports: [ButtonModule, TranslatePipe],
  templateUrl: './verification.html',
  styleUrl: './verification.scss',
})
export class Verification implements OnInit {
  authStore = inject(AuthStore);
  route = inject(ActivatedRoute);
  router = inject(Router);
  toast = inject(ToasterService);
  i18nService = inject(I18nService);

  email = signal<string | null>(null);

  ngOnInit(): void {
    const emailParam = this.route.snapshot.queryParams['email'];
    if (emailParam) {
      this.email.set(emailParam);
    }
  }

  resendVerificationEmail() {
    const email = this.email();
    if (email) {
      this.authStore.resentVerifyEmail(email).subscribe({
        next: (response) => {
          if (response.statusCode === 200 || response.statusCode === 201) {
            // Show success message
            this.toast.success(this.i18nService.translate('auth.login.resendVerificationSuccess'));
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
