import { Component, inject, model } from '@angular/core';
import { adminSettingsStore } from 'src/app/shared/stores/settings/admin-settings.store';

@Component({
  selector: 'app-admin-notification-dialog',
  imports: [],
  templateUrl: './admin-notification-dialog.html',
  styleUrl: './admin-notification-dialog.scss',
})
export class AdminNotificationDialog {

  settingAdminStore = inject(adminSettingsStore);
   dialogVisible = model<boolean>(false);
}
