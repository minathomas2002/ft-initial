import { Filter } from 'src/app/shared/classes/filter';
import { Pagination } from 'src/app/shared/classes/pagination';
import { Sorting } from 'src/app/shared/classes/sorting';
import { ESortingOrder } from 'src/app/shared/enums';
import { IRoleManagementAssignmentFilter, TRoleManagementAssignmentSortingKeys } from 'src/app/shared/interfaces';

export class RoleManagementFilter extends Filter<IRoleManagementAssignmentFilter, TRoleManagementAssignmentSortingKeys> {
  constructor() {
    super();

    const pagination = new Pagination(10);
    const sorting = new Sorting<TRoleManagementAssignmentSortingKeys>();
    sorting.sortField = 'assignedDate';
    sorting.sortOrder = ESortingOrder.desc;

    this.filter = {
      ...pagination,
      ...sorting,
      searchText: '',
      roleIds: undefined,
      statusFilters: undefined,
      assignedDate: null
    };

    this.initialState = structuredClone(this.filter);
  }

  clearFilter(filter?: Partial<IRoleManagementAssignmentFilter> | undefined): void {
    this.filter = structuredClone({
      ...this.initialState,
      ...(filter ? filter : {}),
    });
  }
}

