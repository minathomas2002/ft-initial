import { Component, input } from '@angular/core';

@Component({
  selector: 'app-opportunity-details-card-info-item',
  imports: [],
  templateUrl: './opportunity-details-card-info-item.html',
  styleUrl: './opportunity-details-card-info-item.scss',
})
export class OpportunityDetailsCardInfoItem {
  icon = input<string>('icon-check-circle');
  label = input.required<string>();
}
