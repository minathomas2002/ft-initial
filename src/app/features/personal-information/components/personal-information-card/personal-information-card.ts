import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TranslatePipe } from 'src/app/shared/pipes';

@Component({
  selector: 'app-personal-information-card',
  standalone: true,
  imports: [ButtonModule, TranslatePipe],
  templateUrl: './personal-information-card.html',
  styleUrl: './personal-information-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonalInformationCard {
  sectionTitle = input<string>('');
  sectionDescription = input<string>('');
  submitActionDisabled = input<boolean>(true);
  submitActionLabel = input<string>('Save Changes');
  hideFooter = input<boolean>(false);
  hideBody = input<boolean>(false);
  onSubmit = output<void>();
  onCancelClicked = output<void>();
}
