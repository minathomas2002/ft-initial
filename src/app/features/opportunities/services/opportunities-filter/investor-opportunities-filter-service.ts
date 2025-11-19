import { computed, inject, Injectable, signal } from '@angular/core';
import { AbstractServiceFilter } from 'src/app/shared/classes/abstract-service-filter';
import { IOpportunitiesFilter, IOpportunitiesFilterRequest } from 'src/app/shared/interfaces/opportunities.interface';
import { InvestorOpportunitiesStore } from 'src/app/shared/stores/opportunities/investor-opportunities.store';
import { take } from 'rxjs';
import { InvestorOpportunityFilter } from '../../classes/investor-opportunity-filter';
import { IInvestorOpportunitiesFilterRequest } from 'src/app/shared/interfaces';

@Injectable({
  providedIn: 'root',
})
export class InvestorOpportunitiesFilterService extends AbstractServiceFilter<IInvestorOpportunitiesFilterRequest> {
  store = inject(InvestorOpportunitiesStore);
  filterClass = new InvestorOpportunityFilter();
  filter = signal(this.filterClass.filter);

  showClearAll = computed(() => {
    return false;
  });

  performFilter$() {
    this.resetPagination();
    return this.store.getInvestorOpportunities(this.filter());
  }

  clearAllFilters() {
    this.clearAll();
    this.applyFilter();
  }

  get FilterRequest(): IInvestorOpportunitiesFilterRequest {
    return this.filter();
  }

  resetOptionalFilters() {
    this.filter.set({
      ...this.filter(),
    });
  }

  applyFilterWithPaging() {
    this.updateFilterSignal();
    this.store.getInvestorOpportunities(this.filter()).pipe(take(1)).subscribe();
  }
}
