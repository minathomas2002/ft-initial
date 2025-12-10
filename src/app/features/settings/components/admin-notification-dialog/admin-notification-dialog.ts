import { Component, inject, model, signal } from '@angular/core';
import { adminSettingsStore } from 'src/app/shared/stores/settings/admin-settings.store';
import { TranslatePipe } from "../../../../shared/pipes/translate.pipe";
import { BaseDialogComponent } from "src/app/shared/components/base-components/base-dialog/base-dialog.component";
import { Tabs, TabList, Tab, TabPanels, TabPanel } from "primeng/tabs";
import { AdminNotificationForm } from "../admin-notification-system-form/admin-notification-system-form";
import { NotificationFormService } from '../../services/notification-form-service';

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
  systemTabformService = inject(NotificationFormService);
  emailTabformService = inject(NotificationFormService);

   onConfirm(){
    this.dialogVisible.set(false);
    console.log(this.systemTabformService.getPayload());
    console.log(this.emailTabformService.getPayload());
   }


   onClose(){
    this.dialogVisible.set(false);
   }
}
