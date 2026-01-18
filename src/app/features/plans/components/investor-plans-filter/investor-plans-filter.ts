import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ActivatedRoute } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';
import { EOpportunityType } from 'src/app/shared/enums';
import { EInvestorPlanStatus, IPlanFilter } from 'src/app/shared/interfaces';
import { TranslatePipe } from 'src/app/shared/pipes';
import { I18nService } from 'src/app/shared/services/i18n';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InvestorPlansFilterService } from '../../services/investor-plans-filter-service/investor-plans-filter-service';

interface IDropdownOption {
  label: string;
  value: EOpportunityType | EInvestorPlanStatus | null;
}

@Component({
  selector: 'app-investor-plans-filter',
  imports: [FormsModule, InputTextModule, DatePickerModule, SelectModule, TranslatePipe],
  templateUrl: './investor-plans-filter.html',
  styleUrl: './investor-plans-filter.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvestorPlansFilter implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchSubject = new Subject<string>();
  readonly filterService = inject(InvestorPlansFilterService);
  private readonly i18nService = inject(I18nService);
  private readonly planStore = inject(PlanStore);
  private readonly route = inject(ActivatedRoute);
  readonly filter = this.filterService.filter;

  planTypeOptions = computed<IDropdownOption[]>(() => {
    return this.planStore.planTypeOptions() as IDropdownOption[];
  });

  statusOptions = computed<IDropdownOption[]>(() => {
    this.i18nService.currentLanguage();
    return [
      { label: this.i18nService.translate('plans.filter.allStatuses'), value: null },
      { label: this.i18nService.translate('plans.status.submitted'), value: EInvestorPlanStatus.SUBMITTED },
      { label: this.i18nService.translate('plans.status.draft'), value: EInvestorPlanStatus.DRAFT },
      { label: this.i18nService.translate('plans.status.pending'), value: EInvestorPlanStatus.PENDING },
      { label: this.i18nService.translate('plans.status.underReview'), value: EInvestorPlanStatus.UNDER_REVIEW },
      // { label: this.i18nService.translate('plans.status.approved'), value: EInvestorPlanStatus.APPROVED },
      // { label: this.i18nService.translate('plans.status.rejected'), value: EInvestorPlanStatus.REJECTED },
    ];
  });

  ngOnInit() {
    this.listenToSearchChanges();
    this.listenToQueryParamChanges();
  }

  private listenToQueryParamChanges() {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(queryParams => {
        const updates: Partial<IPlanFilter> = {};

        if (queryParams['status']) {
          const status = this.getStatusFromParam(queryParams['status']);
          if (status !== null) {
            updates.status = status;
          } else {
            updates.status = null;
          }
        } else {
          updates.status = null;
        }

        if (queryParams['planType']) {
          const planType = this.getPlanTypeFromParam(queryParams['planType']);
          if (planType) {
            updates.planType = planType;
          } else {
            updates.planType = null;
          }
        } else {
          updates.planType = null;
        }

        if (queryParams['searchText']) {
          updates.searchText = queryParams['searchText'];
        } else {
          updates.searchText = '';
        }

        if (Object.keys(updates).length > 0) {
          this.filterService.updateFilterSignal({ ...updates, pageNumber: 1 });
          this.filterService.applyFilterWithPaging();
        } else {
          this.filterService.applyFilterWithPaging();
        }
      });
  }

  private getStatusFromParam(param: string | number): EInvestorPlanStatus | null {
    const statusNum = Number(param);
    if (!isNaN(statusNum) && Object.values(EInvestorPlanStatus).includes(statusNum as EInvestorPlanStatus)) {
      return statusNum as EInvestorPlanStatus;
    }
    return null;
  }

  private getPlanTypeFromParam(param: string): EOpportunityType | null {
    switch (param.toLowerCase()) {
      case 'service':
        return EOpportunityType.SERVICES;
      case 'product':
        return EOpportunityType.PRODUCT;
      default:
        return null;
    }
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
