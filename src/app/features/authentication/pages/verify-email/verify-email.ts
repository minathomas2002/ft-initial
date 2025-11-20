import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TranslatePipe } from 'src/app/shared/pipes';
import { ERoutes } from 'src/app/shared/enums';
import { AuthStore } from 'src/app/shared/stores/auth/auth.store';

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
    debugger;
    this.verified.set(false);

    this.authStore.verifyEmail(token).subscribe({
      next: (response) => {
        debugger
        if (response.success) {
          this.verified.set(true);
        } else {
          // On failure, redirect to login
          this.router.navigate(['/', ERoutes.auth, ERoutes.login]);
        }
      },
      error: (error) => {
        debugger
        // On error, redirect to login
        console.error('Email verification error:', error);
        this.router.navigate(['/', ERoutes.auth, ERoutes.login]);
      },
    });
  }

  onBackToLogin() {
    this.router.navigate(['/', ERoutes.auth, ERoutes.login]);
  }
}

