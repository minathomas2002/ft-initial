import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { TranslatePipe } from "../../../../shared/pipes/translate.pipe";
import { TableLayoutComponent } from "src/app/shared/components/layout-components/table-layout/table-layout.component";
import { ITableHeaderItem, IFilterBase } from 'src/app/shared/interfaces';
import { IWorkingDay, TWorkingDayKeys } from 'src/app/shared/interfaces/ISetting';
import { I18nService } from 'src/app/shared/services/i18n';
import { TableSkeletonComponent } from "src/app/shared/components/skeletons/table-skeleton/table-skeleton.component";
import { DataTableComponent } from "src/app/shared/components/layout-components/data-table/data-table.component";
import { AdminSettingsStore } from 'src/app/shared/stores/settings/admin-settings.store';
import { ESortingOrder } from 'src/app/shared/enums';
import { take } from 'rxjs';

@Component({
  selector: 'app-admin-working-days-management-view',
  imports: [TranslatePipe, TableLayoutComponent, TableSkeletonComponent, DataTableComponent],
  templateUrl: './admin-working-days-management-view.html',
  styleUrl: './admin-working-days-management-view.scss',
})
export class AdminWorkingDaysManagementView implements OnInit {

  i18nService = inject(I18nService);
  adminSettingsStore = inject(AdminSettingsStore);
  filter = signal<IFilterBase<TWorkingDayKeys>>({ 
    pageSize: 10, 
    pageNumber: 1, 
    sortField: null, 
    sortOrder: ESortingOrder.asc 
  });

  headers = computed<ITableHeaderItem<TWorkingDayKeys>[]>(() => {
    // Access currentLanguage to make computed reactive to language changes
    this.i18nService.currentLanguage();
    return [
      {
        label: this.i18nService.translate('setting.adminView.workingDays.table.nameEn'),
        isSortable: false
      },
      {
        label: this.i18nService.translate('setting.adminView.workingDays.table.nameAr'),
        isSortable: false
      },
      {
        label: this.i18nService.translate('setting.adminView.workingDays.table.isWorkingDay'),
        isSortable: false
      },
    ];
  });

  ngOnInit() {
    // Load working days list on component initialization
    this.loadWorkingDays();
  }

  loadWorkingDays() {
    this.adminSettingsStore.getWorkingDays()
      .pipe(take(1))
      .subscribe();
  }

  onFilterChange() {
    // Reload working days when filter changes (if needed in future)
    // For now, working days list doesn't support filtering
  }
}

