import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { take } from 'rxjs';
import { TableLayoutComponent } from 'src/app/shared/components/layout-components/table-layout/table-layout.component';
import { MenuModule } from 'primeng/menu';
import { TableSkeletonComponent } from 'src/app/shared/components/skeletons/table-skeleton/table-skeleton.component';
import { DataTableComponent } from 'src/app/shared/components/layout-components/data-table/data-table.component';
import { EInternalUserPlanStatus, IPlanRecord, ITableHeaderItem, TColors, TPlansSortingKeys } from 'src/app/shared/interfaces';
import { EOpportunityType } from 'src/app/shared/enums';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { DashboardPlansStore } from 'src/app/shared/stores/dashboard-plans/dashboard-plans.store';
import { InternalUsersDashboardPlansFilter } from '../../components/internal-users-dashboard-plans-filter/internal-users-dashboard-plans-filter';
import { DashboardStatisticsSkeleton } from '../../components/dashboard-statistics-skeleton/dashboard-statistics-skeleton';
import { DashboardStatisticsCards } from '../../components/dashboard-statistics-cards/dashboard-statistics-cards';
import { I18nService } from 'src/app/shared/services/i18n/i18n.service';
import { TranslatePipe, SlaCountdownNounPipe } from 'src/app/shared/pipes';
import { AssignReassignManualEmployee } from 'src/app/features/plans/components/assign-reassign-manual-employee/assign-reassign-manual-employee';
import { ProductLocalizationPlanWizard } from 'src/app/shared/components/plans/plan-localization/product-localization-plan-wizard/product-localization-plan-wizard';
import { ServiceLocalizationPlanWizard } from 'src/app/shared/components/plans/service-localication/service-localization-plan-wizard/service-localization-plan-wizard';
import { TimelineDialog } from "src/app/shared/components/timeline/timeline-dialog/timeline-dialog";
import { EmployeePlanStatusMapper } from '../../classes/employee-plan-status.mapper';
import { BaseTagComponent } from "src/app/shared/components/base-components/base-tag/base-tag.component";
import { RoleService } from 'src/app/shared/services/role/role-service';
import { InternalUsersDashboardPlansFilterService } from '../../services/internal-users-dashboard-plans-filter/internal-users-dashboard-plans-filter-service';
import { DashboardPlanActionMenu } from '../../components/dashboard-plan-action-menu/dashboard-plan-action-menu';

@Component({
  selector: 'app-dashboard-view',
  imports: [
    TableLayoutComponent,
    TableSkeletonComponent,
    DataTableComponent,
    ButtonModule,
    MenuModule,
    InternalUsersDashboardPlansFilter,
    DashboardPlanActionMenu,
    DashboardStatisticsSkeleton,
    DashboardStatisticsCards,
    DatePipe,
    NgClass,
    TranslatePipe,
    SlaCountdownNounPipe,
    AssignReassignManualEmployee,
    ProductLocalizationPlanWizard,
    ServiceLocalizationPlanWizard,
    TimelineDialog,
    BaseTagComponent
  ],
  templateUrl: './dashboard-view.html',
  styleUrl: './dashboard-view.scss',
  providers: [InternalUsersDashboardPlansFilterService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardView implements OnInit {
  productLocalizationPlanWizardVisibility = signal(false);
  serviceLocalizationPlanWizardVisibility = signal(false);

  EInternalUserPlanStatus = EInternalUserPlanStatus;

  private readonly planStore = inject(PlanStore);
  private readonly dashboardPlansStore = inject(DashboardPlansStore);
  readonly filterService = inject(InternalUsersDashboardPlansFilterService);
  private readonly i18nService = inject(I18nService);
  private readonly employeePlanStatusMapper = new EmployeePlanStatusMapper(this.i18nService);
  private readonly roleService = inject(RoleService);

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
      { label: this.i18nService.translate('plans.table.opportunityType'), isSortable: false, sortingKey: 'planType' },
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

  getStatusLabel(status: EInternalUserPlanStatus): string {
    return this.employeePlanStatusMapper.getStatusLabel(status);
  }

  getStatusBadgeColor(status: EInternalUserPlanStatus): TColors {
    return this.employeePlanStatusMapper.getStatusBadgeColor(status);
  }

  onViewDetails(plan: IPlanRecord) {
    // Set mode to view and plan ID
    this.planStore.setWizardMode('view');
    this.planStore.setSelectedPlanId(plan.id);
    this.planStore.setPlanStatus(plan.status);

    // Show the appropriate wizard based on plan type
    if (plan.planType === EOpportunityType.PRODUCT)
      this.productLocalizationPlanWizardVisibility.set(true);
    else if (plan.planType === EOpportunityType.SERVICES)
      this.serviceLocalizationPlanWizardVisibility.set(true);
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

  onReview(plan: IPlanRecord) {
    console.log('Review Plan : ', plan);
  }
}
