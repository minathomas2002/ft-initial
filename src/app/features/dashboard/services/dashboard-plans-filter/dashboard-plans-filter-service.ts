import { computed, inject, Injectable, signal } from '@angular/core';
import { take } from 'rxjs';
import { AbstractServiceFilter } from 'src/app/shared/classes/abstract-service-filter';
import { IPlanFilter, IPlanFilterRequest } from 'src/app/shared/interfaces';
import { DashboardPlansStore } from 'src/app/shared/stores/dashboard-plans/dashboard-plans.store';
import { DashboardPlansFilter } from '../../classes/dashboard-plans-filter';

@Injectable()
export class DashboardPlansFilterService extends AbstractServiceFilter<IPlanFilter> {
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
    const hasSearch = Boolean(current.searchText?.trim());
    const hasPlanType = Array.isArray(current.planType) ? current.planType.length > 0 : current.planType !== null;
    const hasStatus = Array.isArray(current.status) ? current.status.length > 0 : current.status !== null;
    const hasSubmissionDate = Boolean(current.submissionDate);

    return hasSearch || hasPlanType || hasStatus || hasSubmissionDate;
  });

  activeFiltersCount = computed(() => {
    const current = this.filter();

    const searchCount = current.searchText?.trim() ? 1 : 0;
    const planTypeCount = Array.isArray(current.planType) ? current.planType.length : 0;
    const statusCount = Array.isArray(current.status) ? current.status.length : 0;
    const submissionDateCount = current.submissionDate?.length === 2 ? 1 : 0;

    return searchCount + planTypeCount + statusCount + submissionDateCount;
  });

  performFilter$() {
    this.resetPagination();
    return this.store.getInvestorDashboardPlans(this.adpatedFilter());
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
    this.store.getInvestorDashboardPlans(this.adpatedFilter()).pipe(take(1)).subscribe();
  }
}

