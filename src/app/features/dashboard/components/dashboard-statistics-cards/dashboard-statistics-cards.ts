import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { TranslatePipe } from 'src/app/shared/pipes';
import { IPlansDashboardStatistics } from 'src/app/shared/interfaces';
import { ERoles } from 'src/app/shared/enums';
import { RoleService } from 'src/app/shared/services/role/role-service';

/**
 * Interface for statistics card configuration
 */
interface IStatisticsCard {
  titleKey: string;
  valueKey: keyof IPlansDashboardStatistics;
  outputEvent: () => void;
}

@Component({
  selector: 'app-dashboard-statistics-cards',
  imports: [TranslatePipe],
  templateUrl: './dashboard-statistics-cards.html',
  styleUrl: './dashboard-statistics-cards.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardStatisticsCards {
  statistics = input.required<IPlansDashboardStatistics | null>();
  private readonly roleService = inject(RoleService);

  // Output events for navigation
  readonly onViewTotalPlans = output<void>();
  readonly onViewUnassignedPlans = output<void>();
  readonly onViewPlansUnderReview = output<void>();
  readonly onViewApprovedPlans = output<void>();
  readonly onViewRejectedPlans = output<void>();
  readonly onViewPendingAssignedPlans = output<void>();
  readonly onViewAssignedPlans = output<void>();

  /**
   * Computed signal to determine if user is an Employee
   * Employees see different statistics cards than managers
   */
  readonly isEmployee = computed(() =>
    this.roleService.hasAnyRoleSignal([ERoles.EMPLOYEE])()
  );

  /**
   * Computed signal to determine if user is an Investor
   * Investors see different statistics cards
   */
  readonly isInvestor = computed(() =>
    this.roleService.hasAnyRoleSignal([ERoles.INVESTOR])()
  );

  /**
   * Computed signal for investor cards configuration
   */
  readonly investorCards = computed<IStatisticsCard[]>(() => [
    {
      titleKey: 'plans.statistics.totalPlans',
      valueKey: 'totalPlans',
      outputEvent: () => this.onViewTotalPlans.emit()
    },
    {
      titleKey: 'plans.statistics.plansUnderReview',
      valueKey: 'plansUnderReview',
      outputEvent: () => this.onViewPlansUnderReview.emit()
    },
    {
      titleKey: 'plans.statistics.approvedPlans',
      valueKey: 'approvedPlans',
      outputEvent: () => this.onViewApprovedPlans.emit()
    },
    {
      titleKey: 'plans.statistics.rejectedPlans',
      valueKey: 'rejectedPlans',
      outputEvent: () => this.onViewRejectedPlans.emit()
    }
  ]);

  /**
   * Computed signal for employee cards configuration
   */
  readonly employeeCards = computed<IStatisticsCard[]>(() => [
    {
      titleKey: 'Total Approved Plans',
      valueKey: 'totalPlans',
      outputEvent: () => this.onViewApprovedPlans.emit()
    },
    {
      titleKey: 'plans.statistics.assignedPending',
      valueKey: 'pendingAssignedPlans',
      outputEvent: () => this.onViewPendingAssignedPlans.emit()
    },
    {
      titleKey: 'plans.statistics.assignedPlans',
      valueKey: 'plansUnderReview',
      outputEvent: () => this.onViewAssignedPlans.emit()
    },
    {
      titleKey: 'plans.statistics.assignedApprovedPlans',
      valueKey: 'approvedPlans',
      outputEvent: () => this.onViewApprovedPlans.emit()
    },
    {
      titleKey: 'plans.statistics.assignedRejected',
      valueKey: 'rejectedPlans',
      outputEvent: () => this.onViewRejectedPlans.emit()
    }
  ]);

  /**
   * Computed signal for manager cards configuration (DV Manager & Department Manager)
   */
  readonly managerCards = computed<IStatisticsCard[]>(() => [
    {
      titleKey: 'plans.statistics.totalPlans',
      valueKey: 'totalPlans',
      outputEvent: () => this.onViewTotalPlans.emit()
    },
    {
      titleKey: 'plans.statistics.unAssignedPlans',
      valueKey: 'unAssignedPlans',
      outputEvent: () => this.onViewUnassignedPlans.emit()
    },
    {
      titleKey: 'plans.statistics.plansUnderReview',
      valueKey: 'plansUnderReview',
      outputEvent: () => this.onViewPlansUnderReview.emit()
    },
    {
      titleKey: 'plans.statistics.approvedPlans',
      valueKey: 'approvedPlans',
      outputEvent: () => this.onViewApprovedPlans.emit()
    },
    {
      titleKey: 'plans.statistics.rejectedPlans',
      valueKey: 'rejectedPlans',
      outputEvent: () => this.onViewRejectedPlans.emit()
    }
  ]);

  /**
   * Computed signal to get the active cards based on user role
   */
  readonly activeCards = computed<IStatisticsCard[]>(() => {
    if (this.isInvestor())
      return this.investorCards();
    if (this.isEmployee())
      return this.employeeCards();

    return this.managerCards();
  });

  /**
   * Get the value for a card based on the value key
   */
  getCardValue(valueKey: keyof IPlansDashboardStatistics): number {
    return this.statistics()?.[valueKey] ?? 0;
  }

  /**
   * Handle card click event
   */
  onCardClick(card: IStatisticsCard): void {
    card.outputEvent();
  }
}
