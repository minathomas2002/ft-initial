import { Component, input } from '@angular/core';

@Component({
  selector: 'app-opportunity-card',
  imports: [],
  templateUrl: './opportunity-card.html',
  styleUrl: './opportunity-card.scss',
})
export class OpportunityCard {
  icon = input<string>('');
  cardTitle = input<string>('');
  cardDescription = input<string>('');
  cardClass = input<string>('bg-white');
}
