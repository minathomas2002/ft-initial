import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Button } from "primeng/button";
import { ERoutes, ESortingOrder } from 'src/app/shared/enums';
import { TranslatePipe } from "../../../../../shared/pipes/translate.pipe";
import { TableLayoutComponent } from "src/app/shared/components/layout-components/table-layout/table-layout.component";
import { IFilterBase, ITableHeaderItem } from 'src/app/shared/interfaces';
import { THolidaysManagementRecordKeys } from 'src/app/shared/interfaces/ISetting';
import { I18nService } from 'src/app/shared/services/i18n';
import { TableSkeletonComponent } from "src/app/shared/components/skeletons/table-skeleton/table-skeleton.component";
import { DataTableComponent } from "src/app/shared/components/layout-components/data-table/data-table.component";
import { DatePipe } from '@angular/common';
import { HolidaysManagementFilter } from "../../../components/holidays-management-filter/holidays-management-filter";
import { AddEditHolidayDialog } from "../../../components/add-edit-holiday-dialog/add-edit-holiday-dialog";

@Component({
  selector: 'app-admin-holidays-management-view',
  imports: [Button, TranslatePipe, TableLayoutComponent, TableSkeletonComponent, DataTableComponent,
    DatePipe, HolidaysManagementFilter, AddEditHolidayDialog],
  templateUrl: './admin-holidays-management-view.html',
  styleUrl: './admin-holidays-management-view.scss',
})
export class AdminHolidaysManagementView {

router = inject(Router);
i18nService = inject(I18nService);
viewCreateDialog= signal<boolean>(false);
filter : IFilterBase<unknown>= {
  pageSize: 0,
  pageNumber: 0,
  sortField: undefined,
  sortOrder: ESortingOrder.asc
};

  headers = computed<ITableHeaderItem<THolidaysManagementRecordKeys>[]>(() => {
    // Access currentLanguage to make computed reactive to language changes
    this.i18nService.currentLanguage();
    return [
       {
        label: this.i18nService.translate('setting.adminView.holidays.table.holidayName'),
        isSortable: true,
        sortingKey: 'holidayName',
      },
      {
        label: this.i18nService.translate('setting.adminView.holidays.table.type'), 
        isSortable: true,
        sortingKey: 'type',
      },
      {
        label: this.i18nService.translate('setting.adminView.holidays.table.startDate'),
        isSortable: true,
        sortingKey: 'startDate',
      },
      {
        label: this.i18nService.translate('setting.adminView.holidays.table.endDate'),
        isSortable: true,
        sortingKey: 'endDate'
      },
      {
        label: this.i18nService.translate('setting.adminView.holidays.table.numberOfDay'),
        isSortable: true,
        sortingKey: 'numberOfDays'
      },
      {
        label: this.i18nService.translate('setting.adminView.holidays.table.createdBy'),
        isSortable: true,
        sortingKey: 'createdBy'
      },
      {
        label: this.i18nService.translate('setting.adminView.holidays.table.lastUpdated'),
        isSortable: true,
        sortingKey: 'lastUpdated',
      },
      {
        label: this.i18nService.translate('setting.adminView.holidays.table.actions'),
        isSortable: false
      },
    ];
  });
  


  goBack(){
    this.router.navigate([`/${ERoutes.settings}`]);
  }

  onAddHoliday(){
    this.viewCreateDialog.set(true);
  }

  onSuccessActions(){

  }
}


