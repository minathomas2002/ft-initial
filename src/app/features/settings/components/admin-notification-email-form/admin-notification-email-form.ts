import { ChangeDetectionStrategy, Component, inject, input, model, OnInit } from '@angular/core';
import { TranslatePipe } from "../../../../shared/pipes/translate.pipe";
import { Tooltip } from "primeng/tooltip";
import { Divider } from "primeng/divider";
import { BaseLabelComponent } from "src/app/shared/components/base-components/base-label/base-label.component";
import { ToggleSwitch } from "primeng/toggleswitch";
import { FormsModule } from '@angular/forms';
import { INotificationSettingUpdateRequestBody, IRecipientToggle } from 'src/app/shared/interfaces/ISetting';
import { AdminSettingsStore } from 'src/app/shared/stores/settings/admin-settings.store';
import { ENotificationChannel } from 'src/app/shared/enums/notificationSetting.enum';
import { I18nService } from 'src/app/shared/services/i18n';
import { notificationSettingMapper } from '../../classes/notification-setting-mapper';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-notification-email-form',
  imports: [TranslatePipe, Tooltip, Divider, BaseLabelComponent, ToggleSwitch, FormsModule, CommonModule],
  templateUrl: './admin-notification-email-form.html',
  styleUrl: './admin-notification-email-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminNotificationEmailForm {
  changesArray = input.required<INotificationSettingUpdateRequestBody[]>();
  settingAdminStore = inject(AdminSettingsStore);
  i18nService = inject(I18nService);
  settingMapper = new notificationSettingMapper(this.i18nService);


  OnToggleChange(recipient: IRecipientToggle, toggleEnabled: boolean) {
    recipient.isEnabled = toggleEnabled;
    //check if key exist or push new
    if (this.changesArray().some(x => x.id == recipient.settingId)) {
      const index = this.changesArray().findIndex(x => x.id === recipient.settingId);
      this.changesArray()[index].isEnabled = toggleEnabled;
    } else {
      this.changesArray().push(
        {
          id: recipient.settingId,
          isEnabled: toggleEnabled,
          channel: ENotificationChannel.Email,
        }
      );
    }

  }


}
