import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
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
  showEditButton = model<boolean>(false);
  submitActionDisabled = input<boolean>(true);
  submitActionLabel = input<string>('Save Changes');
  onSubmit = output<void>();
  onEditClick = output<void>();
  onCancelClicked = output<void>();
}
