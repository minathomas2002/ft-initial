import { DelegationFilterService } from './../../services/Delegation-filter/Delegation-filter-service';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { EmployeeList } from '../employee-list/employee-list';
import { RoleManagement } from '../role-management/role-management';
import { TranslatePipe } from 'src/app/shared/pipes';
import { ButtonModule } from 'primeng/button';
import { AddEditEmployeeDialog } from '../../components/add-edit-employee-dialog/add-edit-employee-dialog';
import { SystemEmployeesStore } from 'src/app/shared/stores/system-employees/system-employees.store';
import { RolesStore } from 'src/app/shared/stores/roles/roles.store';
import { EmployeesFilterService } from '../../services/empolyees-filter/employee-filter-service';
import { Delegation } from "../delegation/delegation";
import { AddEditDelegationDialog } from "../../components/add-edit-delegation-dialog/add-edit-delegation-dialog";
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-employees-view',
  imports: [TabsModule, EmployeeList, RoleManagement, TranslatePipe, ButtonModule, AddEditEmployeeDialog, Delegation, AddEditDelegationDialog],
  templateUrl: './employees-view.html',
  styleUrl: './employees-view.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeesView implements OnInit {
  usersStore = inject(SystemEmployeesStore);
  roleStore = inject(RolesStore);
  route = inject(ActivatedRoute);
  router = inject(Router);
  createEmpDialogVisible = signal<boolean>(false);
  AddEditDelegationDialogVisible = signal<boolean>(false);
  filterService = inject(EmployeesFilterService);
  delegationFilterService = inject(DelegationFilterService);
  activeTab = signal<string>('0');
  readonly allowedTabs = new Set(['0', '1', '2']);

  ngOnInit(): void {
    const tabFromQuery = this.route.snapshot.queryParamMap.get('tab');
    if (tabFromQuery && this.allowedTabs.has(tabFromQuery)) {
      this.activeTab.set(tabFromQuery);
    }
  }

  onTabChange(tab: string | number | undefined) {
    if (tab === undefined) return;

    const normalizedTab = String(tab);
    if (!this.allowedTabs.has(normalizedTab)) return;

    this.activeTab.set(normalizedTab);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: normalizedTab },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  onAddEmployee() {
    this.createEmpDialogVisible.set(true);
  }

  onAddEmployeeSuccess() {
    this.filterService.applyFilter()
  }

  onUpdateEmployees() {
    this.filterService.applyFilter()
  }

  onAddEditDelegation() {
    this.AddEditDelegationDialogVisible.set(true);
   }
   onAddDelegationSuccess() {
    this.delegationFilterService.applyFilter()
   }

}
