import { computed, inject, Injectable, signal } from '@angular/core';
import { AbstractServiceFilter } from 'src/app/shared/classes/abstract-service-filter';
import { UsersFilterInterfaceAdapter } from '../../classes/users-filter-adapter';
import { take } from 'rxjs';
import { IUsersFilter, IUsersFilterRequest } from 'src/app/shared/interfaces';
import { UsersFilter } from '../../classes/users-filter';
import { UsersStore } from 'src/app/shared/stores/users/users.store';

@Injectable()
export class UsersFilterService extends AbstractServiceFilter<IUsersFilter>{
  	store = inject(UsersStore);
	filterClass = new UsersFilter();
	filter = signal(this.filterClass.filter);

	showClearAll = computed(() => {
		return false;
	});

	performFilter$() {
		this.resetPagination();
		const filtration = new UsersFilterInterfaceAdapter(this.filter());
		return this.store.getUsers(filtration.adaptFilter());
	}

	clearAllFilters() {
		this.clearAll();
		this.applyFilter();
	}

	get FilterRequest(): IUsersFilterRequest {
		const filtration = new UsersFilterInterfaceAdapter(this.filter());
		return filtration.adaptFilter();
	}

	resetOptionalFilters() {
		this.filter.set({
			...this.filter(),
		});
	}

	applyFilterWithPaging() {
		this.updateFilterSignal();
		const filtration = new UsersFilterInterfaceAdapter(this.filter());
		this.store
			.getUsers(filtration.adaptFilter())
			.pipe(take(1))
			.subscribe();
	}
}
