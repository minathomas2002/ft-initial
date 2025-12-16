import { Component, inject, signal, Signal } from '@angular/core';
import { CardsPageLayout } from 'src/app/shared/components/layout-components/cards-page-layout/cards-page-layout';
import { CardsSkeleton } from "src/app/shared/components/skeletons/cards-skeleton/cards-skeleton";
import { Router } from '@angular/router';
import { ERoutes } from 'src/app/shared/enums';
import { TranslatePipe } from 'src/app/shared/pipes';
import { AdminAutoAssignDialog } from '../../components/admin-auto-assign-dialog/admin-auto-assign-dialog';
import { AdminNotificationDialog } from '../../components/admin-notification-dialog/admin-notification-dialog';
import { AdminSlaDialog } from '../../components/admin-sla-dialog/admin-sla-dialog';
import { SettingCard } from '../../components/setting-card/setting-card';

@Component({
  selector: 'app-admin-setting-view',
  imports: [TranslatePipe, CardsPageLayout, CardsSkeleton, SettingCard, AdminSlaDialog, AdminAutoAssignDialog, AdminNotificationDialog],
  templateUrl: './admin-setting-view.html',
  styleUrl: './admin-setting-view.scss',
})
export class AdminSettingView {

  viewSlaDialog = signal<boolean>(false);
  viewAutoAssignDialog = signal<boolean>(false);
  viewNotificationDialog = signal<boolean>(false);
  viewHolidaysDialog = signal<boolean>(false);
  router = inject(Router);

  onSLAClick() {
    this.viewSlaDialog.set(true);
  }

  onAutoAssigenClick() {
    this.viewAutoAssignDialog.set(true);
  }

  onNotificationClick() {
    this.viewNotificationDialog.set(true);
  }

  onHolidaysClick() {
    this.router.navigate([`/${ERoutes.settings}/${ERoutes.holidaysManagement}`]);
  }
}
