import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DvManagerDashboardPlansFilterService } from '../../services/dv-manager-dashboard-plans-filter/dv-manager-dashboard-plans-filter-service';
import { TranslatePipe } from 'src/app/shared/pipes';
import { EEmployeePlanStatus, IPlanFilter } from 'src/app/shared/interfaces';
import { EOpportunityType } from 'src/app/shared/enums';
import { I18nService } from 'src/app/shared/services/i18n/i18n.service';

interface IDropdownOption {
  label: string;
  value: EOpportunityType | EEmployeePlanStatus | null;
}

@Component({
  selector: 'app-dv-manager-dashboard-plans-filter',
  imports: [FormsModule, InputTextModule, DatePickerModule, SelectModule, TranslatePipe],
  templateUrl: './dv-manager-dashboard-plans-filter.html',
  styleUrl: './dv-manager-dashboard-plans-filter.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DvManagerDashboardPlansFilter implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchSubject = new Subject<string>();
  readonly filterService = inject(DvManagerDashboardPlansFilterService);
  private readonly i18nService = inject(I18nService);
  private readonly route = inject(ActivatedRoute);
  readonly filter = this.filterService.filter;

  planTypeOptions = computed<IDropdownOption[]>(() => {
    this.i18nService.currentLanguage();
    return [
      { label: this.i18nService.translate('plans.filter.allTypes'), value: null },
      {
        label: this.i18nService.translate('plans.filter.service'),
        value: EOpportunityType.SERVICES,
      },
      {
        label: this.i18nService.translate('plans.filter.material'),
        value: EOpportunityType.PRODUCT,
      },
    ];
  });

  statusOptions = computed<IDropdownOption[]>(() => {
    this.i18nService.currentLanguage();
    return [
      { label: this.i18nService.translate('plans.filter.allStatuses'), value: null },
      {
        label: this.i18nService.translate('plans.employee_status.employeeApproved'),
        value: EEmployeePlanStatus.EMPLOYEE_APPROVED,
      },
      {
        label: this.i18nService.translate('plans.employee_status.deptRejected'),
        value: EEmployeePlanStatus.DEPT_REJECTED,
      },
      {
        label: this.i18nService.translate('plans.employee_status.unassigned'),
        value: EEmployeePlanStatus.UNASSIGNED,
      },
    ];
  });

  ngOnInit() {
    this.listenToSearchChanges();
    this.prefillFiltersFromQueryParams();
  }

  onSearchTextChange(value: string) {
    this.filterService.updateFilterSignal({ searchText: value, pageNumber: 1 });
    this.searchSubject.next(value ?? '');
  }

  onPlanTypeChange(value: EOpportunityType | null) {
    this.filterService.updateFilterSignal({ planType: value, pageNumber: 1 });
    this.filterService.applyFilterWithPaging();
  }

  onStatusChange(value: EEmployeePlanStatus | null) {
    this.filterService.updateFilterSignal({ status: value, pageNumber: 1 });
    this.filterService.applyFilterWithPaging();
  }

  onPickerChange(value: Date[] | undefined) {
    value = value?.filter((x) => !!x) ?? [];
    if (!!value && (value.length == 2 || value.length == 0)) {
      this.filterService.updateFilterSignal({
        submissionDate: value.length === 2 ? value : undefined,
        pageNumber: 1,
      });
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

  private prefillFiltersFromQueryParams() {
    const queryParams = this.route.snapshot.queryParams;
    const updates: Partial<IPlanFilter> = {};

    if (queryParams['status']) {
      const status = this.getStatusFromParam(queryParams['status']);
      if (status) updates.status = status;
    }

    if (queryParams['planType']) {
      const planType = this.getPlanTypeFromParam(queryParams['planType']);
      if (planType) updates.planType = planType;
    }

    if (queryParams['searchText']) {
      updates.searchText = queryParams['searchText'];
    }

    this.filterService.updateFilterSignal({ ...updates, pageNumber: 1 });
    this.filterService.applyFilterWithPaging();    
  }

  private getStatusFromParam(param: string): EEmployeePlanStatus | null {
    switch (param.toLowerCase()) {
      case 'employee_approved':
        return EEmployeePlanStatus.EMPLOYEE_APPROVED;
      case 'dept_rejected':
        return EEmployeePlanStatus.DEPT_REJECTED;
      case 'unassigned':
        return EEmployeePlanStatus.UNASSIGNED;
      default:
        return null;
    }
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
}
