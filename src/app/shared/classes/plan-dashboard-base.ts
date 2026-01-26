import { computed, inject } from '@angular/core';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { RoleService } from 'src/app/shared/services/role/role-service';
import { HandlePlanStatusFactory } from 'src/app/shared/services/plan/planStatusFactory/handle-plan-status-factory';
import { EInvestorPlanStatus, EInternalUserPlanStatus, IPlanRecord, TColors } from 'src/app/shared/interfaces';
import { EOpportunityType, ERoles } from 'src/app/shared/enums';

/**
 * Map from TColors (from IPlanStatus.getStatusBadgeClass) to full Tailwind CSS class string.
 * Used for spans and other elements that need the full class string instead of BaseTag's [color].
 */
const BADGE_COLOR_TO_CSS: Record<TColors, string> = {
  primary: 'bg-primary-50 text-primary-700 border-primary-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  fadedBlue: 'border-slate-300 bg-slate-50 text-[#4767A5]',
  red: 'bg-red-50 text-red-700 border-red-200',
  green: 'bg-green-50 text-green-700 border-green-200',
  yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
  pink: 'bg-pink-50 text-pink-700 border-pink-200',
  gray: 'bg-gray-50 text-gray-700 border-gray-200',
  orange: 'bg-orange-50 text-orange-700 border-orange-200',
};

/**
 * Abstract base class for plan list and dashboard components.
 * Centralizes status label/badge logic via HandlePlanStatusFactory and shared helpers.
 */
export abstract class PlanDashboardBase {
  protected readonly planStore = inject(PlanStore);
  protected readonly planStatusFactory = inject(HandlePlanStatusFactory);
  protected readonly roleService = inject(RoleService);

  readonly isInvestor = computed(() => this.roleService.hasAnyRoleSignal([ERoles.INVESTOR])());
  readonly isInternalUser = computed(() =>
    this.roleService.hasAnyRoleSignal([ERoles.Division_MANAGER, ERoles.DEPARTMENT_MANAGER, ERoles.EMPLOYEE, ERoles.ADMIN])()
  );

  /**
   * Status label using HandlePlanStatusFactory. Use in templates instead of inline maps.
   */
  getStatusLabel(status: EInvestorPlanStatus | EInternalUserPlanStatus): string {
    const statusService = this.planStatusFactory.handleValidateStatus();
    return statusService.getStatusLabel(status as number);
  }

  /**
   * Full Tailwind CSS classes for status badge (e.g. for &lt;span&gt;).
   * Delegates to IPlanStatus.getStatusBadgeClass (TColors) and maps to CSS.
   */
  getStatusBadgeClass(status: EInvestorPlanStatus | EInternalUserPlanStatus): string {
    const statusService = this.planStatusFactory.handleValidateStatus();
    const color = statusService.getStatusBadgeClass(status as number);
    return BADGE_COLOR_TO_CSS[color] ?? BADGE_COLOR_TO_CSS.gray;
  }

  /**
   * TColors for BaseTag [color] input. Comes from IPlanStatus.getStatusBadgeClass.
   */
  getStatusBadgeColor(status: EInvestorPlanStatus | EInternalUserPlanStatus): TColors {
    const statusService = this.planStatusFactory.handleValidateStatus();
    return statusService.getStatusBadgeClass(status as number) as TColors;
  }

  /**
   * Unified status badge: { label, color, class }.
   * - label: for display and tooltips
   * - color: TColors for BaseTag [color]
   * - class: full CSS for &lt;span&gt; (investor in user-dashboard)
   */
  getStatusBadge(status: EInvestorPlanStatus | EInternalUserPlanStatus): {
    label: string;
    color: TColors;
    class: string;
  } {
    return {
      label: this.getStatusLabel(status),
      color: this.getStatusBadgeColor(status),
      class: this.getStatusBadgeClass(status),
    };
  }

  getAssigneeName(assignee: string): string {
    return assignee?.length ? assignee : '-';
  }

  resetPlanWizard(): void {
    this.planStore.resetWizardState();
  }
}
