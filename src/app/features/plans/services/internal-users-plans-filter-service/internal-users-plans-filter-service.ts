import { computed, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { AbstractServiceFilter } from 'src/app/shared/classes/abstract-service-filter';
import { IPlanFilter, IPlanFilterRequest } from 'src/app/shared/interfaces';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { InternalUsersPlansFilter } from '../../classes/internal-users-plans-filter';
import { take } from 'rxjs';

@Injectable()
export class InternalUsersPlansFilterService extends AbstractServiceFilter<IPlanFilter> {
  store = inject(PlanStore);
  filterClass = new InternalUsersPlansFilter();
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
    const hasOpportunityId = Boolean(current.opportunityId?.trim());
    const hasSearch = Boolean(current.searchText?.trim());
    const hasPlanType = Array.isArray(current.planType) ? current.planType.length > 0 : current.planType !== null;
    const hasStatus = Array.isArray(current.status) ? current.status.length > 0 : current.status !== null;
    const hasAssignee = Array.isArray(current.assignee) ? current.assignee.length > 0 : current.assignee !== null;
    const hasSubmissionDate = Boolean(current.submissionDate);

    return hasOpportunityId || hasSearch || hasPlanType || hasStatus || hasAssignee || hasSubmissionDate;
  });

  activeFiltersCount = computed(() => {
    const current = this.filter();

    const searchCount = current.searchText?.trim() ? 1 : 0;
    const searchOpportunity = current.opportunityId?.trim() ? 1 : 0;
    const planTypeCount = Array.isArray(current.planType) ? current.planType.length : 0;
    const statusCount = Array.isArray(current.status) ? current.status.length : 0;
    const assigneeCount = Array.isArray(current.assignee) ? current.assignee.length : 0;
    const submissionDateCount = current.submissionDate?.length === 2 ? 1 : 0;

    return searchOpportunity + searchCount + planTypeCount + statusCount + assigneeCount + submissionDateCount;
  });

  performFilter$() {
    this.resetPagination();
    return this.store.getInternalUserPlans(this.adpatedFilter());
  }

  clearAllFilters(filter:WritableSignal<IPlanFilter>): void {
    this.clearAll(filter());
    this.applyFilter();
  }

  get FilterRequest(): IPlanFilterRequest {
    return this.filter();
  }

  applyFilterWithPaging(): void {
    this.updateFilterSignal();
    this.store.getInternalUserPlans(this.adpatedFilter()).pipe(take(1)).subscribe();
  }
}
