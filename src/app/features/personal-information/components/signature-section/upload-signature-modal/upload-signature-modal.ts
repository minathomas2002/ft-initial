import { ChangeDetectionStrategy, Component, input, model, output, signal } from '@angular/core';
import { BaseDialogComponent } from 'src/app/shared/components/base-components/base-dialog/base-dialog.component';

@Component({
  selector: 'app-upload-signature-modal',
  imports: [BaseDialogComponent],
  templateUrl: './upload-signature-modal.html',
  styleUrl: './upload-signature-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadSignatureModal {
  visible = model<boolean>(false);
  onSubmitSignature = output<string | null>();

  icon = signal<string>('icon-file-upload');
  confirmLabel = signal<string>('Submit');
  cancelLabel = signal<string>('Back');

  onSubmitClick(): void {
    this.onSubmitSignature.emit('');
  }
}
