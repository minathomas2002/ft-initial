import { Filter } from 'src/app/shared/classes/filter';
import { Pagination } from 'src/app/shared/classes/pagination';
import { Sorting } from 'src/app/shared/classes/sorting';
import { ESortingOrder } from 'src/app/shared/enums';
import {
  IOpportunitiesFilter,
  TOpportunitySortingKeys,
} from 'src/app/shared/interfaces/opportunities.interface';
import { IUsersFilter, TUsersSortingKeys } from 'src/app/shared/interfaces/users.interface';

export class OpportunityFilter extends Filter<IOpportunitiesFilter, TOpportunitySortingKeys> {
  constructor() {
    super();
    const pagination = new Pagination(9);
    const sorting = new Sorting<TOpportunitySortingKeys>();
    //sorting.sortField = '';
    sorting.sortOrder = ESortingOrder.asc;
    this.filter = {
      searchText: '',
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
