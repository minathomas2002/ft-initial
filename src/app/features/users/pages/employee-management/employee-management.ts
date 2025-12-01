import { Component, inject, OnInit, signal } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { EmployeeList } from '../employee-list/employee-list';
import { RoleManagement } from '../role-management/role-management';
import { TranslatePipe } from 'src/app/shared/pipes';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { UsersStore } from 'src/app/shared/stores/users/users.store';
import { RolesStore } from 'src/app/shared/stores/roles/roles.store';
import { take } from 'rxjs';
import { AddEditEmployeeDialog } from "../../components/add-edit-employee-dialog/add-edit-employee-dialog";

@Component({
  selector: 'app-employee-management',
  imports: [CommonModule, TabsModule, EmployeeList, RoleManagement, TranslatePipe, ButtonModule, AddEditEmployeeDialog],
  templateUrl: './employee-management.html',
  styleUrl: './employee-management.scss',
})
export class EmployeeManagement {
   usersStore = inject(UsersStore);
  roleStore = inject(RolesStore);
 CreateEmpDialogVisible = signal<boolean>(false);

  onAddEmployee() {
     this.roleStore.getFilteredRoles().pipe(take(1)).subscribe();
     this.CreateEmpDialogVisible.set(true);
   }
}
