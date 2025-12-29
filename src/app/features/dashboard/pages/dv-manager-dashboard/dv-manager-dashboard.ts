import { ChangeDetectionStrategy, Component, computed, inject, OnInit, output, signal } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { take } from 'rxjs';
import { TableLayoutComponent } from 'src/app/shared/components/layout-components/table-layout/table-layout.component';
import { MenuModule } from 'primeng/menu';
import { TableSkeletonComponent } from 'src/app/shared/components/skeletons/table-skeleton/table-skeleton.component';
import { DataTableComponent } from 'src/app/shared/components/layout-components/data-table/data-table.component';
import { SkeletonModule } from 'primeng/skeleton';
import { EEmployeePlanStatus, IPlanRecord, ITableHeaderItem, TColors, TPlansSortingKeys } from 'src/app/shared/interfaces';
import { EOpportunityType } from 'src/app/shared/enums';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { DashboardPlansStore } from 'src/app/shared/stores/dashboard-plans/dashboard-plans.store';
import { DvManagerDashboardPlansFilterService } from '../../services/dv-manager-dashboard-plans-filter/dv-manager-dashboard-plans-filter-service';
import { DvManagerDashboardPlansFilter } from '../../components/dv-manager-dashboard-plans-filter/dv-manager-dashboard-plans-filter';
import { DvManagerDashboardPlanActionMenu } from '../../components/dv-manager-dashboard-plan-action-menu/dv-manager-dashboard-plan-action-menu';
import { I18nService } from 'src/app/shared/services/i18n/i18n.service';
import { TranslatePipe } from 'src/app/shared/pipes';
import { AssignReassignManualEmployee } from 'src/app/features/plans/components/assign-reassign-manual-employee/assign-reassign-manual-employee';
import { ProductLocalizationPlanWizard } from 'src/app/shared/components/plans/plan-localization/product-localization-plan-wizard/product-localization-plan-wizard';
import { TimelineDialog } from "src/app/shared/components/timeline/timeline-dialog/timeline-dialog";
import { EmployeePlanStatusMapper } from '../../classes/employee-plan-status.mapper';
import { BaseTagComponent } from "src/app/shared/components/base-components/base-tag/base-tag.component";

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
    TranslatePipe,
    AssignReassignManualEmployee,
    ProductLocalizationPlanWizard,
    TimelineDialog,
    BaseTagComponent
  ],
  templateUrl: './dv-manager-dashboard.html',
  styleUrl: './dv-manager-dashboard.scss',
  providers: [DvManagerDashboardPlansFilterService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DvManagerDashboard implements OnInit {
  productLocalizationPlanWizardVisibility = signal(false);

  EEmployeePlanStatus = EEmployeePlanStatus;

  private readonly planStore = inject(PlanStore);
  private readonly dashboardPlansStore = inject(DashboardPlansStore);
  readonly filterService = inject(DvManagerDashboardPlansFilterService);
  private readonly i18nService = inject(I18nService);
  private readonly employeePlanStatusMapper = new EmployeePlanStatusMapper(this.i18nService);

  newPlanOpportunityType = computed(() => this.planStore.newPlanOpportunityType());
  viewAssignDialog = signal<boolean>(false);
  isReassignMode = signal<boolean>(false);
  planItem = signal<IPlanRecord | null>(null);
  timelineVisibility = signal(false);
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
    // Filter component handles query params and cleanup
  }
  onUserReadAndApproved() {
    this.planStore.resetNewPlanOpportunityType();
  }

  onUserConfirmNewPlanDialog() {
    this.planStore.getActiveOpportunityLookUps().pipe(take(1)).subscribe();
    if (this.newPlanOpportunityType() && this.newPlanOpportunityType()! === EOpportunityType.PRODUCT) {
      // Creating new plan from scratch - clear applied opportunity
      this.planStore.resetAppliedOpportunity();
      // Reset mode and plan ID for new plan
      this.planStore.setWizardMode('create');
      this.planStore.setSelectedPlanId(null);
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
    return this.employeePlanStatusMapper.getStatusLabel(status);
  }

  getStatusBadgeColor(status: EEmployeePlanStatus): TColors {
    return this.employeePlanStatusMapper.getStatusBadgeColor(status);
  }


  onViewDetails(plan: IPlanRecord) {
    // Set mode to view and plan ID
    this.planStore.setWizardMode('view');
    this.planStore.setSelectedPlanId(plan.id);
    this.planStore.setPlanStatus(plan.status);
    this.productLocalizationPlanWizardVisibility.set(true);
  }

  onDownload(plan: IPlanRecord) {
    this.planStore.downloadPlan(plan.id).pipe(take(1)).subscribe({
      error: (error) => {
        console.error('Error downloading plan:', error);
      }
    });
  }

  applyFilter() {
    this.filterService.applyFilter();
  }

  onSubmitProductLocalizationPlanWizard() {
    console.log('Submit product localization plan wizard');
  }

  onViewTimeline(plan: IPlanRecord) {
    this.timelineVisibility.set(true);
    this.planItem.set(plan);
  }

  onAssignToEmployee(plan: IPlanRecord) {
    this.viewAssignDialog.set(true);
    this.planItem.set(plan);
    this.isReassignMode.set(false);
  }

  onReAssign(plan: IPlanRecord) {
    this.viewAssignDialog.set(true);
    this.planItem.set(plan);
    this.isReassignMode.set(true);
  }
}

