import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TooltipModule } from 'primeng/tooltip';
import { TruncateTooltipDirective } from 'src/app/shared/directives/truncate-tooltip.directive';

@Component({
  selector: 'app-opportunity-card',
  imports: [
    TooltipModule,
    TruncateTooltipDirective
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
