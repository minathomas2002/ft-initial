import { Component, Inject, inject, model, signal } from '@angular/core';
import { AdminSettingsStore } from 'src/app/shared/stores/settings/admin-settings.store';
import { TranslatePipe } from "../../../../shared/pipes/translate.pipe";
import { BaseDialogComponent } from "src/app/shared/components/base-components/base-dialog/base-dialog.component";
import { Tabs, TabList, Tab, TabPanels, TabPanel } from "primeng/tabs";
import { AdminNotificationForm } from "../admin-notification-system-form/admin-notification-system-form";
import { AdminNotificationEmailForm } from "../admin-notification-email-form/admin-notification-email-form";
import { INotificationSettingUpdateRequest, INotificationSettingUpdateRequestBody } from 'src/app/shared/interfaces/ISetting';
import { ENotificationChannel } from 'src/app/shared/enums/notificationSetting.enum';
import { take, tap } from 'rxjs';
import { I18nService } from 'src/app/shared/services/i18n';
import { ToasterService } from 'src/app/shared/services/toaster/toaster.service';

@Component({
  selector: 'app-admin-notification-dialog',
  imports: [TranslatePipe, BaseDialogComponent, Tabs, TabList, Tab, TabPanels, TabPanel, AdminNotificationForm, AdminNotificationEmailForm],
  templateUrl: './admin-notification-dialog.html',
  styleUrl: './admin-notification-dialog.scss',
})
export class AdminNotificationDialog {

  settingAdminStore = inject(AdminSettingsStore);
  dialogVisible = model<boolean>(false);
  systemTabClicked = model<number>(1);
  emailTabClicked = model<number>(1);
  activeTab = signal<string>('0');
  systemNotification :INotificationSettingUpdateRequestBody[] = [];
  emailNotification :INotificationSettingUpdateRequestBody[] = [];
  i18nService = inject(I18nService);
  toasterService = inject(ToasterService);
  

  ngOnInit(){
    this.settingAdminStore.getNotificationSetting(ENotificationChannel.System, 'systemNotification').subscribe();
    this.settingAdminStore.getNotificationSetting(ENotificationChannel.Email, 'emailNotification').subscribe();

  
  }
  onConfirm(){
    this.dialogVisible.set(false);
    const body :INotificationSettingUpdateRequestBody[] = [
      ...this.systemNotification,
      ...this.emailNotification
    ];
    const request: INotificationSettingUpdateRequest={
      requests: body
    };
  this.settingAdminStore
    .updateNotificationSetting(request)
    .pipe(
      tap((res) => {
        if (res.errors) {
          this.dialogVisible.set(false);
          return;
        }
      }),
      take(1),
    )
    .subscribe({
      next: (res) => {
        if (res.success) {
          this.toasterService.success(this.i18nService.translate('setting.adminView.notification.notificationSuccessMessage'));
          this.dialogVisible.set(false);
        }
      }
    }
    );
   }

  onClose(){
    this.dialogVisible.set(false);
    //
  }
}
