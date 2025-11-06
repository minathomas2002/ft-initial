import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';
import { CountryISO, NgxIntlTelInputModule, SearchCountryField } from 'ngx-intl-tel-input';
import { PasswordPolicy } from '../../components/password-policy/password-policy';
import { RegisterFormService } from '../../services/register-form/register-form';
import { I18nService } from 'src/app/shared/services/i18n';
import { BaseLabelComponent } from 'src/app/shared/components/base-components/base-label/base-label.component';

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

  //enum
  searchCountryField = SearchCountryField;
  countryISO = CountryISO;

  onSubmit() {
    if (this.registerForm.valid) {
      console.log('Form Data:', this.registerForm.value);
      // call your register API here
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
