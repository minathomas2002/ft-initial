import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { PersonalInformationCard } from '../personal-information-card/personal-information-card';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';

@Component({
  selector: 'app-user-image-section',
  imports: [
    PersonalInformationCard,
    ButtonModule,
    AvatarModule
  ],
  templateUrl: './user-image-section.html',
  styleUrl: './user-image-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserImageSection {
  image = signal<string>('assets/images/user_placeholder.png');
}
