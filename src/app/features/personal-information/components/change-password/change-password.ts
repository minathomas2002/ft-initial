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
import { I18nService } from 'src/app/shared/services/i18n';
import { TranslatePipe } from 'src/app/shared/pipes/translate.pipe';

@Component({
  selector: 'app-change-password',
  imports: [
    BaseDialogComponent,
    TranslatePipe,
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
  private readonly fb = inject(FormBuilder);
  private readonly toasterService = inject(ToasterService);
  private readonly i18nService = inject(I18nService);
  readonly profileStore = inject(ProfileStore);
  protected confirmLabel = 'profile.update';

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

    const auth_data = localStorage.getItem('auth_data');

    const currentRefreshToken = auth_data ? JSON.parse(auth_data).refreshToken : null;
    

    const request = {
      currentPassword: this.currentPassword.value ?? '',
      newPassword: this.password.value ?? '',
      refreshToken: currentRefreshToken ?? '',
    };

    this.profileStore.changePassword(request).subscribe({
      next: (response) => {
        if (response.success) {
          this.toasterService.success(this.i18nService.translate('profile.messages.passwordUpdated'));
          this.changePasswordForm.reset();
          this.visible.set(false);
        }
      },
    });
  }
}
