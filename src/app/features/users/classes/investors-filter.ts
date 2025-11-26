import { Filter } from 'src/app/shared/classes/filter';
import { Pagination } from 'src/app/shared/classes/pagination';
import { Sorting } from 'src/app/shared/classes/sorting';
import { ESortingOrder } from 'src/app/shared/enums';
import { IInvestorsFilter, TInvestorsSortingKeys } from 'src/app/shared/interfaces';

export class InvestorsFilter extends Filter<IInvestorsFilter, TInvestorsSortingKeys> {
  constructor() {
    super();

    const pagination = new Pagination(10);
    const sorting = new Sorting<TInvestorsSortingKeys>();
    sorting.sortField = 'fullName';
    sorting.sortOrder = ESortingOrder.asc;

    this.filter = {
      ...pagination,
      ...sorting,
      searchText: '',
      joinDate: undefined
    };

    this.initialState = structuredClone(this.filter);
  }

  clearFilter(filter?: Partial<IInvestorsFilter> | undefined): void {
    this.filter = structuredClone({
      ...this.initialState,
      ...(filter ? filter : {}),
    });
  }
}

