import { Component, input, model, output } from '@angular/core';
import { BaseDialogComponent } from '../../base-components/base-dialog/base-dialog.component';

@Component({
  selector: 'app-general-confirmation-dialog',
  imports: [BaseDialogComponent],
  templateUrl: './general-confirmation-dialog.component.html',
  styleUrl: './general-confirmation-dialog.component.scss',
})
export class GeneralConfirmationDialogComponent {
  title = input<string>('Are you sure you want to proceed with this update?');
  confirmationLabel = input<string>('Ok');
  icon = input<string>('icon-x-close');
  description = input<string>();
  visible = model(false);
  confirmed = output();
  closed = output();
  isLoading = input(false)
  classes = input('max-w-[20rem]')
}
