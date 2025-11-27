import { Component, inject, output } from '@angular/core';
import { TranslatePipe } from 'src/app/shared/pipes';
import { AdminOpportunitiesStore } from 'src/app/shared/stores/admin-opportunities/admin-opportunities.store';
import { AdminOpportunitiesFilterService } from '../../services/admin-opportunities-filter/admin-opportunities-filter-service';
import { EOpportunityState, EOpportunityStatus } from 'src/app/shared/enums';
import { AdminOpportunitiesFilterClass } from '../../classes/admin-opportunities-filter';

@Component({
  selector: 'app-admin-opportunities-counts',
  imports: [TranslatePipe],
  templateUrl: './admin-opportunities-counts.component.html',
  styleUrl: './admin-opportunities-counts.component.scss',
})
export class AdminOpportunitiesCounts {
  protected readonly adminOpportunitiesStore = inject(AdminOpportunitiesStore);
  counts = this.adminOpportunitiesStore.counts;
  protected readonly adminOpportunitiesFilterService = inject(AdminOpportunitiesFilterService);

  removeFilters() {
    this.adminOpportunitiesFilterService.clearAllFilters();
  }

  filterWithPublishedOpportunities() {
    this.adminOpportunitiesFilterService.filter.set({
      ...(structuredClone(this.adminOpportunitiesFilterService.filter())),
      state: EOpportunityState.ACTIVE,
    });
    this.adminOpportunitiesFilterService.applyFilter();
  }

  filterWithInactiveOpportunities() {
    this.adminOpportunitiesFilterService.filter.set({
      ...(structuredClone(new AdminOpportunitiesFilterClass().filter)),
      state: EOpportunityState.INACTIVE,
    });
    this.adminOpportunitiesFilterService.applyFilter();
  }

  filterWithDraftOpportunities() {
    this.adminOpportunitiesFilterService.filter.set({
      ...(structuredClone(new AdminOpportunitiesFilterClass().filter)),
      status: EOpportunityStatus.DRAFT,
    });
    this.adminOpportunitiesFilterService.applyFilter();
  }
}

