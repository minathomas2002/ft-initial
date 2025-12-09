import { Component, signal, Signal } from '@angular/core';
import { TranslatePipe } from "../../../../shared/pipes/translate.pipe";
import { CardsPageLayout } from 'src/app/shared/components/layout-components/cards-page-layout/cards-page-layout';
import { CardsSkeleton } from "src/app/shared/components/skeletons/cards-skeleton/cards-skeleton";
import { SettingCard } from "../../components/setting-card/setting-card";
import { AdminSlaDialog } from "../../components/adminSlaDialog/admin-sla-dialog/admin-sla-dialog";

@Component({
  selector: 'app-admin-setting-view',
  imports: [TranslatePipe, CardsPageLayout, CardsSkeleton, SettingCard, AdminSlaDialog],
  templateUrl: './admin-setting-view.html',
  styleUrl: './admin-setting-view.scss',
})
export class AdminSettingView {

viewSlaDialog = signal<boolean>(false);
viewAutoAssignDialog = signal<boolean>(false);
viewNotificationDialog = signal<boolean>(false);
  onSLAClick(){
    console.log("onSLAClick");
    
    this.viewSlaDialog.set(true);
  }

  onAutoAssigenClick(){
    console.log("onAutoAssigenClick");
    this.viewAutoAssignDialog.set(true);

  }

  onNotificationClick(){
    console.log("onNotificationClick");
    this.viewNotificationDialog.set(true);

  }
}
