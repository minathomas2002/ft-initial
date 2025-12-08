import { ChangeDetectionStrategy, Component, model, output, signal } from '@angular/core';
import { BaseDialogComponent } from '../../base-components/base-dialog/base-dialog.component';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-plan-terms-and-conditions-dialog',
  imports: [BaseDialogComponent, CheckboxModule, FormsModule],
  templateUrl: './plan-terms-and-conditions-dialog.html',
  styleUrls: ['./plan-terms-and-conditions-dialog.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanTermsAndConditionsDialog {
  visibility = model(false);
  isUserReadAndApproved = signal(false);
  onConfirm = output<void>();
  onCancel = output<void>();
}
