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
      adapted.status = EInternalUserPlanStatus.DV_APPROVED;
    }
    
    return adapted;
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
    // Re-apply DV_APPROVED filter for Department Managers after clearing
    if (this.roleService.hasAnyRoleSignal([ERoles.DEPARTMENT_MANAGER])()) {
      this.updateFilterSignal({ status: EInternalUserPlanStatus.DV_APPROVED });
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
