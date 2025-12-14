import { Component, computed, DestroyRef, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DashboardPlansFilterService } from '../../services/dashboard-plans-filter/dashboard-plans-filter-service';
import { TranslatePipe } from 'src/app/shared/pipes';
import { EPlanStatus } from 'src/app/shared/interfaces';
import { EOpportunityType } from 'src/app/shared/enums';
import { I18nService } from 'src/app/shared/services/i18n/i18n.service';

interface IDropdownOption {
  label: string;
  value: EOpportunityType | EPlanStatus | null;
}

@Component({
  selector: 'app-dashboard-plans-filter',
  imports: [FormsModule, InputTextModule, DatePickerModule, SelectModule, TranslatePipe],
  templateUrl: './dashboard-plans-filter.html',
  styleUrl: './dashboard-plans-filter.scss',
})
export class DashboardPlansFilter {
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchSubject = new Subject<string>();
  readonly filterService = inject(DashboardPlansFilterService);
  private readonly i18nService = inject(I18nService);
  readonly filter = this.filterService.filter;

  planTypeOptions = computed<IDropdownOption[]>(() => {
    this.i18nService.currentLanguage();
    return [
      { label: this.i18nService.translate('plans.filter.allTypes'), value: null },
      { label: this.i18nService.translate('plans.filter.service'), value: EOpportunityType.SERVICES },
      { label: this.i18nService.translate('plans.filter.material'), value: EOpportunityType.PRODUCT },
    ];
  });

  statusOptions = computed<IDropdownOption[]>(() => {
    this.i18nService.currentLanguage();
    return [
      { label: this.i18nService.translate('plans.filter.allStatuses'), value: null },
      { label: this.i18nService.translate('plans.status.submitted'), value: EPlanStatus.SUBMITTED },
      { label: this.i18nService.translate('plans.status.pending'), value: EPlanStatus.PENDING },
      { label: this.i18nService.translate('plans.status.underReview'), value: EPlanStatus.UNDER_REVIEW },
      { label: this.i18nService.translate('plans.status.approved'), value: EPlanStatus.APPROVED },
      { label: this.i18nService.translate('plans.status.rejected'), value: EPlanStatus.REJECTED },
    ];
  });

  ngOnInit() {
    this.listenToSearchChanges();
  }

  onSearchTextChange(value: string) {
    this.filterService.updateFilterSignal({ searchText: value, pageNumber: 1 });
    this.searchSubject.next(value ?? '');
  }

  onPlanTypeChange(value: EOpportunityType | null) {
    this.filterService.updateFilterSignal({ planType: value, pageNumber: 1 });
    this.filterService.applyFilterWithPaging();
  }

  onStatusChange(value: EPlanStatus | null) {
    this.filterService.updateFilterSignal({ status: value, pageNumber: 1 });
    this.filterService.applyFilterWithPaging();
  }

  onPickerChange(value: Date[] | undefined) {
    value = value?.filter((x) => !!x) ?? [];
    if (!!value && (value.length == 2 || value.length == 0)) {
      this.filterService.updateFilterSignal({ submissionDate: value.length === 2 ? value : undefined, pageNumber: 1 });
      this.filterService.applyFilterWithPaging();
    }
  }

  onClearFilters() {
    this.filterService.clearAllFilters();
  }

  private listenToSearchChanges() {
    this.searchSubject
      .pipe(
        debounceTime(700),
        distinctUntilChanged(),
        switchMap(() => this.filterService.performFilter$()),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }
}

