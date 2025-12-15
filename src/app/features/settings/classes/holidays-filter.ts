import { Filter } from "src/app/shared/classes/filter";
import { Pagination } from "src/app/shared/classes/pagination";
import { Sorting } from "src/app/shared/classes/sorting";
import { ESortingOrder } from "src/app/shared/enums";
import { IHolidayManagementFilter, THolidaysManagementRecordKeys } from "src/app/shared/interfaces/ISetting";

export class HolidaysFilter extends Filter<
  IHolidayManagementFilter,
  THolidaysManagementRecordKeys
> {

  constructor() {
    super();
    const pagination = new Pagination(10);
    const sorting = new Sorting<THolidaysManagementRecordKeys>();
    sorting.sortField = 'createdDate';
    sorting.sortOrder = ESortingOrder.asc;
    this.filter = {
      ...pagination,
      ...sorting,
      searchText: '',
      year: null,
      dateRange: null,
      typeIds: [],
    };

    this.initialState = structuredClone(this.filter);
  }

  clearFilter(filter?: Partial<IHolidayManagementFilter> | undefined): void {
    this.filter = structuredClone({
      ...this.initialState,
      ...(filter ? filter : {}),
    });
  }
}