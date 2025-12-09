import { ChangeDetectionStrategy, Component, model, output } from '@angular/core';
import { BaseDialogComponent } from '../../base-components/base-dialog/base-dialog.component';

@Component({
  selector: 'app-new-plan-dialog',
  imports: [BaseDialogComponent],
  templateUrl: './new-plan-dialog.html',
  styleUrl: './new-plan-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewPlanDialog {
  visibility = model<boolean>(false);
  onConfirm = output<void>();
  onCancel = output<void>();
}
