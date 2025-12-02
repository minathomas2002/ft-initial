import { Component, inject, signal } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { EmployeeList } from '../employee-list/employee-list';
import { RoleManagement } from '../role-management/role-management';
import { TranslatePipe } from 'src/app/shared/pipes';
import { ButtonModule } from 'primeng/button';
import { AddEditEmployeeDialog } from '../../components/add-edit-employee-dialog/add-edit-employee-dialog';
import { SystemEmployeesStore } from 'src/app/shared/stores/system-employees/system-employees.store';
import { RolesStore } from 'src/app/shared/stores/roles/roles.store';
import { EmployeesFilterService } from '../../services/empolyees-filter/employee-filter-service';

@Component({
  selector: 'app-employees-view',
  imports: [TabsModule, EmployeeList, RoleManagement, TranslatePipe, ButtonModule, AddEditEmployeeDialog],
  templateUrl: './employees-view.html',
  styleUrl: './employees-view.scss',
})
export class EmployeesView {
  usersStore = inject(SystemEmployeesStore);
  roleStore = inject(RolesStore);
  createEmpDialogVisible = signal<boolean>(false);
  filterService = inject(EmployeesFilterService);

  onAddEmployee() {
    this.createEmpDialogVisible.set(true);
  }

  onAddEmployeeSuccess() {
    this.filterService.applyFilter()
  }
}
