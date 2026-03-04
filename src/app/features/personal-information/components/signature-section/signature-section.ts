import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { PersonalInformationCard } from '../personal-information-card/personal-information-card';
import { EViewMode } from 'src/app/shared/enums';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { UploadSignatureModal } from './upload-signature-modal/upload-signature-modal';
import { DrawSignatureModal } from './draw-signature-modal/draw-signature-modal';
import { ProfileStore } from 'src/app/shared/stores/profile/profile.store';
import { ToasterService } from 'src/app/shared/services/toaster/toaster.service';
import { I18nService } from 'src/app/shared/services/i18n';
import { take } from 'rxjs';
import { IUpdateSignatureRequest } from 'src/app/shared/interfaces';
import { GeneralConfirmationDialogComponent } from 'src/app/shared/components/utility-components/general-confirmation-dialog/general-confirmation-dialog.component';
import { TranslatePipe } from 'src/app/shared/pipes/translate.pipe';

@Component({
  selector: 'app-signature-section',
  imports: [
    TranslatePipe,
    PersonalInformationCard,
    ButtonModule,
    DialogModule,
    UploadSignatureModal,
    DrawSignatureModal,
    GeneralConfirmationDialogComponent,
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
  private readonly i18nService = inject(I18nService);
  onSignatureUpdate = output<void>();

  isSignatureProcessing = this.profileStore.signatureProcessing;
  existingSignature = computed(() => this.profileStore.userProfile()?.signature || '');

  uploadSignatureModalVisible = signal<boolean>(false);
  drawSignatureModalVisible = signal<boolean>(false);
  signaturePreviewVisible = signal<boolean>(false);
  deleteSignatureConfirmVisible = signal<boolean>(false);

  onAddSignatureClick(): void {
    this.drawSignatureModalVisible.set(true);
  }

  onChangeSignatureClick(): void {
    this.uploadSignatureModalVisible.set(true);
  }

  onSubmitSignature(signature: string | null): void {
    const userSignatureId = this.profileStore.userProfile()?.userSignatureId ?? '';
    const signatureRequest: IUpdateSignatureRequest = {
      userSignatureId: userSignatureId,
      signatureBase64: signature ?? '',
    }
    this.profileStore.updateSignature(signatureRequest)
      .pipe(take(1))
      .subscribe((res) => {
        if (res.success) {
          this.toasterService.success(this.i18nService.translate('profile.messages.signatureUpdated'));
          this.drawSignatureModalVisible.set(false);
          this.uploadSignatureModalVisible.set(false);
          this.onSignatureUpdate.emit();
        }
      });
  }

  onDeleteSignatureClick(): void {
    this.deleteSignatureConfirmVisible.set(true);
  }

  onConfirmDeleteSignature(): void {
    const signatureRequest: IUpdateSignatureRequest = {
      userSignatureId: this.profileStore.userProfile()?.userSignatureId ?? '',
      signatureBase64: '',
    };
    this.profileStore.updateSignature(signatureRequest)
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.profileStore.getUserProfile().pipe(take(1)).subscribe();
            this.toasterService.success(this.i18nService.translate('profile.messages.signatureDeleted'));
            this.deleteSignatureConfirmVisible.set(false);
          }
        },
        error: () => {
          this.deleteSignatureConfirmVisible.set(false);
        },
      });
  }
}
