import { computed, inject, Injectable, signal } from '@angular/core';
import { AbstractServiceFilter } from 'src/app/shared/classes/abstract-service-filter';
import { IPlanFilter, IPlanFilterRequest } from 'src/app/shared/interfaces';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { InvestorPlansFilter } from '../../classes/investor-plans-filter';
import { take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class InvestorPlansFilterService extends AbstractServiceFilter<IPlanFilter> {
  store = inject(PlanStore);
  filterClass = new InvestorPlansFilter();
  filter = signal(this.filterClass.filter);
  adpatedFilter = computed(() => {
    var filter = this.filter();
    return {
      ...filter,
      submissionDateFrom: filter.submissionDate?.[0]?.toLocaleDateString('en-CA'),
      submissionDateTo: filter.submissionDate?.[1]?.toLocaleDateString('en-CA'),
    };
  });

  showClearAll = computed(() => {
    const current = this.filter();
    return Boolean(current.searchText?.trim()) ||
      current.planType !== null ||
      current.status !== null ||
      Boolean(current.submissionDate);
  });

  performFilter$() {
    this.resetPagination();
    return this.store.getInvestorPlans(this.adpatedFilter());
  }

  clearAllFilters(): void {
    this.clearAll();
    this.applyFilter();
  }

  get FilterRequest(): IPlanFilterRequest {
    return this.filter();
  }

  applyFilterWithPaging(): void {
    this.updateFilterSignal();
    this.store.getInvestorPlans(this.adpatedFilter()).pipe(take(1)).subscribe();
  }
}
