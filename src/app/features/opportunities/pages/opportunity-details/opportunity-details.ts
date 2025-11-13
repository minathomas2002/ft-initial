import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseCard } from 'src/app/shared/components/base-components/base-card/base-card';
import { OpportunityDetailsCardInfoItem } from '../../components/opportunity-details-card-info-item/opportunity-details-card-info-item';

@Component({
  selector: 'app-opportunity-details',
  imports: [BaseCard, OpportunityDetailsCardInfoItem],
  templateUrl: './opportunity-details.html',
  styleUrl: './opportunity-details.scss',
})
export class OpportunityDetails {
  router = inject(Router);
  onBack() {
    this.router.navigate(['../']);
  }
}
