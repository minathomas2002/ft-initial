import { Component, computed, inject, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { IOpportunityRecord } from 'src/app/shared/interfaces/opportunities.interface';
import { OpportunitiesFilterService } from '../../services/opportunities-filter/opportunities-filter-service';
import { OpportunityDetailItem } from 'src/app/shared/components/opportunities/opportunity-detail-item/opportunity-detail-item';
import { DataCards } from 'src/app/shared/components/layout-components/data-cards/data-cards';
import { OpportunitiesFilters } from '../../components/opportunities-filter/opportunities-filters';
import { OpportunityCard } from 'src/app/shared/components/opportunities/opportunity-card/opportunity-card';
import { CardsPageLayout } from 'src/app/shared/components/layout-components/cards-page-layout/cards-page-layout';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthStore } from 'src/app/shared/stores/auth/auth.store';
import { ERoutes } from 'src/app/shared/enums';
import { CardsSkeleton } from 'src/app/shared/components/skeletons/cards-skeleton/cards-skeleton';
import { OpportunitiesStore } from 'src/app/shared/stores/opportunities/opportunities.store';
import { TranslatePipe } from 'src/app/shared/pipes';

@Component({
  selector: 'app-opportunities-list',
  imports: [
    CardsPageLayout,
    OpportunityCard,
    OpportunitiesFilters,
    ButtonModule,
    DataCards,
    OpportunityDetailItem,
    CardsSkeleton,
    TranslatePipe
  ],
  templateUrl: './opportunities-list.html',
  styleUrl: './opportunities-list.scss',
})
export class OpportunitiesList {
  // items = signal<number[]>([1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
  isAdminMode = computed(()=> this.authStore.isAuthenticated())
  details = signal<{ label: string, value: string }[]>([
    { label: 'Size', value: '500' },
    { label: 'Location', value: '1000' },
    { label: 'Type', value: '500' },
    { label: 'Size', value: '1000' },
  ]);
  totalRecords = signal<number>(10);
  filterService = inject(OpportunitiesFilterService);
  filter = this.filterService.filter;
  router = inject(Router);
  authStore = inject(AuthStore);
  opportunitiesStore = this.filterService.store;
  route = inject(ActivatedRoute);
  ngOnInit(): void {
    this.filterService.applyFilter()
  }

  onViewDetails(opportunity: IOpportunityRecord) {
    this.router.navigate(['list', 1], {
      relativeTo: this.route.parent,
    });
  }

  onApply(opportunity: IOpportunityRecord) {
    if (this.authStore.isAuthenticated()) {
    } else {
      this.router.navigate(['/',ERoutes.auth ,ERoutes.login])
    }
  }
}
