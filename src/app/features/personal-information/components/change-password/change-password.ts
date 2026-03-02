import { ChangeDetectionStrategy, Component, effect, inject, model } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { PasswordPolicy, passwordPolicyValidator } from 'src/app/features/authentication/components/password-policy/password-policy';
import { passwordMatchValidator } from 'src/app/features/authentication/validators/password-match-validator';
import { BaseDialogComponent } from 'src/app/shared/components/base-components/base-dialog/base-dialog.component';
import { BaseLabelComponent } from 'src/app/shared/components/base-components/base-label/base-label.component';
import { PasswordToggleComponent } from 'src/app/shared/components/form/password-toggle/password-toggle.component';
import { BaseErrorMessages } from 'src/app/shared/components/base-components/base-error-messages/base-error-messages';
import { ProfileStore } from 'src/app/shared/stores/profile/profile.store';
import { ToasterService } from 'src/app/shared/services/toaster/toaster.service';

@Component({
  selector: 'app-change-password',
  imports: [
    BaseDialogComponent,
    ReactiveFormsModule,
    BaseLabelComponent,
    PasswordToggleComponent,
    PasswordPolicy,
    BaseErrorMessages
  ],
  templateUrl: './change-password.html',
  styleUrl: './change-password.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangePassword {
  constructor() {
    effect(() => {
      if (this.visible()) {
        this.changePasswordForm.reset();
      }
    })
  }

  private readonly fb = inject(FormBuilder);
  private readonly toasterService = inject(ToasterService);
  readonly profileStore = inject(ProfileStore);

  visible = model<boolean>(false);
  changePasswordForm = this.fb.group(
    {
      currentPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]],
      password: ['', [Validators.required, passwordPolicyValidator()]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator }
  );

  get currentPassword(): FormControl<string | null> {
    return this.changePasswordForm.get('currentPassword') as FormControl<string | null>;
  }

  get password(): FormControl<string | null> {
    return this.changePasswordForm.get('password') as FormControl<string | null>;
  }

  get confirmPassword(): FormControl<string | null> {
    return this.changePasswordForm.get('confirmPassword') as FormControl<string | null>;
  }

  onCancel(): void {
    this.changePasswordForm.reset();
    this.visible.set(false);
  }

  onConfirm(): void {
    if (this.changePasswordForm.invalid) {
      this.changePasswordForm.markAllAsTouched();
      return;
    }

    const request = {
      currentPassword: this.currentPassword.value ?? '',
      newPassword: this.password.value ?? '',
    };

    this.profileStore.changePassword(request).subscribe({
      next: (response) => {
        if (response.success) {
          this.toasterService.success('Password changed successfully.');
          this.changePasswordForm.reset();
          this.visible.set(false);
        }
      },
      error: (error) => {
        const message = error?.error?.message ?? error?.error?.errorMessage ?? error?.message ?? 'Failed to change password.';
        this.toasterService.error(message);
      },
    });
  }
}
