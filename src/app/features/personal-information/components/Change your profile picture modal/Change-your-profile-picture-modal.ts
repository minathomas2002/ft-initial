import { ChangeDetectionStrategy, Component, input, model, OnDestroy, signal } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { BaseDialogComponent } from 'src/app/shared/components/base-components/base-dialog/base-dialog.component';

@Component({
  selector: 'app-change-your-profile-picture-modal',
  imports: [
    BaseDialogComponent,
    AvatarModule,
    ButtonModule
  ],
  templateUrl: './Change-your-profile-picture-modal.html',
  styleUrl: './Change-your-profile-picture-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangeYourProfilePictureModal implements OnDestroy {
  visible = model<boolean>(false);
  icon = 'icon-image-up';
  dialogTitle = 'Change your profile picture';
  image = input<string>('assets/images/user_placeholder.svg');
  userPlaceholderImage = 'assets/images/user_placeholder.svg';
  newProfilePicture = signal<File | null>(null);
  allowSaveAction = signal<boolean>(false);
  previewImageUrl = signal<string | null>(null);
  confirmLabel = 'Save';

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    this.revokePreviewUrl();
    this.newProfilePicture.set(file);
    this.allowSaveAction.set(true);
    this.previewImageUrl.set(URL.createObjectURL(file));
    input.value = ''; // Reset so selecting same file again triggers change
  }

  onDeleteUserPhoto(): void {
    this.revokePreviewUrl();
    this.newProfilePicture.set(null);
    this.previewImageUrl.set(null);
    this.allowSaveAction.set(true);
  }

  onSaveUserPhoto(): void {
    console.log('save user photo');
  }

  ngOnDestroy(): void {
    this.revokePreviewUrl();
  }

  private revokePreviewUrl(): void {
    const url = this.previewImageUrl();
    if (url) {
      URL.revokeObjectURL(url);
      this.previewImageUrl.set(null);
    }
  }
}
