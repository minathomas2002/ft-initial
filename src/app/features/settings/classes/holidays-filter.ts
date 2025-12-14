import { Filter } from "src/app/shared/classes/filter";
import { Pagination } from "src/app/shared/classes/pagination";
import { Sorting } from "src/app/shared/classes/sorting";
import { ESortingOrder } from "src/app/shared/enums";
import { IHolidayManagementFilter, THolidaysManagementRecordKeys } from "src/app/shared/interfaces/ISetting";

export class HolidaysFilter extends Filter<
  IHolidayManagementFilter,
  THolidaysManagementRecordKeys
> {

readonly currentYear = new Date().getFullYear();
    constructor() {
      super();
      const pagination = new Pagination(10);
      const sorting = new Sorting<THolidaysManagementRecordKeys>();
      sorting.sortField = 'startDate';
      sorting.sortOrder = ESortingOrder.asc;
      this.filter = {
        ...pagination,
        ...sorting,
        searchText: '',
        year: this.currentYear,
        dateRange: new Date(),
        type:1,
      };
  
      this.initialState = structuredClone(this.filter);
    }

  override clearFilter(filter?: Partial<IHolidayManagementFilter> | undefined): void {
    throw new Error("Method not implemented.");
  }

}