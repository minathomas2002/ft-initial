import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { PersonalInformationCard } from '../personal-information-card/personal-information-card';
import { SignaturePadComponent } from 'src/app/shared/components/plans/submission-confirmation-modal/signature-pad/signature-pad.component';
import { EViewMode } from 'src/app/shared/enums';
import { ButtonModule } from 'primeng/button';
import { ImageModule } from 'primeng/image';
import { UploadSignatureModal } from './upload-signature-modal/upload-signature-modal';
import { DrawSignatureModal } from './draw-signature-modal/draw-signature-modal';

@Component({
  selector: 'app-signature-section',
  imports: [
    PersonalInformationCard,
    ButtonModule,
    ImageModule,
    UploadSignatureModal,
    DrawSignatureModal
  ],
  templateUrl: './signature-section.html',
  styleUrl: './signature-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignatureSection {
  viewMode = input<EViewMode>(EViewMode.View);
  isViewMode = computed(() => this.viewMode() === EViewMode.View);
  existingSignature = signal<string | null>(null);

  uploadSignatureModalVisible = signal<boolean>(false);
  drawSignatureModalVisible = signal<boolean>(false);

  onAddSignatureClick(): void {
    this.drawSignatureModalVisible.set(true);
  }

  onChangeSignatureClick(): void {
    this.uploadSignatureModalVisible.set(true);
  }

  onSubmitSignature(signature: string | null): void {
    this.existingSignature.set(signature);
  }

  onDeleteSignatureClick(): void { }
}
