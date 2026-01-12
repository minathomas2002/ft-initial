import { ChangeDetectionStrategy, Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { DataTableComponent } from 'src/app/shared/components/layout-components/data-table/data-table.component';
import { TableLayoutComponent } from 'src/app/shared/components/layout-components/table-layout/table-layout.component';
import { TableSkeletonComponent } from 'src/app/shared/components/skeletons/table-skeleton/table-skeleton.component';
import { EInvestorPlanStatus, IPlanRecord, ITableHeaderItem, TPlansSortingKeys } from 'src/app/shared/interfaces';
import { TranslatePipe } from 'src/app/shared/pipes';
import { I18nService } from 'src/app/shared/services/i18n';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { InvestorPlansFilterService } from '../../services/investor-plans-filter-service/investor-plans-filter-service';
import { EOpportunityType } from 'src/app/shared/enums';
import { DatePipe } from '@angular/common';
import { InvestorPlansActionMenu } from '../../components/investor-plans-action-menu/investor-plans-action-menu';
import { InvestorPlansFilter } from '../../components/investor-plans-filter/investor-plans-filter';
import { NewPlanDialog } from 'src/app/shared/components/plans/new-plan-dialog/new-plan-dialog';
import { PlanTermsAndConditionsDialog } from 'src/app/shared/components/plans/plan-terms-and-conditions-dialog/plan-terms-and-conditions-dialog';
import { ProductLocalizationPlanWizard } from 'src/app/shared/components/plans/plan-localization/product-localization-plan-wizard/product-localization-plan-wizard';
import { ServiceLocalizationPlanWizard } from 'src/app/shared/components/plans/service-localication/service-localization-plan-wizard/service-localization-plan-wizard';
import { TimelineDialog } from 'src/app/shared/components/timeline/timeline-dialog/timeline-dialog';
import { take } from 'rxjs';

@Component({
  selector: 'app-investor-plans',
  imports: [
    TableLayoutComponent,
    TableSkeletonComponent,
    DataTableComponent,
    InvestorPlansFilter,
    InvestorPlansActionMenu,
    TranslatePipe,
    DatePipe,
    ButtonModule,
    SkeletonModule,
    ProductLocalizationPlanWizard,
    ServiceLocalizationPlanWizard,
    TimelineDialog
  ],
  templateUrl: './investor-plans.html',
  styleUrl: './investor-plans.scss',
  providers: [InvestorPlansFilterService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvestorPlans implements OnInit {
  eInvestorPlanStatus = EInvestorPlanStatus;

  planTermsAndConditionsDialogVisibility = signal(false);
  newPlanDialogVisibility = signal(false);
  productLocalizationPlanWizardVisibility = signal(false);
  serviceLocalizationPlanWizardVisibility = signal(false);
  timelineVisibility = signal(false);
  selectedPlan = signal<IPlanRecord | null>(null);

  private readonly planStore = inject(PlanStore);
  readonly filterService = inject(InvestorPlansFilterService);
  private readonly i18nService = inject(I18nService);

  newPlanOpportunityType = computed(() => this.planStore.newPlanOpportunityType());

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

  readonly headers = computed<ITableHeaderItem<TPlansSortingKeys>[]>(() => {
    this.i18nService.currentLanguage();
    return [
      { label: this.i18nService.translate('plans.table.planId'), isSortable: true, sortingKey: 'planCode' },
      { label: this.i18nService.translate('plans.table.planTitle'), isSortable: false, sortingKey: 'title' },
      { label: this.i18nService.translate('plans.table.opportunityType'), isSortable: false, sortingKey: 'title' },
      { label: this.i18nService.translate('plans.table.submissionDate'), isSortable: true, sortingKey: 'submissionDate' },
      { label: this.i18nService.translate('plans.table.currentStatus'), isSortable: false, sortingKey: 'status' },
      { label: this.i18nService.translate('plans.table.actions'), isSortable: false },
    ];
  });

  readonly rows = computed<IPlanRecord[]>(() => this.planStore.list());
  readonly totalRecords = computed(() => this.planStore.count());
  readonly isLoading = computed(() => this.planStore.loading());

  ngOnInit(): void {
    this.filterService.applyFilter();
  }

  createNewPlan() {
    // Set mode to create and plan ID
    // Clear applied opportunity when creating from scratch
    this.planStore.resetAppliedOpportunity();
    this.planStore.setWizardMode('create');
    this.planStore.setSelectedPlanId(null);
    this.planTermsAndConditionsDialogVisibility.set(true);
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
  }

  resetPlanWizard() {
    this.planStore.resetWizardState();
  }

  applyFilter() {
    this.filterService.applyFilter();
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
      console.warn('Plan cannot be edited. Status:', plan.status);
    }
  }

  onDownload(plan: IPlanRecord) {
    this.planStore
      .downloadPlan(plan.id)
      .pipe(take(1))
      .subscribe({
        error: (error) => {
          console.error('Error downloading plan:', error);
        },
      });
  }

  onViewTimeline(plan: IPlanRecord) {
    this.timelineVisibility.set(true);
    this.selectedPlan.set(plan);
  }
}
