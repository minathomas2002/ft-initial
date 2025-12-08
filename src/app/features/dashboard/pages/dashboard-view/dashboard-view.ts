import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ERoutes } from 'src/app/shared/enums';
import { ERoles } from 'src/app/shared/enums/roles.enum';
import { RoleService } from 'src/app/shared/services/role/role-service';

@Component({
  selector: 'app-dashboard-view',
  imports: [],
  templateUrl: './dashboard-view.html',
  styleUrl: './dashboard-view.scss',
  providers: []
})
export class DashboardView implements OnInit {

  private readonly roleService = inject(RoleService);
  router = inject(Router);

  ngOnInit(): void {
    if (this.roleService.hasAnyRoleSignal([ERoles.ADMIN])()) {
      this.router.navigate([ERoutes.opportunities, ERoutes.admin]);
    } else if (this.roleService.hasAnyRoleSignal([ERoles.INVESTOR])()) {
      this.router.navigate([ERoutes.dashboard, ERoutes.investors]);
    }
  }
}
