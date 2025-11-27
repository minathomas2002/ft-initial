import { ChangeRoleFormService } from './../../services/change-role-form/change-role-form-service';
import { TooltipModule } from 'primeng/tooltip';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { finalize, take } from 'rxjs';
import { TableLayoutComponent } from 'src/app/shared/components/layout-components/table-layout/table-layout.component';
import { TableSkeletonComponent } from 'src/app/shared/components/skeletons/table-skeleton/table-skeleton.component';
import { UsersLookupsStore } from 'src/app/shared/stores/users/users-lookups.store';
import { UsersFilter } from '../../components/users-filter/users-filter';
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
import { EAdminUserActions, EUserStatus } from 'src/app/shared/enums/users.enum';
import { UserStatusMapper } from '../../classes/user-status-mapper';
import { UserRoleMapper } from '../../classes/user-role-mapper';
import { I18nService } from 'src/app/shared/services/i18n/i18n.service';
import { BaseTagComponent } from 'src/app/shared/components/base-components/base-tag/base-tag.component';
import { UsersActionMenu } from '../../components/users-action-menu/users-action-menu';
import { DatePipe } from '@angular/common';
import { ChangeRoleDialog } from '../../components/change-role-dialog/change-role-dialog';
import { ToasterService } from 'src/app/shared/services/toaster/toaster.service';
import { GeneralConfirmationDialogComponent } from 'src/app/shared/components/utility-components/general-confirmation-dialog/general-confirmation-dialog.component';
import { ERoleNames } from 'src/app/shared/enums';

@Component({
  selector: 'app-employee-list',
  imports: [
    TableLayoutComponent,
    TableSkeletonComponent,
    DatePipe,
    UsersFilter,
    BaseTagComponent,
    DataTableComponent,
    TooltipModule,
    UsersActionMenu,
    ChangeRoleDialog,
    DatePipe,
    GeneralConfirmationDialogComponent,
  ],
  templateUrl: './employee-list.html',
  styleUrl: './employee-list.scss',
  providers: [UsersFilterService],
})
export class EmployeeList implements OnInit {
  usersLookupsStore = inject(UsersLookupsStore);
  usersStore = inject(UsersStore);
  i18nService = inject(I18nService);
  headers = computed<ITableHeaderItem<TUsersSortingKeys>[]>(() => [
    {
      label: 'ID',
      isSortable: true,
      sortingKey: 'employeeID',
    },
    {
      label: 'Name (Arabic)',
      isSortable: true,
      sortingKey: 'name_Ar',
    },
    {
      label: 'Name (English)',
      isSortable: true,
      sortingKey: 'name_En',
    },
    {
      label: 'Email',
      isSortable: true,
      sortingKey: 'email',
    },
    {
      label: 'Phone Number',
      isSortable: true,
      sortingKey: 'phoneNumber',
    },
    {
      label: 'Role',
      isSortable: true,
      sortingKey: 'role',
    },
    {
      label: 'Join Date',
      isSortable: true,
      sortingKey: 'joinDate',
    },
    {
      label: 'Status',
      isSortable: true,
      sortingKey: 'status',
    },
    {
      label: 'Actions',
      isSortable: false,
    },
  ]);
  rows = computed<IUserRecord[]>(() => this.usersStore.list());
  filterService = inject(UsersFilterService);
  filter = this.filterService.filter;
  totalRecords = computed(() => this.usersStore.count());
  userStatusMapper = new UserStatusMapper();
  userRoleMapper = new UserRoleMapper(this.i18nService);
  changeRoleDialogVisible = signal<boolean>(false);
  changeRoleFormService = inject(ChangeRoleFormService);
  ToasterService = inject(ToasterService);
  deleteDialogVisible = signal<boolean>(false);
  ngOnInit(): void {
    this.usersLookupsStore.getUserTitles().pipe(take(1)).subscribe();
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

  getUserTranslatedRole(role: ERoleNames): string {
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
}
