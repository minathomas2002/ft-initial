import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-personal-information-form-field',
  imports: [],
  templateUrl: './personal-information-form-field.html',
  styleUrl: './personal-information-form-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonalInformationFormField {
  label = input<string>('');
  required = input<boolean>(true);
}
