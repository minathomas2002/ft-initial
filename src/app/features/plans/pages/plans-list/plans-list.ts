import { ChangeDetectionStrategy, Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { DataTableComponent } from 'src/app/shared/components/layout-components/data-table/data-table.component';
import { TableLayoutComponent } from 'src/app/shared/components/layout-components/table-layout/table-layout.component';
import { TableSkeletonComponent } from 'src/app/shared/components/skeletons/table-skeleton/table-skeleton.component';
import { EInvestorPlanStatus, EInternalUserPlanStatus, IPlanRecord, ITableHeaderItem, TPlansSortingKeys } from 'src/app/shared/interfaces';
import { TranslatePipe, SlaCountdownNounPipe } from 'src/app/shared/pipes';
import { I18nService } from 'src/app/shared/services/i18n';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { InvestorPlansFilterService } from '../../services/investor-plans-filter-service/investor-plans-filter-service';
import { InternalUsersPlansFilterService } from '../../services/internal-users-plans-filter-service/internal-users-plans-filter-service';
import { EOpportunityType, ERoles, ERoutes } from 'src/app/shared/enums';
import { DatePipe, NgClass } from '@angular/common';
import { InvestorPlansFilter } from '../../components/investor-plans-filter/investor-plans-filter';
import { InternalUsersPlansFilter } from '../../components/internal-users-plans-filter/internal-users-plans-filter';
import { RoleService } from 'src/app/shared/services/role/role-service';
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
    AssignReassignManualEmployee
  ],
  templateUrl: './plans-list.html',
  styleUrl: './plans-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlansList implements OnInit {
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

  private readonly planStore = inject(PlanStore);
  private readonly investorFilterService = inject(InvestorPlansFilterService);
  private readonly internalUsersFilterService = inject(InternalUsersPlansFilterService);
  private readonly i18nService = inject(I18nService);
  private readonly roleService = inject(RoleService);

  newPlanOpportunityType = computed(() => this.planStore.newPlanOpportunityType());
  private readonly toastService = inject(ToasterService);

  // Determine if user is investor or internal user based on role
  readonly isInvestor = computed(() => this.roleService.hasAnyRoleSignal([ERoles.INVESTOR])());
  readonly isInternalUser = computed(() =>
    this.roleService.hasAnyRoleSignal([ERoles.Division_MANAGER, ERoles.DEPARTMENT_MANAGER, ERoles.EMPLOYEE, ERoles.ADMIN])()
  );

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
    // Only apply filter if no query params are present
    // If query params exist, the filter component will handle them via listenToQueryParamChanges()
    // const hasQueryParams = Object.keys(this.route.snapshot.queryParams).length > 0;
    // if (!hasQueryParams) {
    this.filterService().applyFilter();
    // }
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
    this.filterService().applyFilter();
  }


  getPlanTypeLabel(planType: EOpportunityType): string {
    const planTypeOption = this.planStore.planTypeOptions().find(option => option.value === planType);
    return planTypeOption?.label ?? '';
  }

  getStatusLabel(status: EInvestorPlanStatus | EInternalUserPlanStatus): string {
    if (this.isInvestor()) {
      const statusMap = {
        [EInvestorPlanStatus.SUBMITTED]: this.i18nService.translate('plans.status.submitted'),
        [EInvestorPlanStatus.PENDING]: this.i18nService.translate('plans.status.pendingWithInvestor'),
        [EInvestorPlanStatus.UNDER_REVIEW]: this.i18nService.translate('plans.status.underReview'),
        [EInvestorPlanStatus.APPROVED]: this.i18nService.translate('plans.status.approved'),
        [EInvestorPlanStatus.REJECTED]: this.i18nService.translate('plans.status.rejected'),
        [EInvestorPlanStatus.DRAFT]: this.i18nService.translate('plans.status.draft'),
      };
      return statusMap[status as EInvestorPlanStatus] || '';
    } else {
      const statusMap = {
        [EInternalUserPlanStatus.PENDING]: this.i18nService.translate('plans.employee_status.pendingWithInvestor'),
        [EInternalUserPlanStatus.UNDER_REVIEW]: this.i18nService.translate('plans.employee_status.underReview'),
        [EInternalUserPlanStatus.APPROVED]: this.i18nService.translate('plans.employee_status.approved'),
        [EInternalUserPlanStatus.REJECTED]: this.i18nService.translate('plans.employee_status.rejected'),
        [EInternalUserPlanStatus.UNASSIGNED]: this.i18nService.translate('plans.employee_status.unassigned'),
        [EInternalUserPlanStatus.ASSIGNED]: this.i18nService.translate('plans.employee_status.assigned'),
        [EInternalUserPlanStatus.DEPT_APPROVED]: this.i18nService.translate('plans.employee_status.deptApproved'),
        [EInternalUserPlanStatus.DEPT_REJECTED]: this.i18nService.translate('plans.employee_status.deptRejected'),
        [EInternalUserPlanStatus.DV_APPROVED]: this.i18nService.translate('plans.employee_status.dvApproved'),
        [EInternalUserPlanStatus.DV_REJECTED]: this.i18nService.translate('plans.employee_status.dvRejected'),
        [EInternalUserPlanStatus.DV_REJECTION_ACKNOWLEDGED]: this.i18nService.translate('plans.employee_status.dvRejectionAcknowledged'),
        [EInternalUserPlanStatus.EMPLOYEE_APPROVED]: this.i18nService.translate('plans.employee_status.employeeApproved'),
        [EInternalUserPlanStatus.EMPLOYEE_REJECTED]: this.i18nService.translate('plans.employee_status.employeeRejected'),
      };
      return statusMap[status as EInternalUserPlanStatus] || '';
    }
  }

  getAssigneeName(assignee: string): string {
    if (assignee && assignee.length > 0)
      return assignee;
    else
      return '-';
  }

  getStatusBadgeClass(status: EInvestorPlanStatus | EInternalUserPlanStatus): string {
    if (this.isInvestor()) {
      const classMap = {
        [EInvestorPlanStatus.SUBMITTED]: 'bg-primary-50 text-primary-700 border-primary-200',
        [EInvestorPlanStatus.PENDING]: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        [EInvestorPlanStatus.UNDER_REVIEW]: 'bg-blue-50 text-blue-700 border-blue-200',
        [EInvestorPlanStatus.APPROVED]: 'bg-green-50 text-green-700 border-green-200',
        [EInvestorPlanStatus.REJECTED]: 'bg-red-50 text-red-700 border-red-200',
        [EInvestorPlanStatus.DRAFT]: 'bg-gray-50 text-gray-700 border-gray-200',
      };
      return classMap[status as EInvestorPlanStatus] || 'bg-gray-50 text-gray-700 border-gray-200';
    } else {
      const classMap = {
        [EInternalUserPlanStatus.PENDING]: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        [EInternalUserPlanStatus.UNDER_REVIEW]: 'bg-blue-50 text-blue-700 border-blue-200',
        [EInternalUserPlanStatus.APPROVED]: 'bg-green-50 text-green-700 border-green-200',
        [EInternalUserPlanStatus.REJECTED]: 'bg-red-50 text-red-700 border-red-200',
        [EInternalUserPlanStatus.UNASSIGNED]: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        [EInternalUserPlanStatus.ASSIGNED]: 'bg-orange-50 text-orange-700 border-orange-200',
        [EInternalUserPlanStatus.DEPT_APPROVED]: 'bg-green-50 text-green-700 border-green-200',
        [EInternalUserPlanStatus.DEPT_REJECTED]: 'bg-red-50 text-red-700 border-red-200',
        [EInternalUserPlanStatus.DV_APPROVED]: 'bg-green-50 text-green-700 border-green-200',
        [EInternalUserPlanStatus.DV_REJECTED]: 'bg-red-50 text-red-700 border-red-200',
        [EInternalUserPlanStatus.DV_REJECTION_ACKNOWLEDGED]: 'bg-red-50 text-red-700 border-red-200',
        [EInternalUserPlanStatus.EMPLOYEE_APPROVED]: 'bg-primary-50 text-primary-700 border-primary-200',
        [EInternalUserPlanStatus.EMPLOYEE_REJECTED]: 'bg-red-50 text-red-700 border-red-200',
      };
      return classMap[status as EInternalUserPlanStatus] || 'bg-gray-50 text-gray-700 border-gray-200';
    }
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
      this.planStore.generateProductPlanPdf(plan.id).pipe(take(1)).subscribe();
    } else if (plan.planType === EOpportunityType.SERVICES) {
      this.planStore.generateServicePlanPdf(plan.id).pipe(take(1)).subscribe();
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
