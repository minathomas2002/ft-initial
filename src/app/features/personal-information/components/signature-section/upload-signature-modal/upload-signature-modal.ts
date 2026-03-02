import { ChangeDetectionStrategy, Component, inject, input, model, output, signal } from '@angular/core';
import { BaseDialogComponent } from 'src/app/shared/components/base-components/base-dialog/base-dialog.component';
import { FileuploadComponent } from 'src/app/shared/components/utility-components/fileupload/fileupload.component';
import { AttachmentService } from 'src/app/shared/services/attachment/attachment.service';

@Component({
  selector: 'app-upload-signature-modal',
  imports: [
    BaseDialogComponent,
    FileuploadComponent
  ],
  templateUrl: './upload-signature-modal.html',
  styleUrl: './upload-signature-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadSignatureModal {
  visible = model<boolean>(false);
  isProcessing = input(false);
  onSubmitSignature = output<string | null>();
  private attachmentService = inject(AttachmentService);

  icon = signal<string>('icon-file-upload');
  confirmLabel = signal<string>('Submit');
  cancelLabel = signal<string>('Back');

  maxFileSize = 1024 * 1024 * 2; // 2MB
  acceptedFileTypes = '.png, .jpg';
  files = model<File[]>([]);

  onCloseClick() {
    this.files.set([]);
  }

  onSubmitClick(): void {
    this.attachmentService.resizeImages(this.files()[0], 300).then((res) => {
      this.attachmentService.fileToBase64(res).then((base64) => {
        this.onSubmitSignature.emit(base64);
      });
    });
  }
}
