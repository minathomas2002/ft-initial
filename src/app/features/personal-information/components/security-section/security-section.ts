import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ChangePassword } from '../change-password/change-password';
import { PersonalInformationCard } from '../personal-information-card/personal-information-card';

@Component({
  selector: 'app-security-section',
  standalone: true,
  imports: [PersonalInformationCard, ButtonModule, ChangePassword],
  templateUrl: './security-section.html',
  styleUrl: './security-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecuritySection {
  changePasswordVisible = signal<boolean>(false);

  onChangePasswordClick(): void {
    this.changePasswordVisible.set(true);
  }
}
