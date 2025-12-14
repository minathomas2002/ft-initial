import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { EmailNotificationFormService } from '../../services/email-notification-form/email-notification-form-service';
import { TranslatePipe } from "../../../../shared/pipes/translate.pipe";
import { Tooltip } from "primeng/tooltip";
import { Divider } from "primeng/divider";
import { BaseLabelComponent } from "src/app/shared/components/base-components/base-label/base-label.component";
import { ToggleSwitch } from "primeng/toggleswitch";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-notification-email-form',
  imports: [TranslatePipe, Tooltip, Divider, BaseLabelComponent, ToggleSwitch, FormsModule],
  templateUrl: './admin-notification-email-form.html',
  styleUrl: './admin-notification-email-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminNotificationEmailForm {

  formService = input.required<EmailNotificationFormService>();

}
