import { Filter } from 'src/app/shared/classes/filter';
import { Pagination } from 'src/app/shared/classes/pagination';
import { Sorting } from 'src/app/shared/classes/sorting';
import { ESortingOrder } from 'src/app/shared/enums';
import { IPlanFilter, TPlansSortingKeys } from 'src/app/shared/interfaces';

export class InternalUsersPlansFilter extends Filter<IPlanFilter, TPlansSortingKeys> {
  constructor() {
    super();

    const pagination = new Pagination(10);
    const sorting = new Sorting<TPlansSortingKeys>();
    sorting.sortField = 'submissionDate';
    sorting.sortOrder = ESortingOrder.desc;

    this.filter = {
      ...pagination,
      ...sorting,
      searchText: '',
      planType: null,
      status: null,
      assignee: null,
      submissionDate: undefined
    };

    this.initialState = structuredClone(this.filter);
  }

  clearFilter(filter?: Partial<IPlanFilter> | undefined): void {
    this.filter = structuredClone({
      ...this.initialState,
      ...(filter ? filter : {}),
    });
  }
}
