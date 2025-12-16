import { Component, inject, model, signal } from '@angular/core';
import { AdminSettingsStore } from 'src/app/shared/stores/settings/admin-settings.store';
import { TranslatePipe } from "../../../../shared/pipes/translate.pipe";
import { BaseDialogComponent } from "src/app/shared/components/base-components/base-dialog/base-dialog.component";
import { Tabs, TabList, Tab, TabPanels, TabPanel } from "primeng/tabs";
import { AdminNotificationForm } from "../admin-notification-system-form/admin-notification-system-form";
import { NotificationFormService } from '../../services/notification-form/notification-form-service';
import { AdminNotificationEmailForm } from "../admin-notification-email-form/admin-notification-email-form";
import { EmailNotificationFormService } from '../../services/email-notification-form/email-notification-form-service';
import { INotificationSettingUpdateRequest } from 'src/app/shared/interfaces/ISetting';

@Component({
  selector: 'app-admin-notification-dialog',
  imports: [TranslatePipe, BaseDialogComponent, Tabs, TabList, Tab, TabPanels, TabPanel, AdminNotificationForm, AdminNotificationEmailForm],
  templateUrl: './admin-notification-dialog.html',
  styleUrl: './admin-notification-dialog.scss',
})
export class AdminNotificationDialog {

  settingAdminStore = inject(AdminSettingsStore);
  dialogVisible = model<boolean>(false);
  activeTab = signal<string>('0');
  systemNotification :INotificationSettingUpdateRequest[] = [];
  emailNotification :INotificationSettingUpdateRequest[] = [];
  

   onConfirm(){
    this.dialogVisible.set(false);
    console.log(this.systemNotification);
    console.log(this.emailNotification);
   }


  onClose(){
    this.dialogVisible.set(false);
    //
  }
}
