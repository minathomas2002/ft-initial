import { ChangeDetectionStrategy, Component, inject, signal, Signal } from '@angular/core';
import { TranslatePipe } from "../../../../../shared/pipes/translate.pipe";
import { CardsPageLayout } from 'src/app/shared/components/layout-components/cards-page-layout/cards-page-layout';
import { CardsSkeleton } from "src/app/shared/components/skeletons/cards-skeleton/cards-skeleton";
import { SettingCard } from "../../../components/setting-card/setting-card";
import { AdminSlaDialog } from "../../../components/admin-sla-dialog/admin-sla-dialog";
import { AdminAutoAssignDialog } from "../../../components/admin-auto-assign-dialog/admin-auto-assign-dialog";
import { AdminNotificationDialog } from "../../../components/admin-notification-dialog/admin-notification-dialog";
import { Router } from '@angular/router';
import { ERoutes } from 'src/app/shared/enums';

@Component({
  selector: 'app-admin-setting-view',
  imports: [TranslatePipe, CardsPageLayout, CardsSkeleton, SettingCard, AdminSlaDialog, AdminAutoAssignDialog, AdminNotificationDialog],
  templateUrl: './admin-setting-view.html',
  styleUrl: './admin-setting-view.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
