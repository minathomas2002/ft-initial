import { ChangeRoleFormService } from './../../services/change-role-form/change-role-form-service';
import { TooltipModule } from 'primeng/tooltip';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { TableLayoutComponent } from 'src/app/shared/components/layout-components/table-layout/table-layout.component';
import { TableSkeletonComponent } from 'src/app/shared/components/skeletons/table-skeleton/table-skeleton.component';
import { UsersLookupsStore } from 'src/app/shared/stores/users/users-lookups.store';
import { EmployeesFilter } from '../../components/employees-filter/employees-filter';
import {
  ISelectItem,
  ITableHeaderItem,
  IUser,
  IUserRecord,
  TUsersSortingKeys,
} from 'src/app/shared/interfaces';
import { UsersStore } from 'src/app/shared/stores/users/users.store';
import { DataTableComponent } from 'src/app/shared/components/layout-components/data-table/data-table.component';
import { UsersFilterService } from '../../services/users-filter/users-filter-service';
import { EUserStatus } from 'src/app/shared/enums/users.enum';
import { UserStatusMapper } from '../../classes/user-status-mapper';
import { UserRoleMapper } from '../../classes/user-role-mapper';
import { I18nService } from 'src/app/shared/services/i18n/i18n.service';
import { BaseTagComponent } from 'src/app/shared/components/base-components/base-tag/base-tag.component';
import { EmployeesActionMenu } from '../../components/employees-action-menu/employees-action-menu';
import { TranslatePipe } from 'src/app/shared/pipes';
import { DatePipe } from '@angular/common';
import { ChangeRoleDialog } from '../../components/change-role-dialog/change-role-dialog';
import { ToasterService } from 'src/app/shared/services/toaster/toaster.service';
import { GeneralConfirmationDialogComponent } from 'src/app/shared/components/utility-components/general-confirmation-dialog/general-confirmation-dialog.component';
import { ERoles } from 'src/app/shared/enums';
import { ButtonModule } from 'primeng/button';
import { AddEditEmployeeDialog } from "../../components/add-edit-employee-dialog/add-edit-employee-dialog";
import { RolesStore } from 'src/app/shared/stores/roles/roles.store';

@Component({
  selector: 'app-employee-list',
  imports: [
    TableLayoutComponent,
    TableSkeletonComponent,
    DatePipe,
    EmployeesFilter,
    BaseTagComponent,
    DataTableComponent,
    TooltipModule,
    EmployeesActionMenu,
    ChangeRoleDialog,
    DatePipe,
    GeneralConfirmationDialogComponent,
    TranslatePipe,
    ButtonModule,
    AddEditEmployeeDialog
],
  templateUrl: './employee-list.html',
  styleUrl: './employee-list.scss',
  providers: [UsersFilterService],
})
export class EmployeeList implements OnInit {
  usersLookupsStore = inject(UsersLookupsStore);
  usersStore = inject(UsersStore);
  i18nService = inject(I18nService);
  roleStore = inject(RolesStore);
  headers = computed<ITableHeaderItem<TUsersSortingKeys>[]>(() => {
    // Access currentLanguage to make computed reactive to language changes
    this.i18nService.currentLanguage();
    return [
      {
        label: this.i18nService.translate('users.table.id'),
        isSortable: true,
        sortingKey: 'employeeID',
      },
      {
        label: this.i18nService.translate('users.table.nameArabic'),
        isSortable: true,
        sortingKey: 'name_Ar',
      },
      {
        label: this.i18nService.translate('users.table.nameEnglish'),
        isSortable: true,
        sortingKey: 'name_En',
      },
      {
        label: this.i18nService.translate('users.table.email'),
        isSortable: false
      },
      {
        label: this.i18nService.translate('users.table.phoneNumber'),
        isSortable: false
      },
      {
        label: this.i18nService.translate('users.table.role'),
        isSortable: false      
      },
      {
        label: this.i18nService.translate('users.table.joinDate'),
        isSortable: true,
        sortingKey: 'joinDate',
      },
      {
        label: this.i18nService.translate('users.table.status'),
        isSortable: false      
      },
      {
        label: this.i18nService.translate('users.table.actions'),
        isSortable: false,
      },
    ];
  });
  CreateEditEmpDialogVisible = signal<boolean>(false);

  rows = computed<IUserRecord[]>(() => this.usersStore.list());
  filterService = inject(UsersFilterService);
  filter = this.filterService.filter;
  totalRecords = computed(() => this.usersStore.count());
  userStatusMapper = new UserStatusMapper(this.i18nService);
  userRoleMapper = new UserRoleMapper(this.i18nService);
  changeRoleDialogVisible = signal<boolean>(false);
  changeRoleFormService = inject(ChangeRoleFormService);
  ToasterService = inject(ToasterService);
  deleteDialogVisible = signal<boolean>(false);

  ngOnInit(): void {
    this.filterService.applyFilter();
  }
  getUserStatus(status: string) {
    // Convert string status to enum (e.g., "Active" -> "active")
    const statusLower = status.toLowerCase() as EUserStatus;
    return (
      this.userStatusMapper.mapUserStatusColor()[statusLower] || {
        title: status,
        color: 'gray' as const,
      }
    );
  }

  getUserTranslatedRole(role: ERoles): string {
    return this.userRoleMapper.getTranslatedRole(role);
  }

  onChangeRole(item: IUser) {
    //this.selectedUser.set(item);
    this.changeRoleDialogVisible.set(true);
  }
  onDelete(item: IUser) {
    //this.selectedUser.set(item);
    this.deleteDialogVisible.set(true);
  }
  onChangeRoleConfirm() {
    const role = this.changeRoleFormService.role.value as unknown as ISelectItem;
    this.changeRoleDialogVisible.set(false);
    // this.selectedUser.set(null);
    // this.usersStore.changeUserRole(this.selectedUser()?.id!, role.id as unknown as EUserRole)
    //   .pipe(finalize(() => {
    //     this.changeRoleDialogVisible.set(false);
    //     this.selectedUser.set(null);
    //   }))
    //   .subscribe({
    //     next: () => {
    //       this.ToasterService.success('User role changed successfully');
    //       this.filterService.applyFilter();
    //     },
    //   });
  }
  onDeleteConfirm() {
    this.deleteDialogVisible.set(false);
    // this.selectedUser.set(null);
    // this.usersStore.deleteUser(this.selectedUser()?.id!)
    //   .pipe(finalize(() => {
    //     this.ToasterService.success('User deleted successfully');
    //     this.filterService.applyFilter();
    //   }))
    //   .subscribe();
  }
  onAddEmployee() {
     
    this.CreateEditEmpDialogVisible.set(true);
  }
}
