import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from 'src/app/shared/pipes';

@Component({
  selector: 'app-required-fields-message',
  imports: [TranslatePipe],
  templateUrl: './required-fields-message.html',
  styleUrl: './required-fields-message.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequiredFieldsMessage {
}
