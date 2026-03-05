import { computed, inject, Injectable, signal } from '@angular/core';
import { AbstractServiceFilter } from 'src/app/shared/classes/abstract-service-filter';
import { take } from 'rxjs';
import { EmployeesFilter } from '../../classes/employees-filter';
import { ISystemEmployeeFilter, ISystemEmployeeFilterRequest, TSystemEmployeeSortingKeys } from 'src/app/shared/interfaces';
import { SystemEmployeesStore } from 'src/app/shared/stores/system-employees/system-employees.store';
import { EUserStatus } from 'src/app/shared/enums';

@Injectable({
  providedIn: 'root'
})
export class EmployeesFilterService extends AbstractServiceFilter<ISystemEmployeeFilter> {
  store = inject(SystemEmployeesStore);
  filterClass = new EmployeesFilter();
  filter = signal(this.filterClass.filter);

  adaptedFilter = computed<ISystemEmployeeFilterRequest>(() => {
    return {
      ...this.filter(),
      searchText: this.filter().searchText?.trim() ?? '',
      roleIds: this.filter().roleIds ?? [],
      statusFilters: this.filter().statusFilters ?? []
    };
  });

  showClearAll = computed(() => {
    const current = this.filter();
    const hasSearch = Boolean(current.searchText?.trim());
    const hasRoleIds = Array.isArray(current.roleIds) ? current.roleIds.length > 0 : false;
    const hasStatuses = Array.isArray(current.statusFilters) ? current.statusFilters.length > 0 : false;

    return hasSearch || hasRoleIds || hasStatuses;
  });

  activeFiltersCount = computed(() => {
    const current = this.filter();

    const searchCount = current.searchText?.trim() ? 1 : 0;
    const roleIdsCount = Array.isArray(current.roleIds) ? current.roleIds.length : 0;
    const statusesCount = Array.isArray(current.statusFilters) ? current.statusFilters.length : 0;

    return searchCount + roleIdsCount + statusesCount;
  });

  performFilter$() {
    this.resetPagination();
    return this.store.getSystemEmployeesList(this.adaptedFilter());
  }

  clearAllFilters() {
    this.clearAll();
    this.applyFilter();
  }

  get FilterRequest(): ISystemEmployeeFilter {
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
      .getSystemEmployeesList(this.adaptedFilter())
      .pipe(take(1))
      .subscribe();
  }
}
