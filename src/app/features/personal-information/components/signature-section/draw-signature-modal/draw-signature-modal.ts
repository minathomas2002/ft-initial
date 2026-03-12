import { ChangeDetectionStrategy, Component, inject, input, model, output, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { BaseDialogComponent } from 'src/app/shared/components/base-components/base-dialog/base-dialog.component';
import { SignaturePadComponent } from 'src/app/shared/components/form/signature-pad/signature-pad.component';
import { TranslatePipe } from 'src/app/shared/pipes/translate.pipe';
import { I18nService } from 'src/app/shared/services/i18n';

@Component({
  selector: 'app-draw-signature-modal',
  imports: [
    BaseDialogComponent,
    TranslatePipe,
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
  private readonly i18n = inject(I18nService);

  icon = signal<string>('icon-edit-04');
  confirmLabel = signal<string>(this.i18n.translate('common.submit'));
  cancelLabel = signal<string>(this.i18n.translate('common.back'));
  signature = signal<string | null>(null);

  onSignatureChange(signature: string | null): void {
    this.signature.set(signature);
  }

  onSubmitClick(): void {
    this.onSubmitSignature.emit(this.signature());
  }
}
