import { Filter } from 'src/app/shared/classes/filter';
import { Pagination } from 'src/app/shared/classes/pagination';
import { Sorting } from 'src/app/shared/classes/sorting';
import { ESortingOrder } from 'src/app/shared/enums';
import { IRoleManagementFilter, TRoleManagementSortingKeys } from 'src/app/shared/interfaces/users.interface';

export class RoleManagementFilter extends Filter<IRoleManagementFilter, TRoleManagementSortingKeys> {
  constructor() {
    super();

    const pagination = new Pagination(10);
    const sorting = new Sorting<TRoleManagementSortingKeys>();
    sorting.sortField = 'assignedDate';
    sorting.sortOrder = ESortingOrder.desc;

    this.filter = {
      ...pagination,
      ...sorting,
      searchText: '',
      roleIds: undefined,
      statusFilters: undefined,
      joinDate: undefined
    };

    this.initialState = structuredClone(this.filter);
  }

  clearFilter(filter?: Partial<IRoleManagementFilter> | undefined): void {
    this.filter = structuredClone({
      ...this.initialState,
      ...(filter ? filter : {}),
    });
  }
}

