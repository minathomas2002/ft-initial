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
import { DelegationStatusMapper } from '../../classes/delegation-status-mapper';

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
        label: this.i18nService.translate('delegation.table.delegatorName'),
        isSortable: true,
        sortingKey: 'delegatorName',
      },
      {
        label: this.i18nService.translate('delegation.table.delegateeName'),
        isSortable: true,
        sortingKey: 'delegateeName',
      },
      {
        label: this.i18nService.translate('delegation.table.startDate'),
        isSortable: true,
        sortingKey: 'startDate',
      },
      {
        label: this.i18nService.translate('delegation.table.endDate'),
        isSortable: true,
        sortingKey: 'endDate',
      },
      {
        label: this.i18nService.translate('delegation.table.createdAt'),
        isSortable: true,
        sortingKey: 'createdAt',
      },
      {
        label: this.i18nService.translate('delegation.table.createdBy'),
        isSortable: true,
        sortingKey: 'createdBy',
      },
      {
        label: this.i18nService.translate('delegation.table.updatedBy'),
        isSortable: true,
        sortingKey: 'updatedBy',
      },
      {
        label: this.i18nService.translate('delegation.table.updatedAt'),
        isSortable: true,
        sortingKey: 'updatedAt',
      },
      {
        label: this.i18nService.translate('delegation.table.status'),
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
  delegationStatusMapper = new DelegationStatusMapper(this.i18nService);
  ToasterService = inject(ToasterService);
  deleteDialogVisible = signal<boolean>(false);
  deactivateDialogVisible = signal<boolean>(false);
  isProcessing = this.delegationStore.isProcessing;

  ngOnInit(): void {
    this.filterService.applyFilter();
  }


  getDelegationStatus(status: string) {
    return this.delegationStatusMapper.getStatus(status);
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
