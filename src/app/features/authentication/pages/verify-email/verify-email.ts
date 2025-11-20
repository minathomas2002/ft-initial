import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TranslatePipe } from 'src/app/shared/pipes';
import { ERoutes } from 'src/app/shared/enums';
import { AuthStore } from 'src/app/shared/stores/auth/auth.store';
import { ToasterService } from 'src/app/shared/services/toaster/toaster.service';
import { I18nService } from 'src/app/shared/services/i18n';

@Component({
  selector: 'app-verify-email',
  imports: [
    RouterModule,
    ButtonModule,
    ProgressSpinnerModule,
    TranslatePipe,
  ],
  templateUrl: './verify-email.html',
  styleUrl: './verify-email.scss',
})
export class VerifyEmail implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  authStore = inject(AuthStore);
  toaster = inject(ToasterService);
  i18nService = inject(I18nService);

  token = signal<string | null>(null);
  verified = signal<boolean>(false);

  ngOnInit() {
    // Read token from URL query params
    this.route.queryParams.subscribe((params) => {
      const tokenValue = params['token'] || null;

      if (!tokenValue) {
        // If no token, redirect to login
        this.router.navigate(['/', ERoutes.auth, ERoutes.login]);
        return;
      }

      this.token.set(tokenValue);
      this.verifyEmail(tokenValue);
    });
  }

  verifyEmail(token: string) {
    this.verified.set(false);

    this.authStore.verifyEmail(token).subscribe({
      next: (response) => {
        if (response.success) {
          this.verified.set(true);
          this.toaster.success(this.i18nService.translate('auth.verifyEmail.success'));
          // On failure, redirect to login
          this.router.navigate(['/', ERoutes.auth, ERoutes.login]);
        }
      },
      error: (error) => {
        this.router.navigate(['/', ERoutes.auth, ERoutes.login]);
      }
    });
  }

  onBackToLogin() {
    this.router.navigate(['/', ERoutes.auth, ERoutes.login]);
  }
}

