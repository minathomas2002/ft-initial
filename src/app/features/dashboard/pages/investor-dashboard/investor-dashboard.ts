import { ChangeDetectionStrategy, Component, computed, inject, OnInit, output, signal } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { take } from 'rxjs';
import { TableLayoutComponent } from 'src/app/shared/components/layout-components/table-layout/table-layout.component';
import { ProductLocalizationPlanWizard } from 'src/app/shared/components/plans/product-localization-plan-wizard/product-localization-plan-wizard';
import { MenuModule } from 'primeng/menu';
import { TableSkeletonComponent } from 'src/app/shared/components/skeletons/table-skeleton/table-skeleton.component';
import { DataTableComponent } from 'src/app/shared/components/layout-components/data-table/data-table.component';
import { SkeletonModule } from 'primeng/skeleton';
import { NewPlanDialog } from 'src/app/shared/components/plans/new-plan-dialog/new-plan-dialog';
import { PlanTermsAndConditionsDialog } from 'src/app/shared/components/plans/plan-terms-and-conditions-dialog/plan-terms-and-conditions-dialog';
import { EEmployeePlanStatus, EInvestorPlanStatus, IPlanRecord, ITableHeaderItem, TPlansSortingKeys } from 'src/app/shared/interfaces';
import { EOpportunityType } from 'src/app/shared/enums';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { DashboardPlansStore } from 'src/app/shared/stores/dashboard-plans/dashboard-plans.store';
import { DashboardPlansFilterService } from '../../services/dashboard-plans-filter/dashboard-plans-filter-service';
import { InvestorDashboardPlansFilter } from '../../components/investor-dashboard-plans-filter/investor-dashboard-plans-filter';
import { InvestorDashboardPlanActionMenu } from '../../components/investor-dashboard-plan-action-menu/investor-dashboard-plan-action-menu';
import { I18nService } from 'src/app/shared/services/i18n/i18n.service';
import { TranslatePipe } from 'src/app/shared/pipes';

@Component({
  selector: 'app-investor-dashboard',
  imports: [
    TableLayoutComponent,
    TableSkeletonComponent,
    DataTableComponent,
    ButtonModule,
    MenuModule,
    PlanTermsAndConditionsDialog,
    NewPlanDialog,
    ProductLocalizationPlanWizard,
    InvestorDashboardPlansFilter,
    InvestorDashboardPlanActionMenu,
    DatePipe,
    NgClass,
    SkeletonModule,
    TranslatePipe
  ],
  templateUrl: './investor-dashboard.html',
  styleUrl: './investor-dashboard.scss',
  providers: [DashboardPlansFilterService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvestorDashboard implements OnInit {
  planTermsAndConditionsDialogVisibility = signal(false);
  newPlanDialogVisibility = signal(false);
  productLocalizationPlanWizardVisibility = signal(false);

  eEmployeePlanStatus = EEmployeePlanStatus;

  // Wizard mode and plan ID signals
  selectedPlanId = signal<string | null>(null);
  wizardMode = signal<'create' | 'edit' | 'view'>('create');

  private readonly planStore = inject(PlanStore);
  private readonly dashboardPlansStore = inject(DashboardPlansStore);
  readonly filterService = inject(DashboardPlansFilterService);
  private readonly i18nService = inject(I18nService);

  newPlanOpportunityType = computed(() => this.planStore.newPlanOpportunityType());

  readonly headers = computed<ITableHeaderItem<TPlansSortingKeys>[]>(() => {
    this.i18nService.currentLanguage();
    return [
      { label: this.i18nService.translate('plans.table.planId'), isSortable: true, sortingKey: 'planCode' },
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
    this.planTermsAndConditionsDialogVisibility.set(false);
    this.planStore.resetNewPlanOpportunityType();
    this.newPlanDialogVisibility.set(true);
  }

  onUserConfirmNewPlanDialog() {
    this.planStore.getActiveOpportunityLookUps().pipe(take(1)).subscribe();
    this.newPlanDialogVisibility.set(false);
    if (this.newPlanOpportunityType() && this.newPlanOpportunityType()! === EOpportunityType.PRODUCT) {
      // Reset mode and plan ID for new plan
      this.wizardMode.set('create');
      this.selectedPlanId.set(null);
      this.productLocalizationPlanWizardVisibility.set(true);
    } else {
      console.log('service');
    }
  }

  getPlanTypeLabel(planType: EOpportunityType): string {
    return planType === EOpportunityType.SERVICES
      ? this.i18nService.translate('opportunity.type.services')
      : this.i18nService.translate('opportunity.type.product');
  }

  getStatusLabel(status: EInvestorPlanStatus): string {
    const statusMap = {
      [EInvestorPlanStatus.SUBMITTED]: this.i18nService.translate('plans.status.submitted'),
      [EInvestorPlanStatus.PENDING]: this.i18nService.translate('plans.status.pending'),
      [EInvestorPlanStatus.UNDER_REVIEW]: this.i18nService.translate('plans.status.underReview'),
      [EInvestorPlanStatus.APPROVED]: this.i18nService.translate('plans.status.approved'),
      [EInvestorPlanStatus.REJECTED]: this.i18nService.translate('plans.status.rejected'),
      [EInvestorPlanStatus.DRAFT]: this.i18nService.translate('plans.status.draft'),
    };
    return statusMap[status] || '';
  }

  getStatusBadgeClass(status: EInvestorPlanStatus): string {
    const classMap = {
      [EInvestorPlanStatus.SUBMITTED]: 'bg-primary-50 text-primary-700 border-primary-200',
      [EInvestorPlanStatus.PENDING]: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      [EInvestorPlanStatus.UNDER_REVIEW]: 'bg-blue-50 text-blue-700 border-blue-200',
      [EInvestorPlanStatus.APPROVED]: 'bg-green-50 text-green-700 border-green-200',
      [EInvestorPlanStatus.REJECTED]: 'bg-red-50 text-red-700 border-red-200',
      [EInvestorPlanStatus.DRAFT]: 'bg-gray-50 text-gray-700 border-gray-200',
    };
    return classMap[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  }


  onViewDetails(plan: IPlanRecord) {
    // Set mode to view and plan ID
    this.wizardMode.set('view');
    this.selectedPlanId.set(plan.id);
    this.productLocalizationPlanWizardVisibility.set(true);
  }

  onEdit(plan: IPlanRecord) {
    // Check if plan status allows editing (Draft or Pending)
    if (plan.status === EInvestorPlanStatus.DRAFT || plan.status === EInvestorPlanStatus.PENDING) {
      // Set mode to edit and plan ID
      this.wizardMode.set('edit');
      this.selectedPlanId.set(plan.id);
      this.productLocalizationPlanWizardVisibility.set(true);
    } else {
      this.i18nService.translate('plans.errors.cannotEdit');
      // Could show error message here
      console.warn('Plan cannot be edited. Status:', plan.status);
    }
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

  createNewPlan() {
    // Set mode to view and plan ID
    this.wizardMode.set('create');    
    this.selectedPlanId.set(null);
    this.productLocalizationPlanWizardVisibility.set(true);
  }
}
