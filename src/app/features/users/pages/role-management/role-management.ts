import { Component, computed, inject, OnInit } from '@angular/core';
import { TableLayoutComponent } from 'src/app/shared/components/layout-components/table-layout/table-layout.component';
import { TableSkeletonComponent } from 'src/app/shared/components/skeletons/table-skeleton/table-skeleton.component';
import { UsersLookupsStore } from 'src/app/shared/stores/system-employees/users-lookups.store';
import { RoleManagementFilters } from '../../components/role-management-filters/role-management-filters';
import {
  ITableHeaderItem,
  IRoleManagementRecord,
  TRoleManagementSortingKeys,
} from 'src/app/shared/interfaces';
import { UsersStore } from 'src/app/shared/stores/system-employees/system-employees.store';
import { DataTableComponent } from 'src/app/shared/components/layout-components/data-table/data-table.component';
import { RoleManagementFilterService } from '../../services/role-management-filter/role-management-filter-service';
import { EUserStatus } from 'src/app/shared/enums/system-employee.enum';
import { UserStatusMapper } from '../../classes/user-status-mapper';
import { UserRoleMapper } from '../../classes/user-role-mapper';
import { I18nService } from 'src/app/shared/services/i18n/i18n.service';
import { BaseTagComponent } from 'src/app/shared/components/base-components/base-tag/base-tag.component';
import { DatePipe } from '@angular/common';
import { ERoles } from 'src/app/shared/enums';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-role-management',
  imports: [
    TableLayoutComponent,
    TableSkeletonComponent,
    DatePipe,
    RoleManagementFilters,
    BaseTagComponent,
    DataTableComponent,
    TooltipModule
  ],
  templateUrl: './role-management.html',
  styleUrl: './role-management.scss',
  providers: [RoleManagementFilterService],
})
export class RoleManagement implements OnInit {
  usersLookupsStore = inject(UsersLookupsStore);
  usersStore = inject(UsersStore);
  i18nService = inject(I18nService);
  headers = computed<ITableHeaderItem<TRoleManagementSortingKeys>[]>(() => {
    // Access currentLanguage to make computed reactive to language changes
    this.i18nService.currentLanguage();
    return [
      {
        label: this.i18nService.translate('users.table.name') || 'Name',
        isSortable: true,
        sortingKey: 'name_En',
      },
      {
        label: this.i18nService.translate('users.table.jobNo') || 'Job No.',
        isSortable: true,
        sortingKey: 'jobId',
      },
      {
        label: this.i18nService.translate('users.table.email') || 'E-mail',
        isSortable: false
      },
      {
        label: this.i18nService.translate('users.table.role') || 'Role',
        isSortable: false
      },
      {
        label: this.i18nService.translate('users.table.assignedBy') || 'Assigned BY',
        isSortable: false
      },
      {
        label: this.i18nService.translate('users.table.assignedDate') || 'Assigned Date',
        isSortable: true,
        sortingKey: 'assignedDate',
      },
      {
        label: this.i18nService.translate('users.table.status') || 'Status',
        isSortable: false
      }
    ];
  });
  rows = computed<IRoleManagementRecord[]>(() => this.usersStore.roleManagementList());
  filterService = inject(RoleManagementFilterService);
  filter = this.filterService.filter;
  totalRecords = computed(() => this.usersStore.roleManagementCount());
  userStatusMapper = new UserStatusMapper(this.i18nService);
  userRoleMapper = new UserRoleMapper(this.i18nService);

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

  getUserTranslatedRole(roleCode: number): string {
    return this.userRoleMapper.getTranslatedRole(roleCode as ERoles);
  }

  getUserName(item: IRoleManagementRecord): string {
    // Return name based on current language
    const currentLang = this.i18nService.currentLanguage();
    return currentLang === 'ar' ? item.name_Ar : item.name_En;
  }
}

