import { ChangeDetectionStrategy, Component, computed, inject, input, model, OnDestroy, output, signal } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { BaseDialogComponent } from 'src/app/shared/components/base-components/base-dialog/base-dialog.component';
import { GeneralConfirmationDialogComponent } from 'src/app/shared/components/utility-components/general-confirmation-dialog/general-confirmation-dialog.component';
import { TranslatePipe } from 'src/app/shared/pipes/translate.pipe';
import { AttachmentService } from 'src/app/shared/services/attachment/attachment.service';
import { ToasterService } from 'src/app/shared/services/toaster/toaster.service';
import { ProfileStore } from 'src/app/shared/stores/profile/profile.store';

@Component({
  selector: 'app-change-your-profile-picture-modal',
  imports: [
    BaseDialogComponent,
    AvatarModule,
    ButtonModule,
    GeneralConfirmationDialogComponent,
    TranslatePipe,
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
  cancelLabel = 'Back';
  attachmentService = inject(AttachmentService);
  private toasterService = inject(ToasterService);
  onProfilePictureUpdated = output<string | null>();
  private profileStore = inject(ProfileStore);
  profilePictureProcessing = computed(() => this.profileStore.profilePictureProcessing());

  deleteConfirmVisible = signal<boolean>(false);

  private readonly maxFileSize = 2 * 1024 * 1024; // 2MB
  private readonly acceptedTypes = ['image/jpg', 'image/png'];

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    if (!this.acceptedTypes.includes(file.type)) {
      this.toasterService.error('Invalid file type or file size exceeds 2MB.');
      input.value = '';
      return;
    }

    if (file.size > this.maxFileSize) {
      this.toasterService.error('Invalid file type or file size exceeds 2MB.');
      input.value = '';
      return;
    }

    this.revokePreviewUrl();
    this.newProfilePicture.set(file);
    this.allowSaveAction.set(true);
    this.previewImageUrl.set(URL.createObjectURL(file));
    input.value = ''; // Reset so selecting same file again triggers change
  }

  onDeleteUserPhotoClick(): void {
    this.deleteConfirmVisible.set(true);
  }

  onConfirmDeleteUserPhoto(): void {
    this.revokePreviewUrl();
    this.newProfilePicture.set(null);
    this.previewImageUrl.set(null);
    this.allowSaveAction.set(true);
    this.onProfilePictureUpdated.emit(null);
    this.deleteConfirmVisible.set(false);
  }

  onSaveUserPhoto(): void {
    this.attachmentService.resizeImages(this.newProfilePicture()!, 120).then((res) => {
      this.attachmentService.fileToBase64(res).then((base64) => {
        this.onProfilePictureUpdated.emit(base64);
      });
    });
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

  onCloseClick(): void {
    this.newProfilePicture.set(null);
    this.previewImageUrl.set(null);
    this.allowSaveAction.set(false);
  }
}
