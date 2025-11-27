import { Component, computed, DestroyRef, inject, input, model, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { Subject, catchError, debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
import { TranslatePipe } from 'src/app/shared/pipes';
import { IAdminOpportunitiesFilter, IAdminOpportunitiesFilterRequest } from 'src/app/shared/interfaces/admin-opportunities.interface';
import { AdminOpportunitiesStore } from 'src/app/shared/stores/admin-opportunities/admin-opportunities.store';
import { EOpportunityState, EOpportunityStatus, EOpportunityType } from 'src/app/shared/enums';
import { AdminOpportunitiesFilterService } from '../../services/admin-opportunities-filter/admin-opportunities-filter-service';

@Component({
  selector: 'app-admin-opportunities-filter',
  imports: [
    IconFieldModule,
    InputIconModule,
    FormsModule,
    InputTextModule,
    SelectModule,
    TranslatePipe
  ],
  templateUrl: './admin-opportunities-filter.html',
  styleUrl: './admin-opportunities-filter.scss',
})
export class AdminOpportunitiesFilter {
  protected readonly adminOpportunitiesFilterService = inject(AdminOpportunitiesFilterService);
  filter = this.adminOpportunitiesFilterService.filter;
  destroyRef = inject(DestroyRef);
  searchSubject = new Subject<string>();
  protected readonly adminOpportunitiesStore = inject(AdminOpportunitiesStore);

  // Computed signals to convert enum values to strings for select components
  stateValue = computed(() => {
    const state = this.filter().state;
    return state !== undefined ? state.toString() : null;
  });

  statusValue = computed(() => {
    const status = this.filter().status;
    return status !== undefined ? status.toString() : null;
  });

  opportunityTypeValue = computed(() => {
    const type = this.filter().opportunityType;
    return type !== undefined ? type.toString() : null;
  });

  ngOnInit() {
    this.listenToSearchText();
  }

  listenToSearchText() {
    this.searchSubject
      .pipe(
        debounceTime(700),
        distinctUntilChanged(),
        switchMap((res) => this.performFilter$()),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  applyFilter() {
    this.adminOpportunitiesFilterService.applyFilter();
  }

  onStateChange(value: string | null) {
    const enumValue = value ? parseInt(value, 10) as EOpportunityState : undefined;
    this.adminOpportunitiesFilterService.filter.update(f => ({
      ...f,
      state: enumValue
    }));
    this.applyFilter();
  }

  onStatusChange(value: string | null) {
    const enumValue = value ? parseInt(value, 10) as EOpportunityStatus : undefined;
    this.adminOpportunitiesFilterService.filter.update(f => ({
      ...f,
      status: enumValue
    }));
    this.applyFilter();
  }

  onOpportunityTypeChange(value: string | null) {
    const enumValue = value ? parseInt(value, 10) as EOpportunityType : undefined;
    this.adminOpportunitiesFilterService.filter.update(f => ({
      ...f,
      opportunityType: enumValue
    }));
    this.applyFilter();
  }

  performFilter$() {
    return this.adminOpportunitiesFilterService.performFilter$().pipe(catchError((error) => of(error)));
  }
}

