import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ActivatedRoute } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';
import { EOpportunityType } from 'src/app/shared/enums';
import { EInternalUserPlanStatus, IAssignActiveEmployee, IPlanFilter } from 'src/app/shared/interfaces';
import { TranslatePipe } from 'src/app/shared/pipes';
import { I18nService } from 'src/app/shared/services/i18n';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InternalUsersPlansFilterService } from '../../services/internal-users-plans-filter-service/internal-users-plans-filter-service';
import { PlanApiService } from 'src/app/shared/api/plans/plan-api-service';

interface IDropdownOption {
  label: string;
  value: EOpportunityType | EInternalUserPlanStatus  | null;
}

interface IAssigneeOption {
  label: string;
  value: any | null;
}

@Component({
  selector: 'app-internal-users-plans-filter',
  imports: [FormsModule, InputTextModule, DatePickerModule, SelectModule, TranslatePipe],
  templateUrl: './internal-users-plans-filter.html',
  styleUrl: './internal-users-plans-filter.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InternalUsersPlansFilter implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchSubject = new Subject<string>();
  readonly filterService = inject(InternalUsersPlansFilterService);
  private readonly i18nService = inject(I18nService);
  private readonly planStore = inject(PlanStore);
  private readonly route = inject(ActivatedRoute);
  private readonly planApiService = inject(PlanApiService);
  readonly filter = this.filterService.filter;

  assignees = signal<IAssignActiveEmployee[]>([]);
  isLoadingAssignees = signal(false);

  planTypeOptions = computed<IDropdownOption[]>(() => {
    return this.planStore.planTypeOptions() as IDropdownOption[];
  });

  assigneeOptions = computed<IAssigneeOption[]>(() => {
    return [
      { label: this.i18nService.translate('plans.filter.allAssignees'), value: null },
      ...this.assignees().map(assignee => ({
        label: assignee.name,
        value: assignee.id
      }))
    ];
  });

  statusOptions = computed<IDropdownOption[]>(() => {
    this.i18nService.currentLanguage();
    return [
      { label: this.i18nService.translate('plans.filter.allStatuses'), value: null },
      { label: this.i18nService.translate('plans.employee_status.pending'), value: EInternalUserPlanStatus.PENDING },
      { label: this.i18nService.translate('plans.employee_status.underReview'), value: EInternalUserPlanStatus.UNDER_REVIEW },
      { label: this.i18nService.translate('plans.employee_status.approved'), value: EInternalUserPlanStatus.APPROVED },
      { label: this.i18nService.translate('plans.employee_status.rejected'), value: EInternalUserPlanStatus.REJECTED },
      { label: this.i18nService.translate('plans.employee_status.unassigned'), value: EInternalUserPlanStatus.UNASSIGNED },
      { label: this.i18nService.translate('plans.employee_status.assigned'), value: EInternalUserPlanStatus.ASSIGNED },
      { label: this.i18nService.translate('plans.employee_status.deptApproved'), value: EInternalUserPlanStatus.DEPT_APPROVED },
      { label: this.i18nService.translate('plans.employee_status.deptRejected'), value: EInternalUserPlanStatus.DEPT_REJECTED },
      { label: this.i18nService.translate('plans.employee_status.dvApproved'), value: EInternalUserPlanStatus.DV_APPROVED },
      { label: this.i18nService.translate('plans.employee_status.dvRejected'), value: EInternalUserPlanStatus.DV_REJECTED },
      { label: this.i18nService.translate('plans.employee_status.dvRejectionAcknowledged'), value: EInternalUserPlanStatus.DV_REJECTION_ACKNOWLEDGED },
      { label: this.i18nService.translate('plans.employee_status.employeeApproved'), value: EInternalUserPlanStatus.EMPLOYEE_APPROVED },
      { label: this.i18nService.translate('plans.employee_status.employeeRejected'), value: EInternalUserPlanStatus.EMPLOYEE_REJECTED },
    ];
  });

  ngOnInit() {
    this.loadAssignees();
    this.listenToSearchChanges();
    this.listenToQueryParamChanges();
  }

  private loadAssignees() {
    this.isLoadingAssignees.set(true);
    this.planApiService.getPlanAssignees()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.assignees.set(response.body as IAssignActiveEmployee[] || []);
          this.isLoadingAssignees.set(false);
        },
        error: (error) => {
          console.error('Error loading assignees:', error);
          this.isLoadingAssignees.set(false);
        }
      });
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

        if (queryParams['assigneeId']) {
          updates.assigneeId = queryParams['assigneeId'];
        } else {
          updates.assigneeId = null;
        }

        if (Object.keys(updates).length > 0) {
          this.filterService.updateFilterSignal({ ...updates, pageNumber: 1 });
          this.filterService.applyFilterWithPaging();
        } else {
          this.filterService.applyFilterWithPaging();
        }
      });
  }

  private getStatusFromParam(param: string | number): EInternalUserPlanStatus | null {
    const statusNum = Number(param);
    if (!isNaN(statusNum) && Object.values(EInternalUserPlanStatus).includes(statusNum as EInternalUserPlanStatus)) {
      return statusNum as EInternalUserPlanStatus;
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

  onStatusChange(value: EInternalUserPlanStatus | null) {
    this.filterService.updateFilterSignal({ status: value, pageNumber: 1 });
    this.filterService.applyFilterWithPaging();
  }

  onAssigneeChange(value: number | null) {
    this.filterService.updateFilterSignal({ assigneeId: value, pageNumber: 1 });
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
