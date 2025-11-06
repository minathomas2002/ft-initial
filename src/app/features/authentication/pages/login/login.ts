import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { RouterModule } from '@angular/router';
import { BaseLabelComponent } from "src/app/shared/components/base-components/base-label/base-label.component";
import { LoginFormService } from '../../services/login-form';
import { I18nService } from 'src/app/shared/services/i18n';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    CheckboxModule,
    RouterModule,
    BaseLabelComponent
],
  providers: [LoginFormService],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  loginFormService = inject(LoginFormService);
  loginForm = this.loginFormService.loginForm;
  i18nService = inject(I18nService);
  onSubmit() {
    if (this.loginForm.valid) {
      console.log('Form Data:', this.loginForm.value);
      // call your login API here
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
