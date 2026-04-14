import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from 'src/app/shared/pipes';

@Component({
  selector: 'app-optional-message',
  imports: [TranslatePipe],
  templateUrl: './optional-message.html',
  styleUrl: './optional-message.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OptionalMessage { }
