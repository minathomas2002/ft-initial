import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { TranslatePipe } from 'src/app/shared/pipes';
import { IPlansDashboardStatistics } from 'src/app/shared/interfaces';
import { ERoles } from 'src/app/shared/enums';
import { RoleService } from 'src/app/shared/services/role/role-service';

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
  onViewTotalPlans = output<void>();
  onViewUnassignedPlans = output<void>();
  onViewPlansUnderReview = output<void>();
  onViewApprovedPlans = output<void>();
  onViewRejectedPlans = output<void>();
  onViewPendingAssignedPlans = output<void>();
  onViewAssignedPlans = output<void>();

  /**
   * Computed signal to determine if user is an Employee
   * Employees see different statistics cards than managers
   */
  readonly isEmployee = computed(() => {
    return this.roleService.hasAnyRoleSignal([ERoles.EMPLOYEE])();
  });
}
