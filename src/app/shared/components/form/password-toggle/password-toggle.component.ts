import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-password-toggle',
  imports: [ReactiveFormsModule, InputTextModule, CommonModule],
  templateUrl: './password-toggle.component.html',
  styleUrl: './password-toggle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordToggleComponent {
  control = input<FormControl>();
  placeholder = input<string>('');
  autocomplete = input<string>('new-password');
  showPassword = signal(false);

  togglePasswordVisibility() {
    this.showPassword.update(value => !value);
  }

  inputType = computed(() => this.showPassword() ? 'text' : 'password');
}
