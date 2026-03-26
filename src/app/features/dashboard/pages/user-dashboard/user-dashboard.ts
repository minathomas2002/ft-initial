import { ChangeDetectionStrategy, Component, computed, DestroyRef, effect, inject, OnInit, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { take } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { TableLayoutComponent } from 'src/app/shared/components/layout-components/table-layout/table-layout.component';
import { MenuModule } from 'primeng/menu';
import { TableSkeletonComponent } from 'src/app/shared/components/skeletons/table-skeleton/table-skeleton.component';
import { DataTableComponent } from 'src/app/shared/components/layout-components/data-table/data-table.component';
import { SkeletonModule } from 'primeng/skeleton';
import { EInternalUserPlanStatus, EInvestorPlanStatus, IPlanRecord, ITableHeaderItem, TPlansSortingKeys } from 'src/app/shared/interfaces';
import { EOpportunityType, ERoles, ERoutes } from 'src/app/shared/enums';
import { DashboardPlansStore } from 'src/app/shared/stores/dashboard-plans/dashboard-plans.store';
import { InternalUsersDashboardPlansFilter } from '../../components/internal-users-dashboard-plans-filter/internal-users-dashboard-plans-filter';
import { InvestorDashboardPlansFilter } from '../../components/investor-dashboard-plans-filter/investor-dashboard-plans-filter';
import { DashboardStatisticsSkeleton } from '../../components/dashboard-statistics-skeleton/dashboard-statistics-skeleton';
import { DashboardStatisticsCards } from '../../components/dashboard-statistics-cards/dashboard-statistics-cards';
import { I18nService } from 'src/app/shared/services/i18n/i18n.service';
import { LocalizedDatePipe, TranslatePipe, SlaCountdownNounPipe } from 'src/app/shared/pipes';
import { AssignReassignManualEmployee } from 'src/app/features/plans/components/assign-reassign-manual-employee/assign-reassign-manual-employee';
import { ProductLocalizationPlanWizard } from 'src/app/shared/components/plans/plan-localization/product-localization-plan-wizard/product-localization-plan-wizard';
import { ServiceLocalizationPlanWizard } from 'src/app/shared/components/plans/service-localication/service-localization-plan-wizard/service-localization-plan-wizard';
import { TimelineDialog } from "src/app/shared/components/timeline/timeline-dialog/timeline-dialog";
import { BaseTagComponent } from "src/app/shared/components/base-components/base-tag/base-tag.component";
import { InternalUsersDashboardPlansFilterService } from '../../services/internal-users-dashboard-plans-filter/internal-users-dashboard-plans-filter-service';
import { DashboardPlansFilterService } from '../../services/dashboard-plans-filter/dashboard-plans-filter-service';
import { DashboardPlanActionMenu } from '../../components/dashboard-plan-action-menu/dashboard-plan-action-menu';
import { ToasterService } from 'src/app/shared/services/toaster/toaster.service';
import { NewPlanDialog } from 'src/app/shared/components/plans/new-plan-dialog/new-plan-dialog';
import { PlanTermsAndConditionsDialog } from 'src/app/shared/components/plans/plan-terms-and-conditions-dialog/plan-terms-and-conditions-dialog';
import { TruncateTooltipDirective } from 'src/app/shared/directives/truncate-tooltip.directive';
import { PlanDashboardBase } from 'src/app/shared/classes/plan-dashboard-base';
import { AuthStore } from 'src/app/shared/stores/auth/auth.store';
import { GeneralConfirmationDialogComponent } from 'src/app/shared/components/utility-components/general-confirmation-dialog/general-confirmation-dialog.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-user-dashboard',
  imports: [
    TableLayoutComponent,
    TableSkeletonComponent,
    DataTableComponent,
    ButtonModule,
    MenuModule,
    SkeletonModule,
    InternalUsersDashboardPlansFilter,
    InvestorDashboardPlansFilter,
    DashboardPlanActionMenu,
    DashboardStatisticsSkeleton,
    DashboardStatisticsCards,
    LocalizedDatePipe,
    NgClass,
    TranslatePipe,
    SlaCountdownNounPipe,
    AssignReassignManualEmployee,
    ProductLocalizationPlanWizard,
    ServiceLocalizationPlanWizard,
    TimelineDialog,
    BaseTagComponent,
    NewPlanDialog,
    PlanTermsAndConditionsDialog,
    TruncateTooltipDirective,
    GeneralConfirmationDialogComponent
  ],
  templateUrl: './user-dashboard.html',
  styleUrl: './user-dashboard.scss',
  providers: [InternalUsersDashboardPlansFilterService, DashboardPlansFilterService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDashboard extends PlanDashboardBase implements OnInit {
  //#region Visibility signals
  planTermsAndConditionsDialogVisibility = signal(false);
  newPlanDialogVisibility = signal(false);
  productLocalizationPlanWizardVisibility = signal(false);
  serviceLocalizationPlanWizardVisibility = signal(false);
  timelineVisibility = signal(false);
  viewAssignDialog = signal<boolean>(false);
  viewDeleteDialog = signal<boolean>(false);
  isReassignMode = signal<boolean>(false);
  isDeleteMode = signal<boolean>(false);
  planItem = signal<IPlanRecord | null>(null);
  selectedPlan = signal<IPlanRecord | null>(null);
  hasOpenedWizardFromQueryParams = false;

  //#endregion

  //#region Enums
  EInternalUserPlanStatus = EInternalUserPlanStatus;
  EInvestorPlanStatus = EInvestorPlanStatus;
  //#endregion

  //#region Services
  private readonly dashboardPlansStore = inject(DashboardPlansStore);
  private readonly i18nService = inject(I18nService);
  private readonly toasterService = inject(ToasterService);
  private readonly router = inject(Router);
  private readonly authStore = inject(AuthStore);

  private readonly internalUsersFilterService = inject(InternalUsersDashboardPlansFilterService);
  private readonly investorFilterService = inject(DashboardPlansFilterService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);


  //#endregion

  //#region Computed signals for role detection (isInternalUser excludes ADMIN for dashboard)
  override readonly isInternalUser = computed(() =>
    this.roleService.hasAnyRoleSignal([ERoles.Division_MANAGER, ERoles.DEPARTMENT_MANAGER, ERoles.EMPLOYEE])()
  );
  readonly isManager = computed(() =>
    this.roleService.hasAnyRoleSignal([ERoles.Division_MANAGER, ERoles.DEPARTMENT_MANAGER])()
  );
  //#endregion

  //#region Get the appropriate filter service based on role
  readonly filterService = computed(() => {
    return this.isInvestor() ? this.investorFilterService : this.internalUsersFilterService;
  });
  //#endregion

  newPlanOpportunityType = computed(() => this.planStore.newPlanOpportunityType());

  //#region Table headers - different for investor vs internal users
  readonly headers = computed<ITableHeaderItem<TPlansSortingKeys>[]>(() => {
    this.i18nService.currentLanguage();
    const baseHeaders: ITableHeaderItem<TPlansSortingKeys>[] = [
      { label: this.i18nService.translate('plans.table.planId'), isSortable: true, sortingKey: 'planCode' },
    ];

    if (this.isInternalUser()) {
      baseHeaders.push({ label: this.i18nService.translate('plans.table.investorName'), isSortable: true, sortingKey: 'investorName' });
    }

    baseHeaders.push(
      { label: this.i18nService.translate('plans.table.planTitle'), isSortable: false, sortingKey: 'title' },
      { label: this.i18nService.translate('plans.table.opportunityType'), isSortable: false, sortingKey: 'planType' },
      { label: this.i18nService.translate('plans.table.submissionDate'), isSortable: true, sortingKey: 'submissionDate' }
    );

    if (this.isManager()) {
      baseHeaders.push({
        label: this.i18nService.translate('plans.table.assignee'),
        isSortable: false,
        sortingKey: 'assignee'
      });
    }

    baseHeaders.push(
      { label: this.i18nService.translate('plans.table.slaCountdown'), isSortable: true, sortingKey: 'slaCountDown' },
      { label: this.i18nService.translate('plans.table.currentStatus'), isSortable: false, sortingKey: 'status' },
      { label: this.i18nService.translate('plans.table.actions'), isSortable: false });

    return baseHeaders;
  });
  //#endregion

  //#region Table properties
  readonly rows = computed<IPlanRecord[]>(() => this.dashboardPlansStore.list());
  readonly totalRecords = computed(() => this.dashboardPlansStore.count());
  readonly isLoading = computed(() => this.dashboardPlansStore.loading());
  readonly statistics = computed(() => this.dashboardPlansStore.statistics());
  readonly isStatisticsLoading = computed(() => this.dashboardPlansStore.loading() || this.statistics() === null);
  //#endregion

  //#region Dashboard subtitle based on role
  readonly dashboardSubtitle = computed(() => {
    if (this.isInvestor())
      return 'dashboard.subtitleInvestor';
    else
      return 'dashboard.subtitleInternalUser';
  });
  //#endregion

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
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
        this.handleOpenWizardFromQueryParams(params);
      })
  }

  //#region Plan type label
  getPlanTypeLabel(planType: EOpportunityType): string {
    if (this.isInvestor()) {
      const planTypeOption = this.planStore.planTypeOptions().find(option => option.value === planType);
      return planTypeOption?.label ?? '';
    }

    if (planType === EOpportunityType.SERVICES)
      return this.i18nService.translate('opportunity.type.service');
    if (planType === EOpportunityType.PRODUCT)
      return this.i18nService.translate('opportunity.type.product');

    return '';
  }

  getPlanDetailsUrl(plan: IPlanRecord): string {
    return this.router.serializeUrl(
      this.router.createUrlTree([ERoutes.dashboard], {
        queryParams: {
          wizardMode: 'view',
          wizardPlanId: plan.id,
          wizardPlanType: plan.planType,
          wizardPlanStatus: plan.status,
        },
      })
    );
  }

  private handleOpenWizardFromQueryParams(params: Record<string, unknown>) {
    if (this.hasOpenedWizardFromQueryParams) return;

    const wizardMode = params['wizardMode'];
    const wizardPlanId = params['wizardPlanId'];
    const wizardPlanType = Number(params['wizardPlanType']);
    const wizardPlanStatus = params['wizardPlanStatus'];

    if (wizardMode !== 'view' || typeof wizardPlanId !== 'string' || !wizardPlanId) return;

    const isProductPlan = wizardPlanType === EOpportunityType.PRODUCT;
    const isServicePlan = wizardPlanType === EOpportunityType.SERVICES;

    if (!isProductPlan && !isServicePlan) return;
    setTimeout(() => {
      this.onViewDetails({ id: wizardPlanId, status: Number(wizardPlanStatus), planType: wizardPlanType });
    }, 600);
  }

  //#region Actions
  onViewDetails(plan: { id: string; status: number; planType: EOpportunityType }) {
    this.planStore.setWizardMode('view');
    this.planStore.setSelectedPlanId(plan.id);
    this.planStore.setPlanStatus(plan.status);

    if (plan.planType === EOpportunityType.PRODUCT) {
      this.productLocalizationPlanWizardVisibility.set(true);
    } else if (plan.planType === EOpportunityType.SERVICES) {
      this.serviceLocalizationPlanWizardVisibility.set(true);
    }
  }

  onViewOpportunityDetails(plan: IPlanRecord) {
    if (plan?.linkedToDeletedOpportunity) {
      this.toasterService.error(this.i18nService.translate('common.opportunityNoLongerAvailable'));
      return;
    }

    const url = `/opportunities/${plan.opportunityId}`;
    window.open(url, '_blank');
  }

  onEdit(plan: IPlanRecord) {
    // Only investors can edit (Draft or Pending status)
    if (this.isInvestor() && (plan.status === EInvestorPlanStatus.DRAFT || plan.status === EInvestorPlanStatus.PENDING)) {
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
          this.toasterService.error(error.errorMessage || this.i18nService.translate('dashboard.errors.productPdfError'));
        }
      });
    } else if (plan.planType === EOpportunityType.SERVICES) {
      this.planStore.generateServicePlanPdf(plan.id).pipe(take(1)).subscribe({
        error: (error) => {
          this.toasterService.error(error.errorMessage || this.i18nService.translate('dashboard.errors.servicePdfError'));
        }
      });
    }
  }

  onViewTimeline(plan: IPlanRecord) {
    this.timelineVisibility.set(true);
    this.planItem.set(plan);
    this.selectedPlan.set(plan);
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
    this.planStore.setWizardMode('resubmit');
    this.planStore.setSelectedPlanId(plan.id);
    this.planStore.setPlanStatus(plan.status);
    if (plan.planType === EOpportunityType.PRODUCT) {
      this.productLocalizationPlanWizardVisibility.set(true);
    } else if (plan.planType === EOpportunityType.SERVICES) {
      this.serviceLocalizationPlanWizardVisibility.set(true);
    }
  }
  //#endregion


  applyFilter() {
    this.filterService().applyFilter();
  }

  //#region Create new plan flow (investor only)
  createNewPlan() {
    this.planStore.resetAppliedOpportunity();
    this.planStore.setWizardMode('create');
    this.planStore.setSelectedPlanId(null);
    this.planTermsAndConditionsDialogVisibility.set(true);
  }

  onUserReadAndApproved() {
    this.planTermsAndConditionsDialogVisibility.set(false);
    this.planStore.resetNewPlanOpportunityType();
    if (this.isInvestor()) {
      this.newPlanDialogVisibility.set(true);
    }
  }

  onUserConfirmNewPlanDialog() {
    this.planStore.getActiveOpportunityLookUps().pipe(take(1)).subscribe();
    this.newPlanDialogVisibility.set(false);

    if (!this.newPlanOpportunityType()) return;

    this.planStore.resetAppliedOpportunity();
    this.planStore.setWizardMode('create');
    this.planStore.setSelectedPlanId(null);

    this.newPlanOpportunityType() === EOpportunityType.PRODUCT
      ? this.productLocalizationPlanWizardVisibility.set(true)
      : this.serviceLocalizationPlanWizardVisibility.set(true);
  }
  //#endregion

  onSubmitProductLocalizationPlanWizard() {
    console.log('Submit product localization plan wizard');
  }

  //#region Navigation methods for statistics cards - different for investor vs internal users
  onViewTotalPlans() {
    this.router.navigate([ERoutes.plans], {
      queryParams: {},
    });
  }

  onViewUnassignedPlans() {
    this.router.navigate([ERoutes.plans], {
      queryParams: { status: EInternalUserPlanStatus.UNASSIGNED }
    });
  }

  onViewPlansUnderReview() {
    this.router.navigate([ERoutes.plans], {
      queryParams: {
        status: this.isInvestor() ? [EInvestorPlanStatus.UNDER_REVIEW, EInvestorPlanStatus.PENDING] :
          [EInternalUserPlanStatus.UNDER_REVIEW,
          EInternalUserPlanStatus.EMPLOYEE_APPROVED,
          EInternalUserPlanStatus.ReturnedByDV,
          EInternalUserPlanStatus.ReturnedByDEPTManager,
          EInternalUserPlanStatus.DV_REJECTED,
          EInternalUserPlanStatus.DV_REJECTION_ACKNOWLEDGED,
          EInternalUserPlanStatus.DV_APPROVED,
          EInternalUserPlanStatus.DEPT_APPROVED,
          EInternalUserPlanStatus.DEPT_REJECTED,
          EInternalUserPlanStatus.PENDING]
      }
    });
  }

  onViewApprovedPlans() {
    this.router.navigate([ERoutes.plans], {
      queryParams: {
        status: this.isInvestor() ? EInvestorPlanStatus.APPROVED :
          (this.isManager()) ? EInternalUserPlanStatus.APPROVED : [EInternalUserPlanStatus.APPROVED, EInternalUserPlanStatus.DEPT_APPROVED],
      }
    });
  }

  onViewApprovedPlansInInternalUser() {
    const currentUserId = this.authStore.jwtUserDetails()?.EmpID;
    this.router.navigate([ERoutes.plans], {
      queryParams: {
        status: [EInternalUserPlanStatus.APPROVED, EInternalUserPlanStatus.DEPT_APPROVED],
        assignee: this.isManager() ? null : currentUserId
      }
    });
  }

  onViewTotalApprovedPlansInInternalUser() {
    this.router.navigate([ERoutes.plans], {
      queryParams: { status: EInternalUserPlanStatus.APPROVED }
    });
  }

  onViewRejectedPlans() {
    this.router.navigate([ERoutes.plans], {
      queryParams: {
        status: this.isInvestor() ? EInvestorPlanStatus.REJECTED :

          [EInternalUserPlanStatus.REJECTED,
          EInternalUserPlanStatus.DEPT_REJECTED,
          EInternalUserPlanStatus.DV_REJECTION_ACKNOWLEDGED,
          EInternalUserPlanStatus.DV_REJECTED
          ]
      }
    });
  }

  onViewPendingAssignedPlans() {
    this.router.navigate([ERoutes.plans], {
      queryParams: {
        status: [EInternalUserPlanStatus.UNDER_REVIEW,
        EInternalUserPlanStatus.ReturnedByDV, EInternalUserPlanStatus.DEPT_APPROVED,
        EInternalUserPlanStatus.DV_REJECTED, EInternalUserPlanStatus.DV_REJECTION_ACKNOWLEDGED],
      }


    });
  }

  onViewAssignedPlans() {
    const currentUserId = this.authStore.jwtUserDetails()?.EmpID;
    this.router.navigate([ERoutes.plans], {
      queryParams: { assignee: currentUserId }
    });
  }

  onDelete(plan: IPlanRecord) {
    this.viewDeleteDialog.set(true);
    this.planItem.set(plan);
    this.isDeleteMode.set(true);
  }

  onCancelDeletePlan() {
    this.viewDeleteDialog.set(false);
    this.planItem.set(null);
    this.isDeleteMode.set(false);
  }

  onConfirmDeletePlan() {
    if (!this.planItem()) return;

    this.planStore.deleteDraftPlan(this.planItem()!.id).pipe(take(1)).subscribe({
      next: () => {
        this.toasterService.success(this.i18nService.translate('dashboard.messages.planRemoved'));
        this.applyFilter();
        this.viewDeleteDialog.set(false);
        this.planItem.set(null);
        this.isDeleteMode.set(false);
      },
      error: (error) => {
        this.toasterService.error(error.errorMessage || this.i18nService.translate('dashboard.errors.deletePlanError'));
        this.viewDeleteDialog.set(false);
        this.planItem.set(null);
        this.isDeleteMode.set(false);
      },
    });
  }
  //#endregion
}
