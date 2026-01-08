import { computed, inject, Injectable, signal } from '@angular/core';
import { take } from 'rxjs';
import { AbstractServiceFilter } from 'src/app/shared/classes/abstract-service-filter';
import { IPlanFilter, IPlanFilterRequest } from 'src/app/shared/interfaces';
import { DashboardPlansStore } from 'src/app/shared/stores/dashboard-plans/dashboard-plans.store';
import { DashboardPlansFilter } from '../../classes/dashboard-plans-filter';

@Injectable()
export class InternalUsersDashboardPlansFilterService extends AbstractServiceFilter<IPlanFilter> {
  store = inject(DashboardPlansStore);
  filterClass = new DashboardPlansFilter();
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
    return (
      Boolean(current.searchText?.trim()) ||
      current.planType !== null ||
      current.status !== null ||
      Boolean(current.submissionDate)
    );
  });

  performFilter$() {
    this.resetPagination();
    return this.store.getInternalUserDashboardPlans(this.adpatedFilter());
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
    this.store.getInternalUserDashboardPlans(this.adpatedFilter()).pipe(take(1)).subscribe();
  }
}
