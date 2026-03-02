import { ChangeDetectionStrategy, Component, computed, inject, output, signal } from '@angular/core';
import { PersonalInformationCard } from '../personal-information-card/personal-information-card';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { ChangeYourProfilePictureModal } from '../Change your profile picture modal/Change-your-profile-picture-modal';
import { ProfileStore } from 'src/app/shared/stores/profile/profile.store';
import { ChangePassword } from '../change-password/change-password';

@Component({
  selector: 'app-user-image-section',
  imports: [
    ButtonModule,
    AvatarModule,
    ChangeYourProfilePictureModal,
    ChangePassword,
  ],
  templateUrl: './user-image-section.html',
  styleUrl: './user-image-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserImageSection {
  private profileStore = inject(ProfileStore);
  image = computed(() => this.profileStore.userImage());
  userName = computed(() => this.profileStore.userProfile()?.nameEn ?? '');
  userTitle = computed(() => this.profileStore.userTitle());
  changeYourProfilePictureVisible = signal<boolean>(false);
  changePasswordVisible = signal<boolean>(false);
  onProfilePictureUpdated = output<void>();

  onAvatarEditClick(): void {
    this.changeYourProfilePictureVisible.set(true);
  }

  onChangePasswordClick(): void {
    this.changePasswordVisible.set(true);
  }

  profilePictureUpdated(base64: string | null): void {
    this.onProfilePictureUpdated.emit();
  }
}
