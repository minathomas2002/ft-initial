import { ChangeDetectionStrategy, Component, inject, input, model, output, signal } from '@angular/core';
import { BaseDialogComponent } from 'src/app/shared/components/base-components/base-dialog/base-dialog.component';
import { FileuploadComponent } from 'src/app/shared/components/utility-components/fileupload/fileupload.component';
import { TranslatePipe } from 'src/app/shared/pipes/translate.pipe';
import { AttachmentService } from 'src/app/shared/services/attachment/attachment.service';
import { I18nService } from 'src/app/shared/services/i18n';

@Component({
  selector: 'app-upload-signature-modal',
  imports: [
    BaseDialogComponent,
    TranslatePipe,
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
  private readonly i18n = inject(I18nService);

  icon = signal<string>('icon-file-upload');
  confirmLabel = signal<string>(this.i18n.translate('common.submit'));
  cancelLabel = signal<string>(this.i18n.translate('common.back'));

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
