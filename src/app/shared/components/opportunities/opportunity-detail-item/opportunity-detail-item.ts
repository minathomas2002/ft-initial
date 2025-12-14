import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-opportunity-detail-item',
  imports: [],
  templateUrl: './opportunity-detail-item.html',
  styleUrl: './opportunity-detail-item.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpportunityDetailItem {
  label = input<string>('label');
  value = input<string>('value');
}
