import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { BaseDialogComponent } from '../../base-components/base-dialog/base-dialog.component';
import { FormsModule } from '@angular/forms';
import { TextareaModule } from 'primeng/textarea';
import { BaseLabelComponent } from "../../base-components/base-label/base-label.component";

@Component({
  selector: 'app-approve-reject-dialog',
  imports: [BaseDialogComponent, FormsModule, TextareaModule, BaseLabelComponent],
  templateUrl: './approve-reject-dialog.component.html',
  styleUrl: './approve-reject-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApproveRejectDialogComponent {
  title = input<string>('');
  label = input<string>('');
  placeholder = input<string>('');
  maxLength = input<number>(255);
  note = model<string>('');
  confirmationLabel = input<string>('Confirm');
  cancelLabel = input<string>('Cancel');
  icon = input<string>('icon-info');
  visible = model(false);
  confirmed = output();
  onCancel = output();
  isLoading = input(false);
  isRequired = input(false);

  onConfirm(): void {
    if (this.isRequired() && !this.note().trim()) {
      return;
    }
    this.confirmed.emit();
  }

  onCancelClick(): void {
    this.onCancel.emit();
  }
}
