import { computed, inject, Injectable, signal } from '@angular/core';
import { AbstractServiceFilter } from 'src/app/shared/classes/abstract-service-filter';
import { take } from 'rxjs';
import { OpportunitiesFilter } from '../../classes/investor-opportunity-filter';
import { IOpportunitiesFilterRequest } from 'src/app/shared/interfaces';
import { OpportunitiesStore } from 'src/app/shared/stores/opportunities/opportunities.store';


@Injectable({
  providedIn: 'root',
})
export class OpportunitiesFilterService extends AbstractServiceFilter<IOpportunitiesFilterRequest> {
  store = inject(OpportunitiesStore);
  filterClass = new OpportunitiesFilter();
  filter = signal(this.filterClass.filter);

  showClearAll = computed(() => {
    return false;
  });

  performFilter$() {
    this.resetPagination();
    return this.store.getOpportunities(this.filter());
  }

  clearAllFilters() {
    this.clearAll();
    this.applyFilter();
  }

  get FilterRequest(): IOpportunitiesFilterRequest {
    return this.filter();
  }

  resetOptionalFilters() {
    this.filter.set({
      ...this.filter(),
    });
  }

  applyFilterWithPaging() {
    this.updateFilterSignal();
    this.store.getOpportunities(this.filter()).pipe(take(1)).subscribe();
  }
}
