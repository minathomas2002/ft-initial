import { Component, inject, model, signal } from '@angular/core';
import { CardsPageLayout } from 'src/app/shared/components/layout-components/cards-page-layout/cards-page-layout';
import { OpportunityCard } from 'src/app/shared/components/opportunities/opportunity-card/opportunity-card';
import { VisitorsOpportunitiesFilters } from '../../components/visitors-opportunities-filters/visitors-opportunities-filters';
import { ButtonModule } from 'primeng/button';
import { DataCards } from 'src/app/shared/components/layout-components/data-cards/data-cards';
import { IFilterBase } from 'src/app/shared/interfaces';
import { FilterService } from 'primeng/api';
import { OpportunitiesFilterService } from 'src/app/shared/services/opportunities-filter/opportunities-filter-service';
import { OpportunityDetailItem } from 'src/app/shared/components/opportunities/opportunity-detail-item/opportunity-detail-item';

@Component({
  selector: 'app-visitors-opportunities',
  imports: [
    CardsPageLayout,
    OpportunityCard,
    VisitorsOpportunitiesFilters,
    ButtonModule,
    DataCards,
    OpportunityDetailItem
  ],
  templateUrl: './visitors-opportunities.html',
  styleUrl: './visitors-opportunities.scss',
})
export class VisitorsOpportunities {
  items = signal<number[]>([1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
  details = signal<{ label: string, value: string }[]>([
    { label: 'Size', value: '500' },
    { label: 'Location', value: '1000' },
    { label: 'Type', value: '500' },
    { label: 'Size', value: '1000' },
  ]);
  totalRecords = signal<number>(10);
  filterService = inject(OpportunitiesFilterService);
  filter = this.filterService.filter;
}
