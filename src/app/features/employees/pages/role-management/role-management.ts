import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit, output, signal } from '@angular/core';
import { TableLayoutComponent } from 'src/app/shared/components/layout-components/table-layout/table-layout.component';
import { TableSkeletonComponent } from 'src/app/shared/components/skeletons/table-skeleton/table-skeleton.component';
import { RoleManagementFilters } from '../../components/role-management-filters/role-management-filters';
import {
  ITableHeaderItem,
  IRoleManagementAssignmentRecord,
  TRoleManagementAssignmentSortingKeys,
  ITransferRoleRequest,
} from 'src/app/shared/interfaces';
import { RoleManagementStore } from 'src/app/shared/stores/system-employees/role-management-store';
import { DataTableComponent } from 'src/app/shared/components/layout-components/data-table/data-table.component';
import { RoleManagementFilterService } from '../../services/role-management-filter/role-management-filter-service';
import { EUserStatus } from 'src/app/shared/enums/system-employee.enum';
import { UserStatusMapper } from '../../classes/user-status-mapper';
import { EmployeeRoleMapper } from '../../classes/employee-role-mapper';
import { I18nService } from 'src/app/shared/services/i18n/i18n.service';
import { BaseTagComponent } from 'src/app/shared/components/base-components/base-tag/base-tag.component';
import { DatePipe } from '@angular/common';
import { ERoles } from 'src/app/shared/enums';
import { TooltipModule } from 'primeng/tooltip';
import { RoleManagementActions } from '../../components/role-management-actions/role-management-actions';
import { TransferRoleDialog } from '../../components/transfer-role-dialog/transfer-role-dialog';
import { TransferRoleService } from '../../services/transfer-role/transfer-role-service';
import { ToasterService } from 'src/app/shared/services/toaster/toaster.service';
import { pipe, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-role-management',
  imports: [
    TableLayoutComponent,
    TableSkeletonComponent,
    DatePipe,
    RoleManagementFilters,
    BaseTagComponent,
    DataTableComponent,
    TooltipModule,
    RoleManagementActions,
    TransferRoleDialog
  ],
  templateUrl: './role-management.html',
  styleUrl: './role-management.scss',
  providers: [RoleManagementFilterService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleManagement implements OnInit {
  roleManagementStore = inject(RoleManagementStore);
  i18nService = inject(I18nService);
  headers = computed<ITableHeaderItem<TRoleManagementAssignmentSortingKeys>[]>(() => {
    // Access currentLanguage to make computed reactive to language changes
    this.i18nService.currentLanguage();
    return [
      {
        label: 'ID',
        isSortable: false,
        sortingKey: 'jobId',
      },
      {
        label: this.i18nService.translate('users.table.name') || 'Name',
        isSortable: true,
        sortingKey: 'name_En',
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
        label: this.i18nService.translate('users.table.assignedBy') || 'AssignedBy',
        isSortable: true,
        sortingKey: 'assignedBy',
      },
      {
        label: this.i18nService.translate('users.table.assignedDate') || 'assignedDate',
        isSortable: true,
        sortingKey: 'assignedDate',
      },
      {
        label: this.i18nService.translate('users.table.status') || 'Status',
        isSortable: false
      },
      {
        label: this.i18nService.translate('users.table.actions') || 'Actions',
        isSortable: false
      }
    ];
  });
  rows = computed<IRoleManagementAssignmentRecord[]>(() => this.roleManagementStore.roleManagementList());
  filterService = inject(RoleManagementFilterService);
  filter = this.filterService.filter;
  totalRecords = computed(() => this.roleManagementStore.roleManagementCount());
  userStatusMapper = new UserStatusMapper(this.i18nService);
  userRoleMapper = new EmployeeRoleMapper(this.i18nService);
  selectedItem = signal<IRoleManagementAssignmentRecord | null>(null);
  transferRoleDialogVisible = signal<boolean>(false);
  transferRoleService = inject(TransferRoleService);
  toasterService = inject(ToasterService);
  updateEmployees = output<void>();

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

  getUserName(item: IRoleManagementAssignmentRecord): string {
    // Return name based on current language
    const currentLang = this.i18nService.currentLanguage();
    return currentLang === 'ar' ? item.name_Ar : item.name_En;
  }

  onTransfer(item: IRoleManagementAssignmentRecord): void {
    this.selectedItem.set(item);
    this.transferRoleDialogVisible.set(true);
  }

  onConfirmTransferRole(): void {
    const request: ITransferRoleRequest = {
      currentUserId: this.selectedItem()?.userId!,
      newUserId: this.transferRoleService.employee.value!,
      roleCode: this.selectedItem()?.roleCode!
    }
    this.roleManagementStore.transferRole(request)
      .pipe(tap(() => this.updateEmployees.emit()))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.filterService.applyFilter();
            this.toasterService.success(this.i18nService.translate('users.messages.transferRoleSuccess'));
            this.transferRoleDialogVisible.set(false);
          }
        }
      })
  }
}

