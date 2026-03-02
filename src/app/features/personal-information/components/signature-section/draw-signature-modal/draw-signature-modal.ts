import { ChangeDetectionStrategy, Component, input, model, output, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { BaseDialogComponent } from 'src/app/shared/components/base-components/base-dialog/base-dialog.component';
import { SignaturePadComponent } from 'src/app/shared/components/plans/submission-confirmation-modal/signature-pad/signature-pad.component';
import { FileuploadComponent } from 'src/app/shared/components/utility-components/fileupload/fileupload.component';

@Component({
  selector: 'app-draw-signature-modal',
  imports: [
    BaseDialogComponent,
    SignaturePadComponent,
    ButtonModule,
  ],
  templateUrl: './draw-signature-modal.html',
  styleUrl: './draw-signature-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DrawSignatureModal {
  visible = model<boolean>(false);
  isProcessing = input(false);
  onSubmitSignature = output<string | null>();

  icon = signal<string>('icon-edit-04');
  confirmLabel = signal<string>('Submit');
  cancelLabel = signal<string>('Back');
  signature = signal<string | null>(null);

  onSignatureChange(signature: string | null): void {
    this.signature.set(signature);
  }

  onSubmitClick(): void {
    this.onSubmitSignature.emit(this.signature());
  }
}
