import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ChangePassword } from '../change-password/change-password';
import { PersonalInformationCard } from '../personal-information-card/personal-information-card';
import { TranslatePipe } from 'src/app/shared/pipes/translate.pipe';

@Component({
  selector: 'app-security-section',
  standalone: true,
  imports: [PersonalInformationCard, ButtonModule, ChangePassword, TranslatePipe],
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
