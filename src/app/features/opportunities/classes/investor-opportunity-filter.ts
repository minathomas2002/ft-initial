import { Filter } from 'src/app/shared/classes/filter';
import { Pagination } from 'src/app/shared/classes/pagination';
import { Sorting } from 'src/app/shared/classes/sorting';
import { ESortingOrder } from 'src/app/shared/enums';
import { IInvestorOpportunitiesFilterRequest, TInvestorOpportunitiesSortingKeys } from 'src/app/shared/interfaces';

export class InvestorOpportunityFilter extends Filter<IInvestorOpportunitiesFilterRequest, TInvestorOpportunitiesSortingKeys> {
  constructor() {
    super();
    const pagination = new Pagination(9);
    const sorting = new Sorting<TInvestorOpportunitiesSortingKeys>();
    //sorting.sortField = '';
    sorting.sortOrder = ESortingOrder.asc;
    this.filter = {
      ...pagination,
      ...sorting,
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
