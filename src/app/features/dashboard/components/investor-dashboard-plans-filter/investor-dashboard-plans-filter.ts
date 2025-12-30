import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DashboardPlansFilterService } from '../../services/dashboard-plans-filter/dashboard-plans-filter-service';
import { TranslatePipe } from 'src/app/shared/pipes';
import { EInvestorPlanStatus } from 'src/app/shared/interfaces';
import { EOpportunityType } from 'src/app/shared/enums';
import { I18nService } from 'src/app/shared/services/i18n/i18n.service';
import { PlanStore, IPlanTypeDropdownOption } from 'src/app/shared/stores/plan/plan.store';

interface IDropdownOption {
  label: string;
  value: EOpportunityType | EInvestorPlanStatus | null;
}

@Component({
  selector: 'app-investor-dashboard-plans-filter',
  imports: [FormsModule, InputTextModule, DatePickerModule, SelectModule, TranslatePipe],
  templateUrl: './investor-dashboard-plans-filter.html',
  styleUrl: './investor-dashboard-plans-filter.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvestorDashboardPlansFilter implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchSubject = new Subject<string>();
  readonly filterService = inject(DashboardPlansFilterService);
  private readonly i18nService = inject(I18nService);
  private readonly planStore = inject(PlanStore);
  readonly filter = this.filterService.filter;

  planTypeOptions = computed<IDropdownOption[]>(() => {
    return this.planStore.planTypeOptions() as IDropdownOption[];
  });

  statusOptions = computed<IDropdownOption[]>(() => {
    this.i18nService.currentLanguage();
    return [
      { label: this.i18nService.translate('plans.filter.allStatuses'), value: null },
      { label: this.i18nService.translate('plans.status.submitted'), value: EInvestorPlanStatus.SUBMITTED },
      { label: this.i18nService.translate('plans.status.pending'), value: EInvestorPlanStatus.PENDING },
      { label: this.i18nService.translate('plans.status.underReview'), value: EInvestorPlanStatus.UNDER_REVIEW },
      { label: this.i18nService.translate('plans.status.approved'), value: EInvestorPlanStatus.APPROVED },
      { label: this.i18nService.translate('plans.status.rejected'), value: EInvestorPlanStatus.REJECTED },
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

  onStatusChange(value: EInvestorPlanStatus | null) {
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

