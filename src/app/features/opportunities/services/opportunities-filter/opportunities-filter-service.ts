import { computed, inject, Injectable, signal } from '@angular/core';
import { AbstractServiceFilter } from 'src/app/shared/classes/abstract-service-filter';
import { IOpportunitiesFilter, IOpportunitiesFilterRequest } from 'src/app/shared/interfaces/opportunities.interface';
import { OpportunitiesStore } from 'src/app/shared/stores/opportunities/opportunities.store';
import { OpportunityFilter } from '../../classes/opportunity-filter';
import { OpportunitiesFilterInterfaceAdapter } from '../../classes/opportunities-filter-adapter';
import { take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OpportunitiesFilterService extends AbstractServiceFilter<IOpportunitiesFilter> {
  store = inject(OpportunitiesStore);
  filterClass = new OpportunityFilter();
  filter = signal(this.filterClass.filter);

  showClearAll = computed(() => {
    return false;
  });

  performFilter$() {
    this.resetPagination();
    const filtration = new OpportunitiesFilterInterfaceAdapter(this.filter());
    return this.store.getOpportunities(filtration.adaptFilter());
  }

  clearAllFilters() {
    this.clearAll();
    this.applyFilter();
  }

  get FilterRequest(): IOpportunitiesFilterRequest {
    const filtration = new OpportunitiesFilterInterfaceAdapter(this.filter());
    return filtration.adaptFilter();
  }

  resetOptionalFilters() {
    this.filter.set({
      ...this.filter(),
    });
  }

  applyFilterWithPaging() {
    this.updateFilterSignal();
    const filtration = new OpportunitiesFilterInterfaceAdapter(this.filter());
    this.store.getOpportunities(filtration.adaptFilter()).pipe(take(1)).subscribe();
  }
}
