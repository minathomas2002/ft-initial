import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Button } from "primeng/button";
import { ERoutes } from 'src/app/shared/enums';
import { TranslatePipe } from "../../../../../shared/pipes/translate.pipe";
import { TableLayoutComponent } from "src/app/shared/components/layout-components/table-layout/table-layout.component";
import { ITableHeaderItem } from 'src/app/shared/interfaces';
import { THolidaysManagementRecordKeys } from 'src/app/shared/interfaces/ISetting';
import { I18nService } from 'src/app/shared/services/i18n';
import { TableSkeletonComponent } from "src/app/shared/components/skeletons/table-skeleton/table-skeleton.component";
import { DataTableComponent } from "src/app/shared/components/layout-components/data-table/data-table.component";
import { DatePipe } from '@angular/common';
import { HolidaysManagementFilter } from "../../../components/holidays-management-filter/holidays-management-filter";
import { AddEditHolidayDialog } from "../../../components/add-edit-holiday-dialog/add-edit-holiday-dialog";
import { adminSettingsStore } from 'src/app/shared/stores/settings/admin-settings.store';
import { HolidaysFilterService } from '../../../services/holidays-filter/holidays-filter-service';
import { HolidaysTypeMapper } from '../../../classes/holidays-type-mapper';

@Component({
  selector: 'app-admin-holidays-management-view',
  imports: [Button, TranslatePipe, TableLayoutComponent, TableSkeletonComponent, DataTableComponent,
    DatePipe, HolidaysManagementFilter, AddEditHolidayDialog],
  templateUrl: './admin-holidays-management-view.html',
  styleUrl: './admin-holidays-management-view.scss',
})
export class AdminHolidaysManagementView implements OnInit {

  router = inject(Router);
  i18nService = inject(I18nService);
  adminSettingsStore = inject(adminSettingsStore);
  holidaysFilterService = inject(HolidaysFilterService);
  holidaysTypeMapper = new HolidaysTypeMapper(this.i18nService);
  viewCreateDialog = signal<boolean>(false);
  filter = this.holidaysFilterService.filter;

  headers = computed<ITableHeaderItem<THolidaysManagementRecordKeys>[]>(() => {
    // Access currentLanguage to make computed reactive to language changes
    this.i18nService.currentLanguage();
    return [
      {
        label: this.i18nService.translate('setting.adminView.holidays.table.holidayName'),
        isSortable: false
      },
      {
        label: this.i18nService.translate('setting.adminView.holidays.table.type'),
        isSortable: false 
      },
      {
        label: this.i18nService.translate('setting.adminView.holidays.table.startDate'),
        isSortable: true,
        sortingKey: 'dateFrom',
      },
      {
        label: this.i18nService.translate('setting.adminView.holidays.table.endDate'),
        isSortable: true,
        sortingKey: 'dateTo'
      },
      {
        label: this.i18nService.translate('setting.adminView.holidays.table.numberOfDay'),
        isSortable: false
      },
      {
        label: this.i18nService.translate('setting.adminView.holidays.table.createdDate'),
        isSortable: true,
        sortingKey: 'createdDate'
      },
      {
        label: this.i18nService.translate('setting.adminView.holidays.table.createdBy'),
        isSortable: false
      },
      {
        label: this.i18nService.translate('setting.adminView.holidays.table.updatedDate'),
        isSortable: false
      },
      {
        label: this.i18nService.translate('setting.adminView.holidays.table.updatedBy'),
        isSortable: false
      },
      {
        label: this.i18nService.translate('setting.adminView.holidays.table.actions'),
        isSortable: false
      },
    ];
  });



  ngOnInit() {
    // Load holidays list on component initialization
    this.applyFilter()
  }

  goBack() {
    this.router.navigate([`/${ERoutes.settings}`]);
  }

  onAddHoliday() {
    this.viewCreateDialog.set(true);
  }

  onSuccessActions() {
    // Reload holidays list after successful create/update/delete
    this.applyFilter();
  }

  applyFilter() {
    this.holidaysFilterService.applyFilterWithPaging();
  }  
}


