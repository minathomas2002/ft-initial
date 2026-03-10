import { computed, inject, Injectable, signal } from '@angular/core';
import { AbstractServiceFilter } from 'src/app/shared/classes/abstract-service-filter';
import { take } from 'rxjs';
import { IDelegationFilter, IDelegationFilterRequest } from 'src/app/shared/interfaces/delegation.interface';
import { DelegationFilter } from '../../classes/Delegation-filter';
import { DelegationStore } from 'src/app/shared/stores/system-employees/delegation.store';

@Injectable({
  providedIn: 'root'
})
export class DelegationFilterService extends AbstractServiceFilter<IDelegationFilter> {
  store = inject(DelegationStore);
  filterClass = new DelegationFilter();
  filter = signal(this.filterClass.filter);

  adaptedFilter = computed<IDelegationFilterRequest>(() => {
    return {
      ...this.filter(),
      searchText: this.filter().searchText?.trim() ?? '',
      status: this.filter().status ?? []
    };
  });



  performFilter$() {
    this.resetPagination();
    return this.store.getDelegationList(this.adaptedFilter());
  }

  showClearAll(): boolean {
    const currentFilter = this.filter();
    return !!(currentFilter.searchText || (currentFilter.status && currentFilter.status.length > 0) || currentFilter.delegationDateFrom || currentFilter.delegationDateTo);
  }

  activeFiltersCount(): number {
    const current = this.filter();

    const searchCount = current.searchText?.trim() ? 1 : 0;
    const statusCount = Array.isArray(current.status) ? current.status.length : 0;
    const delegationDateCount = current.delegationDateFrom && current.delegationDateTo ? 1 : 0;

    return searchCount + statusCount + delegationDateCount;
  }

  clearAllFilters() {
    this.clearAll();
    this.applyFilter();
  }

  get FilterRequest(): IDelegationFilter {
    return this.filter();
  }

  resetOptionalFilters() {
    this.filter.set({
      ...this.filter(),
    });
  }

  applyFilterWithPaging() {
    this.updateFilterSignal();
    this.store
      .getDelegationList(this.adaptedFilter())
      .pipe(take(1))
      .subscribe();
  }
}
