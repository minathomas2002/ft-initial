import { computed, inject, Injectable, signal } from '@angular/core';
import { take } from 'rxjs';
import { AbstractServiceFilter } from 'src/app/shared/classes/abstract-service-filter';
import { EInternalUserPlanStatus, IPlanFilter, IPlanFilterRequest } from 'src/app/shared/interfaces';
import { ERoles } from 'src/app/shared/enums';
import { DashboardPlansStore } from 'src/app/shared/stores/dashboard-plans/dashboard-plans.store';
import { DashboardPlansFilter } from '../../classes/dashboard-plans-filter';
import { RoleService } from 'src/app/shared/services/role/role-service';

@Injectable()
export class InternalUsersDashboardPlansFilterService extends AbstractServiceFilter<IPlanFilter> {
  store = inject(DashboardPlansStore);
  private readonly roleService = inject(RoleService);
  filterClass = new DashboardPlansFilter();
  filter = signal(this.filterClass.filter);

  adpatedFilter = computed(() => {
    var filter = this.filter();
    const adapted = {
      ...filter,
      submissionDateFrom: filter.submissionDate?.[0]?.toLocaleDateString('en-CA'),
      submissionDateTo: filter.submissionDate?.[1]?.toLocaleDateString('en-CA'),
    };

    // Department Managers always filter by DV_APPROVED status
    if (this.roleService.hasAnyRoleSignal([ERoles.DEPARTMENT_MANAGER])()) {
     // adapted.status = EInternalUserPlanStatus.DV_APPROVED;
    }

    return adapted;
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
    return this.store.getInternalUserDashboardPlans(this.adpatedFilter());
  }

  clearAllFilters(): void {
    this.clearAll();
    // Re-apply DV_APPROVED filter for Department Managers after clearing
    if (this.roleService.hasAnyRoleSignal([ERoles.DEPARTMENT_MANAGER])()) {
      this.updateFilterSignal({ status: [EInternalUserPlanStatus.DV_APPROVED] });
    }
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
