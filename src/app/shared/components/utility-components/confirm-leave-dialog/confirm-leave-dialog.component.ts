import { ChangeDetectionStrategy, Component, model, output } from '@angular/core';
import { BaseDialogComponent } from '../../base-components/base-dialog/base-dialog.component';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-confirm-leave-dialog',
  imports: [BaseDialogComponent, ButtonModule],
  templateUrl: './confirm-leave-dialog.component.html',
  styleUrl: './confirm-leave-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmLeaveDialogComponent {
  visible = model<boolean>(false);
  onLeave = output<void>();
  onContinueEditing = output<void>();

  handleLeave(): void {
    this.onLeave.emit();
    this.visible.set(false);
  }

  handleContinueEditing(): void {
    this.onContinueEditing.emit();
    this.visible.set(false);
  }

  handleClose(): void {
    this.onContinueEditing.emit();
    this.visible.set(false);
  }
}
