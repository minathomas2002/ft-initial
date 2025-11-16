import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { Router, RouterModule } from '@angular/router';
import { CountryISO, NgxIntlTelInputModule, SearchCountryField } from 'ngx-intl-tel-input';
import { PasswordPolicy } from '../../components/password-policy/password-policy';
import { RegisterFormService } from '../../services/register-form/register-form';
import { I18nService } from 'src/app/shared/services/i18n';
import { BaseLabelComponent } from 'src/app/shared/components/base-components/base-label/base-label.component';
import { AuthStore } from 'src/app/shared/stores/auth/auth.store';
import { IRegisterRequest } from 'src/app/shared/interfaces';
import { ERoutes } from 'src/app/shared/enums';

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    RouterModule,
    NgxIntlTelInputModule,
    PasswordPolicy,
    BaseLabelComponent
  ],
  providers: [RegisterFormService],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  registerFormService = inject(RegisterFormService);
  registerForm = this.registerFormService.registerForm;
  i18nService = inject(I18nService);
  authStore = inject(AuthStore);
  router = inject(Router);

  //enum
  searchCountryField = SearchCountryField;
  countryISO = CountryISO;

  onSubmit() {
    if (this.registerForm.valid) {
      var formValue = this.registerForm.value;
      var request: IRegisterRequest = {
        fullName: formValue.fullName!,
        email: formValue.email!,
        password: formValue.password!,
        confirmPassword: formValue.password!,
        countryCode: formValue.phone?.dialCode!,
        phoneNumber: formValue.phone?.nationalNumber!        
      }       
      this.authStore.register(request).subscribe({
        next: (response) => {
          if (response.succeeded) {
            this.router.navigate(['/', ERoutes.auth, ERoutes.login]);
          }
        },
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
