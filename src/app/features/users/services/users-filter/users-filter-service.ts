import { computed, inject, Injectable, signal } from '@angular/core';
import { AbstractServiceFilter } from 'src/app/shared/classes/abstract-service-filter';
import { take } from 'rxjs';
import { IUsersFilter, IUsersFilterRequest } from 'src/app/shared/interfaces';
import { UsersFilter } from '../../classes/users-filter';
import { UsersStore } from 'src/app/shared/stores/users/users.store';

@Injectable()
export class UsersFilterService extends AbstractServiceFilter<IUsersFilter> {
  store = inject(UsersStore);
  filterClass = new UsersFilter();
  filter = signal(this.filterClass.filter);

  showClearAll = computed(() => {
    return false;
  });

  performFilter$() {
    this.resetPagination();
    return this.store.getUsers(this.filter());
  }

  clearAllFilters() {
    this.clearAll();
    this.applyFilter();
  }

  get FilterRequest(): IUsersFilterRequest {
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
      .getUsers(this.filter())
      .pipe(take(1))
      .subscribe();
  }
}
