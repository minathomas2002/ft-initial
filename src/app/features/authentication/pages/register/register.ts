import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { Router, RouterModule } from '@angular/router';
import { PasswordPolicy } from '../../components/password-policy/password-policy';
import { RegisterFormService } from '../../services/register-form/register-form';
import { BaseLabelComponent } from 'src/app/shared/components/base-components/base-label/base-label.component';
import { AuthStore } from 'src/app/shared/stores/auth/auth.store';
import { IRegisterRequest } from 'src/app/shared/interfaces';
import { ERoutes } from 'src/app/shared/enums';
import { TranslatePipe } from 'src/app/shared/pipes';
import { ToasterService } from 'src/app/shared/services/toaster/toaster.service';
import { I18nService } from 'src/app/shared/services/i18n/i18n.service';
import { PhoneInputComponent } from 'src/app/shared/components/form/phone-input/phone-input.component';
@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    RouterModule,
    PasswordPolicy,
    BaseLabelComponent,
    TranslatePipe,
    PhoneInputComponent,
  ],
  providers: [RegisterFormService],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  registerFormService = inject(RegisterFormService);
  registerForm = this.registerFormService.registerForm;
  authStore = inject(AuthStore);
  router = inject(Router);
  toast = inject(ToasterService);
  i18nService = inject(I18nService);

  onSubmit() {
    if (this.registerForm.valid) {
      var formValue = this.registerForm.value;
      console.log(formValue);
      var request: IRegisterRequest = {
        fullName: formValue.fullName!,
        email: formValue.email!,
        password: formValue.password!,
        confirmPassword: formValue.password!,
        countryCode: formValue.phone?.countryCode!,
        phoneNumber: formValue.phone?.phoneNumber?.replace(/\s/g, '') || '',
      };
      this.authStore.register(request).subscribe({
        next: (response) => {
          if (response.success) {
            this.router.navigate(['/', ERoutes.auth, ERoutes.verification], {
              queryParams: { email: this.registerForm.value.email! },
            });
          }
        },
        error: (error) => {
          if (error.statusCode === 500) {
            this.toast.error(this.i18nService.translate('auth.register.generalError'));
          }
        },
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
