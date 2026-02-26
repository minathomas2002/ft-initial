import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { PersonalInformationCard } from '../personal-information-card/personal-information-card';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { ChangeYourProfilePictureModal } from '../Change your profile picture modal/Change-your-profile-picture-modal';

@Component({
  selector: 'app-user-image-section',
  imports: [
    ButtonModule,
    AvatarModule,
    ChangeYourProfilePictureModal
  ],
  templateUrl: './user-image-section.html',
  styleUrl: './user-image-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserImageSection {
  image = signal<string>('assets/images/user_placeholder.svg');
  userName = signal<string>('John Doe');
  userTitle = signal<string>('Software Engineer');
  changeYourProfilePictureVisible = signal<boolean>(false);

  onAvatarEditClick(): void {
    this.changeYourProfilePictureVisible.set(true);
  }
}
