import { Component, inject, input, OnInit } from '@angular/core';
import { EmailNotificationFormService } from '../../services/email-notification-form/email-notification-form-service';
import { TranslatePipe } from "../../../../shared/pipes/translate.pipe";
import { Tooltip } from "primeng/tooltip";
import { Divider } from "primeng/divider";
import { BaseLabelComponent } from "src/app/shared/components/base-components/base-label/base-label.component";
import { ToggleSwitch } from "primeng/toggleswitch";
import { FormsModule } from '@angular/forms';
import { INotificationSettingUpdateRequest, IRecipientToggle } from 'src/app/shared/interfaces/ISetting';
import { AdminSettingsStore } from 'src/app/shared/stores/settings/admin-settings.store';
import { ENotificationChannel } from 'src/app/shared/enums/notificationSetting.enum';
import { I18nService } from 'src/app/shared/services/i18n';
import { notificationSettingMapper } from '../../classes/notification-setting-mapper';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-notification-email-form',
  imports: [TranslatePipe, Tooltip, Divider, BaseLabelComponent, ToggleSwitch,FormsModule, CommonModule],
  templateUrl: './admin-notification-email-form.html',
  styleUrl: './admin-notification-email-form.scss',
})
export class AdminNotificationEmailForm implements OnInit {
 

  changesArray = input.required<INotificationSettingUpdateRequest[]>();
  settingAdminStore = inject(AdminSettingsStore);
  i18nService = inject(I18nService);
  settingMapper = new notificationSettingMapper(this.i18nService);

  ngOnInit(){
    if(this.settingAdminStore.emailNotification.length ===0)
      this.loadEmailNotification();
  }
  
  
  loadEmailNotification(){
    this.settingAdminStore.getNotificationSetting(ENotificationChannel.Email, 'emailNotification').subscribe();
    //console.log(this.settingAdminStore.emailNotification);
    
  }

  OnToggleChange(recipient: IRecipientToggle, isEnabled: boolean){
      console.log(recipient);
      
      // check if key exisit or push new
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
