import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { PersonalInformationCard } from '../personal-information-card/personal-information-card';
import { SignaturePadComponent } from 'src/app/shared/components/plans/submission-confirmation-modal/signature-pad/signature-pad.component';
import { EViewMode } from 'src/app/shared/enums';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { UploadSignatureModal } from './upload-signature-modal/upload-signature-modal';
import { DrawSignatureModal } from './draw-signature-modal/draw-signature-modal';
import { ProfileStore } from 'src/app/shared/stores/profile/profile.store';
import { ToasterService } from 'src/app/shared/services/toaster/toaster.service';

@Component({
  selector: 'app-signature-section',
  imports: [
    PersonalInformationCard,
    ButtonModule,
    DialogModule,
    UploadSignatureModal,
    DrawSignatureModal,
  ],
  templateUrl: './signature-section.html',
  styleUrl: './signature-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignatureSection {
  viewMode = input<EViewMode>(EViewMode.View);
  isViewMode = computed(() => this.viewMode() === EViewMode.View);
  private readonly profileStore = inject(ProfileStore);
  private readonly toasterService = inject(ToasterService);
  onSignatureUpdate = output<void>();

  isSignatureProcessing = this.profileStore.signatureProcessing;
  existingSignature = computed(() => this.profileStore.userProfile()?.signature || '');

  uploadSignatureModalVisible = signal<boolean>(false);
  drawSignatureModalVisible = signal<boolean>(false);
  signaturePreviewVisible = signal<boolean>(false);

  onAddSignatureClick(): void {
    this.drawSignatureModalVisible.set(true);
  }

  onChangeSignatureClick(): void {
    this.uploadSignatureModalVisible.set(true);
  }

  onSubmitSignature(signature: string | null): void {
    this.profileStore.updateSignature(signature).subscribe((res) => {
      if (res.success) {
        this.toasterService.success('Signature updated successfully');
        this.drawSignatureModalVisible.set(false);
      }
    });
  }

  onDeleteSignatureClick(): void {
    this.onSubmitSignature('');
  }
}
