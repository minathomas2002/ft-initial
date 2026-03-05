import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AvatarModule } from 'primeng/avatar';
import { ChangeYourProfilePictureModal } from '../Change your profile picture modal/Change-your-profile-picture-modal';
import { ProfileStore } from 'src/app/shared/stores/profile/profile.store';
import { ToasterService } from 'src/app/shared/services/toaster/toaster.service';
import { I18nService } from 'src/app/shared/services/i18n';

@Component({
  selector: 'app-user-image-section',
  imports: [
    AvatarModule,
    ChangeYourProfilePictureModal,
  ],
  templateUrl: './user-image-section.html',
  styleUrl: './user-image-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserImageSection {
  private profileStore = inject(ProfileStore);
  private toasterService = inject(ToasterService);
  private i18nService = inject(I18nService);
  private destroyRef = inject(DestroyRef);

  image = computed(() => this.profileStore.userImage());
  userName = computed(() => this.profileStore.userProfile()?.nameEn ?? '');
  userTitle = computed(() => this.profileStore.userTitle());
  changeYourProfilePictureVisible = signal<boolean>(false);
  onProfilePictureUpdated = output<void>();

  onAvatarEditClick(): void {
    this.changeYourProfilePictureVisible.set(true);
  }

  profilePictureUpdated(base64: string | null): void {
    const profilePicBase64 = base64 ?? '';
    this.profileStore
      .updateProfilePic({ profilePicBase64 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (res.success) {
            const messageKey = base64 === null ? 'profile.messages.profilePictureRemoved' : 'profile.messages.profilePictureUpdated';
            const fallback = base64 === null ? 'Profile picture removed successfully' : 'Profile picture updated successfully';
            this.toasterService.success(
              this.i18nService.translate(messageKey) ?? fallback,
            );
            this.changeYourProfilePictureVisible.set(false);
            this.onProfilePictureUpdated.emit();
          } else {
            this.toasterService.error(res.message?.join(' ') ?? this.i18nService.translate('profile.messages.updateFailed'));
          }
        },
        error: () => {
          this.toasterService.error(this.i18nService.translate('profile.messages.updateFailed'));
        },
      });
  }
}
