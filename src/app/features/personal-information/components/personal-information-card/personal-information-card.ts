import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-personal-information-card',
  imports: [ButtonModule],
  templateUrl: './personal-information-card.html',
  styleUrl: './personal-information-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonalInformationCard {
  sectionTitle = input<string>('');
  sectionDescription = input<string>('');
  showEditButton = input<boolean>(false);
  submitActionDisabled = input<boolean>(false);
  submitActionLabel = input<string>('Save Changes');
  onSubmit = output<void>();
}
