import { Filter } from "src/app/shared/classes/filter";
import { Pagination } from "src/app/shared/classes/pagination";
import { Sorting } from "src/app/shared/classes/sorting";
import { ESortingOrder } from "src/app/shared/enums";
import { IDelegationFilter, TDelegationSortingKeys } from "src/app/shared/interfaces/delegation.interface";

export class DelegationFilter extends Filter<
  IDelegationFilter,
  TDelegationSortingKeys
> {
  constructor() {
    super();
    const pagination = new Pagination(10);
    const sorting = new Sorting<TDelegationSortingKeys>();
    sorting.sortField = 'delegatorName';
    sorting.sortOrder = ESortingOrder.asc;
    this.filter = {
      ...pagination,
      ...sorting,
      searchText: '',
      status: [],
      delegationDateFrom: null,
      delegationDateTo: null
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
