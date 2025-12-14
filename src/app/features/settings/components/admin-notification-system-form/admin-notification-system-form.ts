import { Component,input } from '@angular/core';
import { NotificationFormService } from '../../services/notification-form/notification-form-service';
import { ToggleSwitch } from "primeng/toggleswitch";
import { FormsModule } from '@angular/forms';
import { Tooltip } from "primeng/tooltip";
import { TranslatePipe } from "../../../../shared/pipes/translate.pipe";
import { Divider } from "primeng/divider";
import { BaseLabelComponent } from "src/app/shared/components/base-components/base-label/base-label.component";

@Component({
  selector: 'app-admin-notification-form',
  imports: [ToggleSwitch, FormsModule, Tooltip, TranslatePipe, Divider, BaseLabelComponent],
  templateUrl: './admin-notification-system-form.html',
  styleUrl: './admin-notification-system-form.scss',
})
export class AdminNotificationForm {

  formService = input.required<NotificationFormService>();

   

}
