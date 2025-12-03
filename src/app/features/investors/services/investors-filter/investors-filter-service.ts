import { computed, inject, Injectable, signal } from '@angular/core';
import { take } from 'rxjs';
import { AbstractServiceFilter } from 'src/app/shared/classes/abstract-service-filter';
import { IInvestorsFilter, IInvestorsFilterRequest } from 'src/app/shared/interfaces';
import { InvestorsStore } from 'src/app/shared/stores/investors/investors.store';
import { InvestorsFilter } from '../../classes/investors-filter';
import { InvestorFilterInterfaceAdapter } from '../../classes/investors-filter-adapter';

@Injectable()
export class InvestorsFilterService extends AbstractServiceFilter<IInvestorsFilter> {
  store = inject(InvestorsStore);
  filterClass = new InvestorsFilter();
  filter = signal(this.filterClass.filter);
  adpatedFilter = computed(() => {
    var filter = this.filter();
    return {
      ...filter,
      joinDateFrom: filter.joinDate?.[0]?.toLocaleDateString('en-CA'),
      joinDateTo: filter.joinDate?.[1]?.toLocaleDateString('en-CA'),
    };
  });

  showClearAll = computed(() => {
    const current = this.filter();
    return Boolean(current.searchText?.trim()) || Boolean(current.joinDate);
  });

  performFilter$() {
    this.resetPagination();
    return this.store.getInvestorsList(this.adpatedFilter());
  }

  clearAllFilters(): void {
    this.clearAll();
    this.applyFilter();
  }

  get FilterRequest(): IInvestorsFilterRequest {
    return this.filter();
  }

  resetOptionalFilters(): void {
    this.filter.set({
      ...this.filter(),
    });
  }

  applyFilterWithPaging(): void {
    this.updateFilterSignal();
    this.store.getInvestorsList(this.adpatedFilter()).pipe(take(1)).subscribe();
  }
}
