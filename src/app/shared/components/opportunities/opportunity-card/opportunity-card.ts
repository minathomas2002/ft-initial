import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-opportunity-card',
  imports: [
    TooltipModule
  ],
  templateUrl: './opportunity-card.html',
  styleUrl: './opportunity-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpportunityCard {
  icon = input<string>('');
  cardTitle = input<string>('');
  cardDescription = input<string>('');
  cardClass = input<string>('bg-white');
}
