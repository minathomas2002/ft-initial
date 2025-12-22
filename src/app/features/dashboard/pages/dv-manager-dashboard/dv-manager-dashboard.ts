import { ChangeDetectionStrategy, Component, computed, inject, OnInit, output, signal } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { take } from 'rxjs';
import { TableLayoutComponent } from 'src/app/shared/components/layout-components/table-layout/table-layout.component';
import { MenuModule } from 'primeng/menu';
import { TableSkeletonComponent } from 'src/app/shared/components/skeletons/table-skeleton/table-skeleton.component';
import { DataTableComponent } from 'src/app/shared/components/layout-components/data-table/data-table.component';
import { SkeletonModule } from 'primeng/skeleton';
import { EEmployeePlanStatus, IPlanRecord, ITableHeaderItem, TPlansSortingKeys } from 'src/app/shared/interfaces';
import { EOpportunityType } from 'src/app/shared/enums';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { DashboardPlansStore } from 'src/app/shared/stores/dashboard-plans/dashboard-plans.store';
import { DvManagerDashboardPlansFilterService } from '../../services/dv-manager-dashboard-plans-filter/dv-manager-dashboard-plans-filter-service';
import { DvManagerDashboardPlansFilter } from '../../components/dv-manager-dashboard-plans-filter/dv-manager-dashboard-plans-filter';
import { DvManagerDashboardPlanActionMenu } from '../../components/dv-manager-dashboard-plan-action-menu/dv-manager-dashboard-plan-action-menu';
import { I18nService } from 'src/app/shared/services/i18n/i18n.service';
import { TranslatePipe } from 'src/app/shared/pipes';

@Component({
  selector: 'app-dv-manager-dashboard',
  imports: [
    TableLayoutComponent,
    TableSkeletonComponent,
    DataTableComponent,
    ButtonModule,
    MenuModule,
    DvManagerDashboardPlansFilter,
    DvManagerDashboardPlanActionMenu,
    DatePipe,
    NgClass,
    SkeletonModule,
    TranslatePipe
  ],
  templateUrl: './dv-manager-dashboard.html',
  styleUrl: './dv-manager-dashboard.scss',
  providers: [DvManagerDashboardPlansFilterService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DvManagerDashboard implements OnInit {
  // Wizard mode and plan ID signals
  selectedPlanId = signal<string | null>(null);
  wizardMode = signal<'create' | 'edit' | 'view'>('create');

  private readonly planStore = inject(PlanStore);
  private readonly dashboardPlansStore = inject(DashboardPlansStore);
  readonly filterService = inject(DvManagerDashboardPlansFilterService);
  private readonly i18nService = inject(I18nService);

  newPlanOpportunityType = computed(() => this.planStore.newPlanOpportunityType());

  readonly headers = computed<ITableHeaderItem<TPlansSortingKeys>[]>(() => {
    this.i18nService.currentLanguage();
    return [
      { label: this.i18nService.translate('plans.table.planId'), isSortable: true, sortingKey: 'planCode' },
      { label: this.i18nService.translate('plans.table.investorName'), isSortable: true, sortingKey: 'investorName' },
      { label: this.i18nService.translate('plans.table.planTitle'), isSortable: false, sortingKey: 'title' },
      { label: this.i18nService.translate('plans.table.planType'), isSortable: false, sortingKey: 'planType' },
      { label: this.i18nService.translate('plans.table.submissionDate'), isSortable: true, sortingKey: 'submissionDate' },
      { label: this.i18nService.translate('plans.table.slaCountdown'), isSortable: true, sortingKey: 'slaCountDown' },
      { label: this.i18nService.translate('plans.table.currentStatus'), isSortable: false, sortingKey: 'status' },
      { label: this.i18nService.translate('plans.table.actions'), isSortable: false },
    ];
  });

  readonly rows = computed<IPlanRecord[]>(() => this.dashboardPlansStore.list());
  readonly totalRecords = computed(() => this.dashboardPlansStore.count());
  readonly isLoading = computed(() => this.dashboardPlansStore.loading());
  readonly statistics = computed(() => this.dashboardPlansStore.statistics());
  readonly isStatisticsLoading = computed(() => this.dashboardPlansStore.loading() || this.statistics() === null);

  ngOnInit(): void {
    this.filterService.applyFilter();
  }

  onUserReadAndApproved() {
    this.planStore.resetNewPlanOpportunityType();    
  }

  onUserConfirmNewPlanDialog() {
    this.planStore.getActiveOpportunityLookUps().pipe(take(1)).subscribe();    
    if (this.newPlanOpportunityType() && this.newPlanOpportunityType()! === EOpportunityType.PRODUCT) {
      // Reset mode and plan ID for new plan
      this.wizardMode.set('create');
      this.selectedPlanId.set(null);      
    } else {
      console.log('service');
    }
  }

  getPlanTypeLabel(planType: EOpportunityType): string {
    return planType === EOpportunityType.SERVICES
      ? this.i18nService.translate('opportunity.type.services')
      : this.i18nService.translate('opportunity.type.product');
  }

  getStatusLabel(status: EEmployeePlanStatus): string {
    const statusMap = {
      [EEmployeePlanStatus.PENDING]: this.i18nService.translate('plans.employee_status.pending'),
      [EEmployeePlanStatus.UNDER_REVIEW]: this.i18nService.translate('plans.employee_status.underReview'),
      [EEmployeePlanStatus.APPROVED]: this.i18nService.translate('plans.employee_status.approved'),
      [EEmployeePlanStatus.REJECTED]: this.i18nService.translate('plans.employee_status.rejected'),
      [EEmployeePlanStatus.UNASSIGNED]: this.i18nService.translate('plans.employee_status.unassigned'),
      [EEmployeePlanStatus.DEPT_APPROVED]: this.i18nService.translate('plans.employee_status.deptApproved'),
      [EEmployeePlanStatus.DEPT_REJECTED]: this.i18nService.translate('plans.employee_status.deptRejected'),
      [EEmployeePlanStatus.DV_APPROVED]: this.i18nService.translate('plans.employee_status.dvApproved'),
      [EEmployeePlanStatus.DV_REJECTED]: this.i18nService.translate('plans.employee_status.dvRejected'),
      [EEmployeePlanStatus.DV_REJECTION_ACKNOWLEDGED]: this.i18nService.translate('plans.employee_status.dvRejectionAcknowledged'),
      [EEmployeePlanStatus.EMPLOYEE_APPROVED]: this.i18nService.translate('plans.employee_status.employeeApproved'),
      [EEmployeePlanStatus.EMPLOYEE_REJECTED]: this.i18nService.translate('plans.employee_status.employeeRejected'),
    };
    return statusMap[status] || '';
  }

  getStatusBadgeClass(status: EEmployeePlanStatus): string {
    const classMap = {
      [EEmployeePlanStatus.EMPLOYEE_APPROVED]: 'bg-primary-50 text-primary-700 border-primary-200',
      [EEmployeePlanStatus.UNASSIGNED]: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      [EEmployeePlanStatus.UNDER_REVIEW]: 'bg-blue-50 text-blue-700 border-blue-200',
      [EEmployeePlanStatus.APPROVED]: 'bg-green-50 text-green-700 border-green-200',
      [EEmployeePlanStatus.DEPT_APPROVED]: 'bg-green-50 text-green-700 border-green-200',      
      [EEmployeePlanStatus.DEPT_REJECTED]: 'bg-red-50 text-red-700 border-red-200',
      [EEmployeePlanStatus.DV_APPROVED]: 'bg-green-50 text-green-700 border-green-200',
      [EEmployeePlanStatus.DV_REJECTED]: 'bg-red-50 text-red-700 border-red-200',
      [EEmployeePlanStatus.DV_REJECTION_ACKNOWLEDGED]: 'bg-red-50 text-red-700 border-red-200',
      [EEmployeePlanStatus.EMPLOYEE_REJECTED]: 'bg-red-50 text-red-700 border-red-200',
      [EEmployeePlanStatus.PENDING]: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      [EEmployeePlanStatus.REJECTED]: 'bg-red-50 text-red-700 border-red-200',
    };
    return classMap[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  }


  onViewDetails(plan: IPlanRecord) {
    // Set mode to view and plan ID
    this.wizardMode.set('view');
    this.selectedPlanId.set(plan.id);    
  }

  onDownload(plan: IPlanRecord) {
    // TODO: Implement download
    console.log('Download plan:', plan);
  }

  applyFilter() {
    this.filterService.applyFilter();
  }

  onSubmitProductLocalizationPlanWizard() {
    console.log('Submit product localization plan wizard');
  }
}

