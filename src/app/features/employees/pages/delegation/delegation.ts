import { ChangeRoleFormService } from './../../services/change-role-form/change-role-form-service';
import { TooltipModule } from 'primeng/tooltip';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { TableLayoutComponent } from 'src/app/shared/components/layout-components/table-layout/table-layout.component';
import { TableSkeletonComponent } from 'src/app/shared/components/skeletons/table-skeleton/table-skeleton.component';
import { EmployeesFilter } from '../../components/employees-filter/employees-filter';
import {
  ISelectItem,
  ISystemEmployeeRecord,
  ITableHeaderItem,
  IUser,
  TSystemEmployeeSortingKeys,
} from 'src/app/shared/interfaces';
import { DataTableComponent } from 'src/app/shared/components/layout-components/data-table/data-table.component';
import { UserStatusMapper } from '../../classes/user-status-mapper';
import { I18nService } from 'src/app/shared/services/i18n/i18n.service';
import { BaseTagComponent } from 'src/app/shared/components/base-components/base-tag/base-tag.component';
import { EmployeesActionMenu } from '../../components/employees-action-menu/employees-action-menu';
import { DatePipe } from '@angular/common';
import { ToasterService } from 'src/app/shared/services/toaster/toaster.service';
import { ButtonModule } from 'primeng/button';
import { EmployeeRoleMapper } from '../../classes/employee-role-mapper';
import { ERoles } from 'src/app/shared/enums';
import { DelegationStore } from 'src/app/shared/stores/system-employees/delegation.store';
import { IDelegationRecord } from 'src/app/shared/interfaces/delegation.interface';
import { DelegationFilterService } from '../../services/Delegation-filter/Delegation-filter-service';
import { DelegationFilter } from "../../components/delegation-filter/delegation-filter";
import { DelegationActionMenu } from "../../components/delegation-action-menu/delegation-action-menu";

@Component({
  selector: 'app-delegation',
 imports: [
    TableLayoutComponent,
    TableSkeletonComponent,
    DatePipe,
    BaseTagComponent,
    DataTableComponent,
    TooltipModule,
    DatePipe,
    ButtonModule,
    DelegationFilter,
    DelegationActionMenu
],
  templateUrl: './delegation.html',
  styleUrl: './delegation.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Delegation implements OnInit {
  delegationStore = inject(DelegationStore);
  i18nService = inject(I18nService);
  delegation = signal<IDelegationRecord | null>(null);

  headers = computed<ITableHeaderItem<string>[]>(() => {
    this.i18nService.currentLanguage();
    return [
      {
        label: this.i18nService.translate('delegation.table.delegator'),
        tooltip: this.i18nService.translate('delegation.table.delegatorTooltip'), // “Delegator – the original owner of tasks.”
        isSortable: true,
        sortingKey: 'delegator',
      },
      {
        label: this.i18nService.translate('delegation.table.delegatee'),
        tooltip: this.i18nService.translate('delegation.table.delegateeTooltip'), // “Delegatee – the user authorized to act on behalf of the delegator.”
        isSortable: true,
        sortingKey: 'delegatee',
      },
      {
        label: this.i18nService.translate('delegation.table.startDate'),
        tooltip: this.i18nService.translate('delegation.table.startDateTooltip'),
        isSortable: true,
        sortingKey: 'startDate',
      },
      {
        label: this.i18nService.translate('delegation.table.endDate'),
        tooltip: this.i18nService.translate('delegation.table.endDateTooltip'),
        isSortable: true,
        sortingKey: 'endDate',
      },
      {
        label: this.i18nService.translate('delegation.table.createdAt'),
        tooltip: this.i18nService.translate('delegation.table.createdAtTooltip'),
        isSortable: true,
        sortingKey: 'createdAt',
      },
      {
        label: this.i18nService.translate('delegation.table.createdBy'),
        tooltip: this.i18nService.translate('delegation.table.createdByTooltip'),
        isSortable: true,
        sortingKey: 'createdBy',
      },
      {
        label: this.i18nService.translate('delegation.table.lastModifiedBy'),
        tooltip: this.i18nService.translate('delegation.table.lastModifiedByTooltip'),
        isSortable: true,
        sortingKey: 'lastModifiedBy',
      },
      {
        label: this.i18nService.translate('delegation.table.lastModifiedDate'),
        tooltip: this.i18nService.translate('delegation.table.lastModifiedDateTooltip'),
        isSortable: true,
        sortingKey: 'lastModifiedDate',
      },
      {
        label: this.i18nService.translate('delegation.table.status'),
        tooltip: this.i18nService.translate('delegation.table.statusTooltip'),
        isSortable: true,
        sortingKey: 'status',
      },
      {
        label: this.i18nService.translate('delegation.table.actions'),
        isSortable: false,
      },
    ];
  });

  EditEmpDialogVisible = signal<boolean>(false);
  rows = computed<IDelegationRecord[]>(() => this.delegationStore.list());
  filterService = inject(DelegationFilterService);
  filter = this.filterService.filter;
  totalRecords = computed(() => this.delegationStore.count());
  employeeRoleMapper = new EmployeeRoleMapper(this.i18nService);
  userStatusMapper = new UserStatusMapper(this.i18nService);
  ToasterService = inject(ToasterService);
  deleteDialogVisible = signal<boolean>(false);
  deactivateDialogVisible = signal<boolean>(false);
  isProcessing = this.delegationStore.isProcessing;

  ngOnInit(): void {
    this.filterService.applyFilter();
  }

  getUserTranslatedRole(roleCode: number): string {
    return this.employeeRoleMapper.getTranslatedRole(roleCode as ERoles);
  }

  getUserStatus(status: string) {
    return this.userStatusMapper.getStatus(status);
  }

  onDelete(item: IUser) {
    this.deleteDialogVisible.set(true);
  }
  onDeleteConfirm() {
    this.deleteDialogVisible.set(false);
  }



  onUpdateDelegate(item: IDelegationRecord  ) {
    this.delegation.set(item);
    this.EditEmpDialogVisible.set(true);
  }

  onUpdateDelegateSuccess() {
    this.filterService.applyFilterWithPaging();
  }


}
