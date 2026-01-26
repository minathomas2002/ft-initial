import { ChangeDetectionStrategy, Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { DataTableComponent } from 'src/app/shared/components/layout-components/data-table/data-table.component';
import { TableLayoutComponent } from 'src/app/shared/components/layout-components/table-layout/table-layout.component';
import { TableSkeletonComponent } from 'src/app/shared/components/skeletons/table-skeleton/table-skeleton.component';
import { EInvestorPlanStatus, EInternalUserPlanStatus, IPlanRecord, ITableHeaderItem, TPlansSortingKeys } from 'src/app/shared/interfaces';
import { TranslatePipe, SlaCountdownNounPipe } from 'src/app/shared/pipes';
import { I18nService } from 'src/app/shared/services/i18n';
import { InvestorPlansFilterService } from '../../services/investor-plans-filter-service/investor-plans-filter-service';
import { InternalUsersPlansFilterService } from '../../services/internal-users-plans-filter-service/internal-users-plans-filter-service';
import { EOpportunityType, ERoles } from 'src/app/shared/enums';
import { DatePipe, NgClass } from '@angular/common';
import { InvestorPlansFilter } from '../../components/investor-plans-filter/investor-plans-filter';
import { InternalUsersPlansFilter } from '../../components/internal-users-plans-filter/internal-users-plans-filter';
import { NewPlanDialog } from 'src/app/shared/components/plans/new-plan-dialog/new-plan-dialog';
import { PlanTermsAndConditionsDialog } from 'src/app/shared/components/plans/plan-terms-and-conditions-dialog/plan-terms-and-conditions-dialog';
import { ProductLocalizationPlanWizard } from 'src/app/shared/components/plans/plan-localization/product-localization-plan-wizard/product-localization-plan-wizard';
import { ServiceLocalizationPlanWizard } from 'src/app/shared/components/plans/service-localication/service-localization-plan-wizard/service-localization-plan-wizard';
import { TimelineDialog } from 'src/app/shared/components/timeline/timeline-dialog/timeline-dialog';
import { take } from 'rxjs';
import { ToasterService } from 'src/app/shared/services/toaster/toaster.service';
import { PlansActionMenu } from '../../components/plans-action-menu/plans-action-menu';
import { AbstractServiceFilter } from 'src/app/shared/classes/abstract-service-filter';
import { IPlanFilter } from 'src/app/shared/interfaces';
import { TruncateTooltipDirective } from 'src/app/shared/directives/truncate-tooltip.directive';
import { AssignReassignManualEmployee } from "../../components/assign-reassign-manual-employee/assign-reassign-manual-employee";
import { PlanDashboardBase } from 'src/app/shared/classes/plan-dashboard-base';
import { BaseTagComponent } from 'src/app/shared/components/base-components/base-tag/base-tag.component';

@Component({
  selector: 'app-plans-list',
  imports: [
    TableLayoutComponent,
    TableSkeletonComponent,
    DataTableComponent,
    InvestorPlansFilter,
    InternalUsersPlansFilter,
    PlansActionMenu,
    TranslatePipe,
    SlaCountdownNounPipe,
    DatePipe,
    NgClass,
    ButtonModule,
    SkeletonModule,
    PlanTermsAndConditionsDialog,
    ProductLocalizationPlanWizard,
    NewPlanDialog,
    ServiceLocalizationPlanWizard,
    TimelineDialog,
    TruncateTooltipDirective,
    AssignReassignManualEmployee,
    BaseTagComponent
  ],
  templateUrl: './plans-list.html',
  styleUrl: './plans-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlansList extends PlanDashboardBase implements OnInit {
  planTermsAndConditionsDialogVisibility = signal(false);
  newPlanDialogVisibility = signal(false);
  productLocalizationPlanWizardVisibility = signal(false);
  serviceLocalizationPlanWizardVisibility = signal(false);
  timelineVisibility = signal(false);
  selectedPlan = signal<IPlanRecord | null>(null);
  viewAssignDialog = signal<boolean>(false);
  isReassignMode = signal<boolean>(false);
  planItem = signal<IPlanRecord | null>(null);

  eInvestorPlanStatus = EInvestorPlanStatus;
  eInternalUserPlanStatus = EInternalUserPlanStatus;
  EInternalUserPlanStatus = EInternalUserPlanStatus;

  private readonly investorFilterService = inject(InvestorPlansFilterService);
  private readonly internalUsersFilterService = inject(InternalUsersPlansFilterService);
  private readonly i18nService = inject(I18nService);

  newPlanOpportunityType = computed(() => this.planStore.newPlanOpportunityType());
  private readonly toastService = inject(ToasterService);

  // Get the appropriate filter service based on role
  readonly filterService = computed<AbstractServiceFilter<IPlanFilter>>(() => {
    return this.isInvestor() ? this.investorFilterService : this.internalUsersFilterService;
  });

  readonly headers = computed<ITableHeaderItem<TPlansSortingKeys>[]>(() => {
    this.i18nService.currentLanguage();
    const baseHeaders: ITableHeaderItem<TPlansSortingKeys>[] = [
      { label: this.i18nService.translate('plans.table.planId'), isSortable: true, sortingKey: 'planCode' },
    ];

    if (this.isInternalUser()) {
      baseHeaders.push({
        label: this.i18nService.translate('plans.table.investorName'),
        isSortable: true,
        sortingKey: 'investorName'
      });
    }

    baseHeaders.push(
      { label: this.i18nService.translate('plans.table.planTitle'), isSortable: false, sortingKey: 'title' },
      { label: 'Opportunity Type', isSortable: false, sortingKey: 'title' },
      { label: this.i18nService.translate('plans.table.submissionDate'), isSortable: true, sortingKey: 'submissionDate' },
    );

    if (this.isInternalUser()) {
      baseHeaders.push({
        label: this.i18nService.translate('plans.table.assignee'),
        isSortable: false,
        sortingKey: 'title'
      });
    }

    baseHeaders.push(
      { label: this.i18nService.translate('plans.table.currentStatus'), isSortable: false, sortingKey: 'status' },
    );

    if (this.isInternalUser()) {
      baseHeaders.push({
        label: this.i18nService.translate('plans.table.slaCountdown'),
        isSortable: true,
        sortingKey: 'slaCountDown'
      });
    }

    baseHeaders.push(
      { label: this.i18nService.translate('plans.table.actions'), isSortable: false },
    );

    return baseHeaders;
  });

  readonly rows = computed<IPlanRecord[]>(() => this.planStore.list());
  readonly totalRecords = computed(() => this.planStore.count());
  readonly isLoading = computed(() => this.planStore.loading());

  constructor() {
    super();
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
    this.filterService().applyFilter();
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

  applyFilter() {
    this.filterService().applyFilter();
  }


  getPlanTypeLabel(planType: EOpportunityType): string {
    const planTypeOption = this.planStore.planTypeOptions().find(option => option.value === planType);
    return planTypeOption?.label ?? '';
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
    // Check if plan status allows editing
    const canEdit = this.isInvestor()
      ? (plan.status === EInvestorPlanStatus.DRAFT || plan.status === EInvestorPlanStatus.PENDING)
      : (plan.status === EInternalUserPlanStatus.PENDING);

    if (canEdit) {
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
    if (plan.planType === EOpportunityType.PRODUCT) {
      this.planStore.generateProductPlanPdf(plan.id).pipe(take(1)).subscribe({
        error: (error) => {
          this.toastService.error(error.errorMessage || 'Error generating product plan pdf');
        }
      });
    } else if (plan.planType === EOpportunityType.SERVICES) {
      this.planStore.generateServicePlanPdf(plan.id).pipe(take(1)).subscribe({
        error: (error) => {
          this.toastService.error(error.errorMessage || 'Error generating service plan pdf');
        }
      });
    }
  }

  onViewTimeline(plan: IPlanRecord) {
    this.timelineVisibility.set(true);
    this.selectedPlan.set(plan);
  }

  onReview(plan: IPlanRecord) {
    this.planStore.setWizardMode('Review');
    this.planStore.setSelectedPlanId(plan.id);
    this.planStore.setPlanStatus(plan.status);

    if (plan.planType === EOpportunityType.PRODUCT) {
      this.productLocalizationPlanWizardVisibility.set(true);
    } else if (plan.planType === EOpportunityType.SERVICES) {
      this.serviceLocalizationPlanWizardVisibility.set(true);
    }
  }

  onResubmitted(plan: IPlanRecord) {
    // Only investors can resubmit plans
    if (this.isInvestor()) {
      this.planStore.setWizardMode('resubmit');
      this.planStore.setSelectedPlanId(plan.id);
      this.planStore.setPlanStatus(plan.status);

      if (plan.planType === EOpportunityType.PRODUCT) {
        this.productLocalizationPlanWizardVisibility.set(true);
      } else if (plan.planType === EOpportunityType.SERVICES) {
        this.serviceLocalizationPlanWizardVisibility.set(true);
      }
    } else {
      console.warn('Only investors can resubmit plans.');
    }
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
