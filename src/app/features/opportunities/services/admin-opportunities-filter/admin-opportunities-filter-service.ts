import { computed, inject, Injectable, signal } from "@angular/core";
import { AbstractServiceFilter } from "src/app/shared/classes/abstract-service-filter";
import { IAdminOpportunitiesFilter, IAdminOpportunitiesFilterRequest } from "src/app/shared/interfaces";
import { AdminOpportunitiesStore } from "src/app/shared/stores/admin-opportunities/admin-opportunities.store";
import { AdminOpportunitiesFilterClass } from "../../classes/admin-opportunities-filter";
import { take } from "rxjs";
import { EOpportunityState } from "src/app/shared/enums";

@Injectable({
  providedIn: 'root',
})
export class AdminOpportunitiesFilterService extends AbstractServiceFilter<IAdminOpportunitiesFilter> {
  store = inject(AdminOpportunitiesStore);
  filterClass = new AdminOpportunitiesFilterClass();
  filter = signal(this.filterClass.filter);
  adaptedFilter = computed<IAdminOpportunitiesFilterRequest>(() => {
    return {
      ...this.filter(),
      isActive: this.filter().state ? this.filter().state === EOpportunityState.ACTIVE : undefined
    };
  });

  showClearAll = computed(() => {
    return false;
  });

  performFilter$() {
    this.resetPagination();
    return this.store.getAdminOpportunities(this.adaptedFilter());
  }

  clearAllFilters() {
    this.clearAll();
    this.applyFilter();
  }

  get FilterRequest(): IAdminOpportunitiesFilter {
    return this.filter();
  }

  resetOptionalFilters() {
    this.filter.set({
      ...this.filter(),
    });
  }

  applyFilterWithPaging() {
    this.updateFilterSignal();
    this.store.getAdminOpportunities(this.adaptedFilter()).pipe(take(1)).subscribe();
  }
}