import { Filter } from 'src/app/shared/classes/filter';
import { Pagination } from 'src/app/shared/classes/pagination';
import { Sorting } from 'src/app/shared/classes/sorting';
import { ESortingOrder } from 'src/app/shared/enums';
import { IAdminOpportunitiesFilter, TAdminOpportunitiesFilter } from 'src/app/shared/interfaces';

export class AdminOpportunitiesFilterClass extends Filter<IAdminOpportunitiesFilter, TAdminOpportunitiesFilter> {
  constructor() {
    super();
    const pagination = new Pagination(9);
    const sorting = new Sorting<TAdminOpportunitiesFilter>();
    //sorting.sortField = '';
    sorting.sortOrder = ESortingOrder.asc;
    this.filter = {
      ...pagination,
      ...sorting,
      status: undefined,
      state: undefined,
    };

    this.initialState = structuredClone(this.filter);
  }

  clearFilter(filter?: Partial<unknown>) {
    this.filter = structuredClone({
      ...this.initialState,
      ...(filter ? filter : {}),
    });
  }
}
