import { computed, inject, Injectable, signal } from '@angular/core';
import { take } from 'rxjs';
import { AbstractServiceFilter } from 'src/app/shared/classes/abstract-service-filter';
import { RoleManagementFilter } from '../../classes/role-management-filter';
import { IRoleManagementAssignmentFilter, IRoleManagementAssignmentFilterRequest } from 'src/app/shared/interfaces';
import { RoleManagementStore } from 'src/app/shared/stores/system-employees/role-management-store';

@Injectable()
export class RoleManagementFilterService extends AbstractServiceFilter<IRoleManagementAssignmentFilter> {
  store = inject(RoleManagementStore);
  filterClass = new RoleManagementFilter();
  filter = signal(this.filterClass.filter);

  adaptedFilter = computed<IRoleManagementAssignmentFilterRequest>(() => {
    var filter = this.filter();
    return {
      ...filter,
      assignedDateFrom: filter.assignedDate?.[0]?.toLocaleDateString('en-CA'),
      assignedDateTo: filter.assignedDate?.[1]?.toLocaleDateString('en-CA'),
      searchText: filter.searchText,
    };
  });

  showClearAll = computed(() => {
    const current = this.filter();
    const hasSearch = Boolean(current.searchText?.trim());
    const hasRoleIds = Array.isArray(current.roleIds) ? current.roleIds.length > 0 : false;
    const hasStatuses = Array.isArray(current.statusFilters) ? current.statusFilters.length > 0 : false;
    const hasAssignedDate = current.assignedDate?.length === 2;

    return hasSearch || hasRoleIds || hasStatuses || hasAssignedDate;
  });

  activeFiltersCount = computed(() => {
    const current = this.filter();

    const searchCount = current.searchText?.trim() ? 1 : 0;
    const roleIdsCount = Array.isArray(current.roleIds) ? current.roleIds.length : 0;
    const statusesCount = Array.isArray(current.statusFilters) ? current.statusFilters.length : 0;
    const assignedDateCount = current.assignedDate?.length === 2 ? 1 : 0;

    return searchCount + roleIdsCount + statusesCount + assignedDateCount;
  });

  performFilter$() {
    this.resetPagination();
    return this.store.getRoleManagementList(this.adaptedFilter());
  }

  clearAllFilters() {
    this.clearAll();
    this.applyFilter();
  }

  get FilterRequest(): IRoleManagementAssignmentFilterRequest {
    return this.adaptedFilter();
  }

  resetOptionalFilters() {
    this.filter.set({
      ...this.filter(),
    });
  }

  applyFilterWithPaging() {
    this.updateFilterSignal();
    this.store.getRoleManagementList(this.adaptedFilter())
      .pipe(take(1))
      .subscribe();
  }
}

