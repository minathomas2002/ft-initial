import { computed, inject, Injectable, signal } from "@angular/core";
import { AbstractServiceFilter } from "src/app/shared/classes/abstract-service-filter";
import { IHolidayManagementFilter } from "src/app/shared/interfaces/ISetting";
import { HolidaysFilter } from "../../classes/holidays-filter";
import { AdminSettingsStore } from "src/app/shared/stores/settings/admin-settings.store";
import { take } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class HolidaysFilterService extends AbstractServiceFilter<IHolidayManagementFilter> {
  store = inject(AdminSettingsStore);
  filterClass = new HolidaysFilter();
  filter = signal(this.filterClass.filter);

  adaptedFilter = computed<IHolidayManagementFilter>(() => {
    var filter = this.filter();
    return {
      ...filter,
      dateFrom: filter.dateRange?.[0]?.toLocaleDateString('en-CA'),
      dateTo: filter.dateRange?.[1]?.toLocaleDateString('en-CA'),
      year: (filter.year as Date)?.toLocaleDateString('en-CA'),
      searchText: filter.searchText,
    };
  });

  showClearAll = computed(() => {
    return false;
  });

  performFilter$() {
    this.resetPagination();
    return this.store.getHolidaysList(this.adaptedFilter());
  }

  clearAllFilters() {
    this.clearAll();
    this.applyFilter();
  }

  get FilterRequest(): IHolidayManagementFilter {
    return this.filter();
  }

  resetOptionalFilters() {
    this.filter.set({
      ...this.filter(),
    });
  }

  applyFilterWithPaging() {
    this.updateFilterSignal();
    this.store.getHolidaysList(this.adaptedFilter()).pipe(take(1)).subscribe();
  }

  onClearFilters() {
    this.filterClass.clearFilter();
  }
}

