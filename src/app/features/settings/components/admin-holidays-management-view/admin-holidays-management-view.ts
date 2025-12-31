import { Component, computed, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { TranslatePipe } from "../../../../shared/pipes/translate.pipe";
import { TableLayoutComponent } from "src/app/shared/components/layout-components/table-layout/table-layout.component";
import { ITableHeaderItem } from 'src/app/shared/interfaces';
import { IHolidaysManagementRecord, THolidaysManagementRecordKeys } from 'src/app/shared/interfaces/ISetting';
import { I18nService } from 'src/app/shared/services/i18n';
import { TableSkeletonComponent } from "src/app/shared/components/skeletons/table-skeleton/table-skeleton.component";
import { DataTableComponent } from "src/app/shared/components/layout-components/data-table/data-table.component";
import { DatePipe } from '@angular/common';
import { HolidaysManagementFilter } from "../holidays-management-filter/holidays-management-filter";
import { AddEditHolidayDialog } from "../add-edit-holiday-dialog/add-edit-holiday-dialog";
import { AdminSettingsStore } from 'src/app/shared/stores/settings/admin-settings.store';
import { HolidaysFilterService } from '../../services/holidays-filter/holidays-filter-service';
import { HolidaysTypeMapper } from '../../classes/holidays-type-mapper';
import { AdminSettingMenuAction } from "../admin-setting-menu-action/admin-setting-menu-action";
import { GeneralConfirmationDialogComponent } from "src/app/shared/components/utility-components/general-confirmation-dialog/general-confirmation-dialog.component";
import { finalize, take } from 'rxjs';
import { ToasterService } from 'src/app/shared/services/toaster/toaster.service';

@Component({
  selector: 'app-admin-holidays-management-view',
  imports: [
    TranslatePipe,
    TableLayoutComponent,
    TableSkeletonComponent,
    DataTableComponent,
    DatePipe, HolidaysManagementFilter, AddEditHolidayDialog, AdminSettingMenuAction, GeneralConfirmationDialogComponent],
  templateUrl: './admin-holidays-management-view.html',
  styleUrl: './admin-holidays-management-view.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminHolidaysManagementView implements OnInit {

  i18nService = inject(I18nService);
  adminSettingsStore = inject(AdminSettingsStore);
  holidaysFilterService = inject(HolidaysFilterService);
  holidaysTypeMapper = new HolidaysTypeMapper(this.i18nService);
  viewUpdateDialog = signal<boolean>(false);
  viewDeleteDialog = signal<boolean>(false);
  toasterService = inject(ToasterService);

  isEditMode = signal<boolean>(false);
  selectedItem = signal<IHolidaysManagementRecord | null>(null);

  filter = this.holidaysFilterService.filter;

  headers = computed<ITableHeaderItem<THolidaysManagementRecordKeys>[]>(() => {
    // Access currentLanguage to make computed reactive to language changes
    this.i18nService.currentLanguage();
    return [
      {
        label: this.i18nService.translate('setting.adminView.holidays.table.holidayName'),
        isSortable: true,
        sortingKey: 'name',
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
        label: 'Last Updated Date',
        isSortable: false
      },
      {
        label: 'Last Updated By',
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

  getNumberOfDaysNoun(numberInDays: number): string {
    return numberInDays > 1 ? 'Days' : 'Day';
  }

  onSuccessActions() {
    // Reload holidays list after successful create/update/delete
    this.applyFilter();
  }

  applyFilter() {
    this.holidaysFilterService.applyFilterWithPaging();
  }
  onUpdate(item: IHolidaysManagementRecord) {
    this.viewUpdateDialog.set(true);
    this.isEditMode.set(true);
    this.selectedItem.set(item);
  }

  onDelete(item: IHolidaysManagementRecord) {
    this.viewDeleteDialog.set(true);
    this.selectedItem.set(item);
  }

  confirmDelete() {
    this.adminSettingsStore.deleteHoliday(this.selectedItem()?.id!)
      .pipe(
        take(1),
        finalize(() => {
          this.viewDeleteDialog.set(false);
          this.selectedItem.set(null);
        })
      )
      .subscribe(res => {
        this.toasterService.success(this.i18nService.translate('setting.adminView.holidays.dialog.deleteSuccessMessage'));
        this.applyFilter();
      });
  }
}

