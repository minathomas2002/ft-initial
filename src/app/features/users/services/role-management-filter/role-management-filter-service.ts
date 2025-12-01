import { computed, inject, Injectable, signal } from '@angular/core';
import { take } from 'rxjs';
import { AbstractServiceFilter } from 'src/app/shared/classes/abstract-service-filter';
import { IRoleManagementFilter, IRoleManagementFilterRequest } from 'src/app/shared/interfaces/users.interface';
import { RoleManagementFilter } from '../../classes/role-management-filter';
import { UsersStore } from 'src/app/shared/stores/users/users.store';

@Injectable()
export class RoleManagementFilterService extends AbstractServiceFilter<IRoleManagementFilter> {
  store = inject(UsersStore);
  filterClass = new RoleManagementFilter();
  filter = signal(this.filterClass.filter);

  adaptedFilter = computed(() => {
    var filter = this.filter();
    return {
      ...filter,
      joinDateFrom: filter.joinDate?.[0]?.toLocaleDateString('en-CA'),
      joinDateTo: filter.joinDate?.[1]?.toLocaleDateString('en-CA'),
    };
  });

  showClearAll = computed(() => {
    const current = this.filter();
    return Boolean(current.searchText?.trim()) ||
      Boolean(current.roleIds?.length) ||
      Boolean(current.statusFilters) ||
      Boolean(current.joinDate);
  });

  performFilter$() {
    this.resetPagination();
    return this.store.getRoleManagementList(this.adaptedFilter());
  }

  clearAllFilters() {
    this.clearAll();
    this.applyFilter();
  }

  get FilterRequest(): IRoleManagementFilterRequest {
    return this.adaptedFilter();
  }

  resetOptionalFilters() {
    this.filter.set({
      ...this.filter(),
    });
  }

  applyFilterWithPaging() {
    this.updateFilterSignal();
    this.performFilter$()
      .pipe(take(1))
      .subscribe();
  }
}

