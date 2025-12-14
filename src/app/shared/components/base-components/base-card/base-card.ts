import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-base-card',
  imports: [],
  templateUrl: './base-card.html',
  styleUrl: './base-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseCard {
  icon = input<string>('');
  cardTitle = input<string>('');
  cardDescription = input<string>('');
  cardClass = input<string>('');
}
