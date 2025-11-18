import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BaseLabelComponent } from 'src/app/shared/components/base-components/base-label/base-label.component';
import { TranslatePipe } from 'src/app/shared/pipes/translate.pipe';
import { LoginFormService } from '../../services/login-form/login-form';
import { environment } from 'src/environments/environment';
import { AuthStore } from 'src/app/shared/stores/auth/auth.store';
import { ERoutes } from 'src/app/shared/enums';

@Component({
  selector: 'app-login',
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
  providers: [LoginFormService],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {
  loginFormService = inject(LoginFormService);
  authStore = inject(AuthStore);
  router = inject(Router);
  route = inject(ActivatedRoute);
  

  isSecInternal = signal(window.location.origin == environment.secDomain);
  isFakeDev = signal(false);

  loginForm = this.loginFormService.loginForm;

  ngOnInit(): void {
    //if domain is sec domain
    if (this.isSecInternal()) {
      this.authStore.windowsLogin().subscribe({
        next: (response) => {
          if (response.success) {
            this.router.navigate(['/', ERoutes.dashboard]);
          }
        },
      });
    }else if(!environment.production && this.route.snapshot.queryParamMap.get('dev')) {
      this.isFakeDev.set(true)
    }
  }

  publicLogin() {
    if (this.loginForm.valid) {
      const formValue = this.loginForm.value;
      this.authStore.login(formValue.email!, formValue.password!).subscribe({
        next: (response) => {
          if (response.success) {
            this.router.navigate(['/', ERoutes.dashboard]);
          }
        },
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  fakeLogin(userName: string) {
    this.authStore.fakeWindowsLogin(userName).subscribe({
      next: (response) => {
        if (response.success) {
          this.router.navigate(['/', ERoutes.dashboard]);
        }
      },
    });
  }
}
