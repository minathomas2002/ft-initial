import { Component, inject, model, signal } from '@angular/core';
import { adminSettingsStore } from 'src/app/shared/stores/settings/admin-settings.store';
import { TranslatePipe } from "../../../../shared/pipes/translate.pipe";
import { BaseDialogComponent } from "src/app/shared/components/base-components/base-dialog/base-dialog.component";
import { Tabs, TabList, Tab, TabPanels, TabPanel } from "primeng/tabs";
import { AdminNotificationForm } from "../admin-notification-form/admin-notification-form";

@Component({
  selector: 'app-admin-notification-dialog',
  imports: [TranslatePipe, BaseDialogComponent, Tabs, TabList, Tab, TabPanels, TabPanel, AdminNotificationForm],
  templateUrl: './admin-notification-dialog.html',
  styleUrl: './admin-notification-dialog.scss',
})
export class AdminNotificationDialog {

  settingAdminStore = inject(adminSettingsStore);
   dialogVisible = model<boolean>(false);
  activeTab = signal<string>('0');

   onConfirm(){
    this.dialogVisible.set(false);

   }


   onClose(){
    this.dialogVisible.set(false);
   }
}
