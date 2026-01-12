import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InternalUsersDashboardPlansFilterService } from '../../services/internal-users-dashboard-plans-filter/internal-users-dashboard-plans-filter-service';
import { TranslatePipe } from 'src/app/shared/pipes';
import { EInternalUserPlanStatus, IPlanFilter } from 'src/app/shared/interfaces';
import { EOpportunityType, ERoles } from 'src/app/shared/enums';
import { I18nService } from 'src/app/shared/services/i18n/i18n.service';
import { PlanStore, IPlanTypeDropdownOption } from 'src/app/shared/stores/plan/plan.store';
import { RoleService } from 'src/app/shared/services/role/role-service';

interface IDropdownOption {
  label: string;
  value: EOpportunityType | EInternalUserPlanStatus | null;
}

@Component({
  selector: 'app-internal-users-dashboard-plans-filter',
  imports: [FormsModule, InputTextModule, DatePickerModule, SelectModule, TranslatePipe],
  templateUrl: './internal-users-dashboard-plans-filter.html',
  styleUrl: './internal-users-dashboard-plans-filter.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InternalUsersDashboardPlansFilter implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchSubject = new Subject<string>();
  readonly filterService = inject(InternalUsersDashboardPlansFilterService);
  private readonly i18nService = inject(I18nService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly planStore = inject(PlanStore);
  private readonly roleService = inject(RoleService);
  readonly filter = this.filterService.filter;

  planTypeOptions = computed<IDropdownOption[]>(() => {
    return this.planStore.planTypeOptions() as IDropdownOption[];
  });

  statusOptions = computed<IDropdownOption[]>(() => {
    this.i18nService.currentLanguage();

    // Base option: "All Statuses"
    const allStatusesOption: IDropdownOption =
      { label: this.i18nService.translate('plans.filter.allStatuses'), value: null };

    // Get role-specific status options
    const roleSpecificOptions = this.getRoleSpecificStatusOptions();

    return [allStatusesOption, ...roleSpecificOptions];
  });

  /**
   * Returns status options based on the current user's role
   */
  private getRoleSpecificStatusOptions(): IDropdownOption[] {
    if (this.roleService.hasAnyRoleSignal([ERoles.EMPLOYEE])()) {
      return this.getEmployeeStatusOptions();
    } else if (this.roleService.hasAnyRoleSignal([ERoles.Division_MANAGER])()) {
      return this.getDivisionManagerStatusOptions();
    } else
      return [];
  }

  // TODO: we will add these (DEPT Rejected - DV. Rejected - DV acknowledgement - DEPT Approved)
  // Employee Statuses Options
  private getEmployeeStatusOptions(): IDropdownOption[] {
    return [
      {
        label: this.i18nService.translate('plans.employee_status.underReview'),
        value: EInternalUserPlanStatus.UNDER_REVIEW,
      }
    ];
  }

  // Division Manager Statuses Options
  private getDivisionManagerStatusOptions(): IDropdownOption[] {
    return [
      {
        label: this.i18nService.translate('plans.employee_status.employeeApproved'),
        value: EInternalUserPlanStatus.EMPLOYEE_APPROVED,
      },
      {
        label: this.i18nService.translate('plans.employee_status.deptRejected'),
        value: EInternalUserPlanStatus.DEPT_REJECTED,
      },
      {
        label: this.i18nService.translate('plans.employee_status.unassigned'),
        value: EInternalUserPlanStatus.UNASSIGNED,
      },
    ];
  }


  /**
   * Computed signal to check if status dropdown should be shown
   * Department Manager doesn't see status dropdown
   */
  readonly showStatusFilter = computed(() => {
    return !this.roleService.hasAnyRoleSignal([ERoles.DEPARTMENT_MANAGER])();
  });

  ngOnInit() {
    // Auto-set DV_APPROVED filter for Department Managers
    this.initializeDepartmentManagerFilter();
    this.listenToSearchChanges();
    this.listenToQueryParamChanges();
  }

  /**
   * Initialize filter for Department Manager - automatically filter by DV_APPROVED
   */
  private initializeDepartmentManagerFilter(): void {
    if (this.roleService.hasAnyRoleSignal([ERoles.DEPARTMENT_MANAGER])()) {
      this.filterService.updateFilterSignal({
        status: EInternalUserPlanStatus.DV_APPROVED,
        pageNumber: 1
      });
      this.filterService.applyFilterWithPaging();
    }
  }

  private listenToQueryParamChanges() {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(queryParams => {
        const updates: Partial<IPlanFilter> = {};

    if (queryParams['status']) {
      const status = this.getStatusFromParam(queryParams['status']);
      if (status !== null) updates.status = status;
    }

    if (queryParams['planType']) {
      const planType = this.getPlanTypeFromParam(queryParams['planType']);
      if (planType) updates.planType = planType;
    }

    if (queryParams['searchText']) {
      updates.searchText = queryParams['searchText'];
    }

    if (Object.keys(updates).length > 0) {
      this.filterService.updateFilterSignal({ ...updates, pageNumber: 1 });
      this.filterService.applyFilterWithPaging();
    }
    });
  }

  onSearchTextChange(value: string) {
    this.filterService.updateFilterSignal({ searchText: value, pageNumber: 1 });
    this.searchSubject.next(value ?? '');
  }

  onPlanTypeChange(value: EOpportunityType | null) {
    this.filterService.updateFilterSignal({ planType: value, pageNumber: 1 });
    this.filterService.applyFilterWithPaging();
  }

  onStatusChange(value: EInternalUserPlanStatus | null) {
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

  private getStatusFromParam(param: string | number): EInternalUserPlanStatus | null {
    const statusNum = Number(param);
    if (!isNaN(statusNum) && Object.values(EInternalUserPlanStatus).includes(statusNum as EInternalUserPlanStatus)) {
      return statusNum as EInternalUserPlanStatus;
    }

    const paramStr = String(param).toLowerCase();
    switch (paramStr) {
      case 'employee_approved':
        return EInternalUserPlanStatus.EMPLOYEE_APPROVED;
      case 'dept_rejected':
        return EInternalUserPlanStatus.DEPT_REJECTED;
      case 'unassigned':
        return EInternalUserPlanStatus.UNASSIGNED;
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
