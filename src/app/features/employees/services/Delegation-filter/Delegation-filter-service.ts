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
