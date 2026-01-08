import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ERoutes } from 'src/app/shared/enums';
import { ERoles } from 'src/app/shared/enums/roles.enum';
import { RoleService } from 'src/app/shared/services/role/role-service';

@Component({
  selector: 'app-dashboard-view',
  imports: [],
  templateUrl: './dashboard-view.html',
  styleUrl: './dashboard-view.scss',
  providers: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardView implements OnInit {

  private readonly roleService = inject(RoleService);
  router = inject(Router);
  showDashboard = signal(false);
  ngOnInit(): void {
    if (this.roleService.hasAnyRoleSignal([ERoles.ADMIN])()) {
      this.router.navigate([ERoutes.opportunities, ERoutes.admin]);
    } else if (this.roleService.hasAnyRoleSignal([ERoles.INVESTOR])()) {
      this.router.navigate([ERoutes.dashboard, ERoutes.investors]);
    } else if (this.roleService.hasAnyRoleSignal([ERoles.Division_MANAGER, ERoles.DEPARTMENT_MANAGER, ERoles.EMPLOYEE])()) {
      this.showDashboard.set(true);
    } else {
      this.router.navigate([ERoutes.dashboard, ERoutes.dvManager]);
    }
  }
}
