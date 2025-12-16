import { Component,inject,input, model } from '@angular/core';
import { NotificationFormService } from '../../services/notification-form/notification-form-service';
import { ToggleSwitch } from "primeng/toggleswitch";
import { FormsModule } from '@angular/forms';
import { Tooltip } from "primeng/tooltip";
import { TranslatePipe } from "../../../../shared/pipes/translate.pipe";
import { Divider } from "primeng/divider";
import { BaseLabelComponent } from "src/app/shared/components/base-components/base-label/base-label.component";
import { INotificationSettingUpdateRequest, INotificationSettingUpdateRequestBody, IRecipientToggle } from 'src/app/shared/interfaces/ISetting';
import { AdminSettingsStore } from 'src/app/shared/stores/settings/admin-settings.store';
import { ENotificationChannel } from 'src/app/shared/enums/notificationSetting.enum';
import { I18nService } from 'src/app/shared/services/i18n';
import { notificationSettingMapper } from '../../classes/notification-setting-mapper';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-notification-form',
  imports: [ToggleSwitch, FormsModule, Tooltip, TranslatePipe, Divider, BaseLabelComponent,CommonModule],
  templateUrl: './admin-notification-system-form.html',
  styleUrl: './admin-notification-system-form.scss',
})
export class AdminNotificationForm {
  changesArray = input.required<INotificationSettingUpdateRequestBody[]>();
  settingAdminStore = inject(AdminSettingsStore);
  i18nService = inject(I18nService);
  settingMapper = new notificationSettingMapper(this.i18nService);


   OnToggleChange(recipient: IRecipientToggle, isEnabled: boolean){    
    recipient.isEnabled = isEnabled;  
      //check if key exisit or push new
      if(this.changesArray().some(x=>x.id == recipient.settingId)){
        const index = this.changesArray().findIndex(x => x.id === recipient.settingId);
         this.changesArray()[index].isEnabled = isEnabled;
      }else{
        this.changesArray().push(
              {
              id: recipient.settingId, 
              isEnabled: isEnabled,
              channel : ENotificationChannel.System,
            }
        );
      }

    }

   

}
