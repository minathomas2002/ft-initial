import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { RouterModule } from '@angular/router';
import { BaseLabelComponent } from "src/app/shared/components/base-components/base-label/base-label.component";
import { TranslatePipe } from 'src/app/shared/pipes/translate.pipe';
import { LoginFormService } from '../../services/login-form/login-form';

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
    TranslatePipe
],
  providers: [LoginFormService],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  loginFormService = inject(LoginFormService);
  loginForm = this.loginFormService.loginForm;
  onSubmit() {
    if (this.loginForm.valid) {
      console.log('Form Data:', this.loginForm.value);
      // call your login API here
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
