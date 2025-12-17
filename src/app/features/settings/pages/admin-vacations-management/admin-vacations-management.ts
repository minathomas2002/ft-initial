import { Component, inject, signal } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { TranslatePipe } from 'src/app/shared/pipes';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { ERoutes } from 'src/app/shared/enums';
import { AddEditHolidayDialog } from '../../components/add-edit-holiday-dialog/add-edit-holiday-dialog';
import { AdminWorkingDaysManagementView } from '../../components/admin-working-days-management-view/admin-working-days-management-view';
import { HolidaysFilterService } from '../../services/holidays-filter/holidays-filter-service';
import { AdminHolidaysManagementView } from '../../components/admin-holidays-management-view/admin-holidays-management-view';

@Component({
  selector: 'app-admin-vacations-management',
  imports: [
    TabsModule,
    TranslatePipe,
    AdminWorkingDaysManagementView,
    AddEditHolidayDialog,
    ButtonModule,
    AdminHolidaysManagementView
  ],
  templateUrl: './admin-vacations-management.html',
  styleUrl: './admin-vacations-management.scss',
})
export class AdminVacationsManagement {
  activeTab = signal<string>('0');
  viewCreateDialog = signal<boolean>(false);
  holidaysFilterService = inject(HolidaysFilterService);
  router = inject(Router);

  onAddHoliday() {
    this.viewCreateDialog.set(true);
  }

  applyFilter() {
    this.holidaysFilterService.applyFilterWithPaging();
  }

  goBack() {
    this.router.navigate([`/${ERoutes.settings}`]);
  }
}

