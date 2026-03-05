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
    const current = this.filter();
    const hasSearch = Boolean(current.searchText?.trim());
    const hasTypeIds = Array.isArray(current.typeIds) ? current.typeIds.length > 0 : false;
    const hasDateRange = current.dateRange?.length === 2;
    const hasYear = Boolean(current.year);

    return hasSearch || hasTypeIds || hasDateRange || hasYear;
  });

  activeFiltersCount = computed(() => {
    const current = this.filter();

    const searchCount = current.searchText?.trim() ? 1 : 0;
    const typeIdsCount = Array.isArray(current.typeIds) ? current.typeIds.length : 0;
    const dateRangeCount = current.dateRange?.length === 2 ? 1 : 0;
    const yearCount = current.year ? 1 : 0;

    return searchCount + typeIdsCount + dateRangeCount + yearCount;
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

