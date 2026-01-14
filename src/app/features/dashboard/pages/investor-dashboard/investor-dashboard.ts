import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { take } from 'rxjs';
import { TableLayoutComponent } from 'src/app/shared/components/layout-components/table-layout/table-layout.component';
import { ProductLocalizationPlanWizard } from 'src/app/shared/components/plans/plan-localization/product-localization-plan-wizard/product-localization-plan-wizard';
import { MenuModule } from 'primeng/menu';
import { TableSkeletonComponent } from 'src/app/shared/components/skeletons/table-skeleton/table-skeleton.component';
import { DataTableComponent } from 'src/app/shared/components/layout-components/data-table/data-table.component';
import { SkeletonModule } from 'primeng/skeleton';
import { NewPlanDialog } from 'src/app/shared/components/plans/new-plan-dialog/new-plan-dialog';
import { PlanTermsAndConditionsDialog } from 'src/app/shared/components/plans/plan-terms-and-conditions-dialog/plan-terms-and-conditions-dialog';
import { EInternalUserPlanStatus, EInvestorPlanStatus, IPlanRecord, ITableHeaderItem, TPlansSortingKeys } from 'src/app/shared/interfaces';
import { EOpportunityType } from 'src/app/shared/enums';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { DashboardPlansStore } from 'src/app/shared/stores/dashboard-plans/dashboard-plans.store';
import { DashboardPlansFilterService } from '../../services/dashboard-plans-filter/dashboard-plans-filter-service';
import { InvestorDashboardPlansFilter } from '../../components/investor-dashboard-plans-filter/investor-dashboard-plans-filter';
import { I18nService } from 'src/app/shared/services/i18n/i18n.service';
import { TranslatePipe, SlaCountdownNounPipe } from 'src/app/shared/pipes';
import { TimelineDialog } from "src/app/shared/components/timeline/timeline-dialog/timeline-dialog";
import { ToasterService } from 'src/app/shared/services/toaster/toaster.service';
import { ServiceLocalizationPlanWizard } from 'src/app/shared/components/plans/service-localication/service-localization-plan-wizard/service-localization-plan-wizard';
import { DashboardPlanActionMenu } from '../../components/dashboard-plan-action-menu/dashboard-plan-action-menu';
import { Router } from '@angular/router';
import { ERoutes } from 'src/app/shared/enums';
import { TooltipModule } from 'primeng/tooltip';

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
    DashboardPlanActionMenu,
    DatePipe,
    NgClass,
    SkeletonModule,
    TranslatePipe,
    SlaCountdownNounPipe,
    ServiceLocalizationPlanWizard,
    TimelineDialog,
    TooltipModule
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
  serviceLocalizationPlanWizardVisibility = signal(false);
  timelineVisibility = signal(false);
  selectedPlan = signal<IPlanRecord | null>(null);
  eInvestorPlanStatus = EInvestorPlanStatus;

  private readonly planStore = inject(PlanStore);
  private readonly dashboardPlansStore = inject(DashboardPlansStore);
  readonly filterService = inject(DashboardPlansFilterService);
  private readonly i18nService = inject(I18nService);
  private readonly router = inject(Router);

  newPlanOpportunityType = computed(() => this.planStore.newPlanOpportunityType());

  readonly headers = computed<ITableHeaderItem<TPlansSortingKeys>[]>(() => {
    this.i18nService.currentLanguage();
    return [
      { label: this.i18nService.translate('plans.table.planId'), isSortable: true, sortingKey: 'planCode' },
      { label: this.i18nService.translate('plans.table.planTitle'), isSortable: false, sortingKey: 'title' },
      { label: 'Opportunity Type', isSortable: false, sortingKey: 'planType' },
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
  readonly isStatisticsLoading = computed(
    () => this.dashboardPlansStore.loading() || this.statistics() === null
  );
  private readonly toastService = inject(ToasterService);
  constructor() {
    effect(() => {
      if (
        !this.productLocalizationPlanWizardVisibility() &&
        !this.serviceLocalizationPlanWizardVisibility()
      ) {
        this.resetPlanWizard();
      }
    });
  }

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

    if (!this.newPlanOpportunityType()) return;

    // Creating new plan from scratch - clear applied opportunity
    this.planStore.resetAppliedOpportunity();
    // Reset mode and plan ID for new plan
    this.planStore.setWizardMode('create');
    this.planStore.setSelectedPlanId(null);

    this.newPlanOpportunityType() === EOpportunityType.PRODUCT
      ? this.productLocalizationPlanWizardVisibility.set(true)
      : this.serviceLocalizationPlanWizardVisibility.set(true);
    console.log(this.serviceLocalizationPlanWizardVisibility());
  }

  getPlanTypeLabel(planType: EOpportunityType): string {
    const planTypeOption = this.planStore.planTypeOptions().find(option => option.value === planType);
    return planTypeOption?.label ?? '';
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
    this.planStore.setWizardMode('view');
    this.planStore.setSelectedPlanId(plan.id);
    this.planStore.setPlanStatus(plan.status);

    plan.planType === EOpportunityType.PRODUCT
      ? this.productLocalizationPlanWizardVisibility.set(true)
      : this.serviceLocalizationPlanWizardVisibility.set(true);
  }

  onEdit(plan: IPlanRecord) {
    // Check if plan status allows editing (Draft or Pending)
    if (plan.status === EInvestorPlanStatus.DRAFT || plan.status === EInvestorPlanStatus.PENDING) {
      // Set mode to edit and plan ID
      this.planStore.setWizardMode('edit');
      this.planStore.setSelectedPlanId(plan.id);
      this.planStore.setPlanStatus(plan.status);

      plan.planType === EOpportunityType.PRODUCT
        ? this.productLocalizationPlanWizardVisibility.set(true)
        : this.serviceLocalizationPlanWizardVisibility.set(true);
    } else {
      this.i18nService.translate('plans.errors.cannotEdit');
      // Could show error message here
      console.warn('Plan cannot be edited. Status:', plan.status);
    }
  }

  onDownload(plan: IPlanRecord) {
    if (plan.planType === EOpportunityType.PRODUCT) {
      this.planStore
        .downloadPlan(plan.id)
        .pipe(take(1))
        .subscribe({
          error: (error) => {
            console.error('Error downloading plan:', error);
          },
        });
    } else if (plan.planType === EOpportunityType.SERVICES) {
      this.toastService.warn('Will be implemented soon');
    }
  }

  onViewTimeline(plan: IPlanRecord) {
    this.timelineVisibility.set(true);
    this.selectedPlan.set(plan);
  }

  onReview(plan: IPlanRecord) {
    console.log('Review Plan : ', plan);
  }

  applyFilter() {
    this.filterService.applyFilter();
  }

  onSubmitProductLocalizationPlanWizard() {
    console.log('Submit product localization plan wizard');
  }

  createNewPlan() {
    // Set mode to create and plan ID
    // Clear applied opportunity when creating from scratch
    this.planStore.resetAppliedOpportunity();
    this.planStore.setWizardMode('create');
    this.planStore.setSelectedPlanId(null);
    this.planTermsAndConditionsDialogVisibility.set(true);
  }

  resetPlanWizard() {
    this.planStore.resetWizardState();
  }

  onViewTotalPlans() {
    this.router.navigate([ERoutes.plans, ERoutes.investors], {
      queryParams: {},
    });
  }

  onViewPlansUnderReview() {
    this.router.navigate([ERoutes.plans, ERoutes.investors], {
      queryParams: { status: EInvestorPlanStatus.UNDER_REVIEW }
    });
  }

  onViewApprovedPlans() {
    this.router.navigate([ERoutes.plans, ERoutes.investors], {
      queryParams: { status: EInvestorPlanStatus.APPROVED }
    });
  }

  onViewRejectedPlans() {
    this.router.navigate([ERoutes.plans, ERoutes.investors], {
      queryParams: { status: EInvestorPlanStatus.REJECTED }
    });
  }
}
