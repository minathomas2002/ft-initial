import { AfterViewInit, ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, input, output, signal } from '@angular/core';
import { PersonalInformationCard } from '../personal-information-card/personal-information-card';
import { EViewMode } from 'src/app/shared/enums';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { UploadSignatureModal } from './upload-signature-modal/upload-signature-modal';
import { DrawSignatureModal } from './draw-signature-modal/draw-signature-modal';
import { ProfileStore } from 'src/app/shared/stores/profile/profile.store';
import { ToasterService } from 'src/app/shared/services/toaster/toaster.service';
import { take } from 'rxjs';
import { IUpdateSignatureRequest } from 'src/app/shared/interfaces';
import { GeneralConfirmationDialogComponent } from 'src/app/shared/components/utility-components/general-confirmation-dialog/general-confirmation-dialog.component';
import { AuthStore } from 'src/app/shared/stores/auth/auth.store';

@Component({
  selector: 'app-signature-section',
  imports: [
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
export class SignatureSection implements AfterViewInit {
  viewMode = input<EViewMode>(EViewMode.View);
  isViewMode = computed(() => this.viewMode() === EViewMode.View);
  private readonly profileStore = inject(ProfileStore);
  private readonly toasterService = inject(ToasterService);
  private readonly elementRef = inject(ElementRef);
  onSignatureUpdate = output<void>();
  private authStore = inject(AuthStore);
  isImpersonated = computed(() => this.authStore.isImpersonating());

  isSignatureProcessing = this.profileStore.signatureProcessing;
  existingSignature = computed(() => this.profileStore.userProfile()?.signature || '');

  constructor() {
    effect(() => {
      if (this.isViewMode() && !this.existingSignature()) {
        setTimeout(() => this.blurIfFocusedInSection(), 0);
        setTimeout(() => this.blurIfFocusedInSection(), 150);
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.isViewMode() && !this.existingSignature()) {
      setTimeout(() => this.blurIfFocusedInSection(), 100);
    }
  }

  private blurIfFocusedInSection(): void {
    if (typeof document === 'undefined') return;
    const active = document.activeElement as HTMLElement;
    const host = this.elementRef.nativeElement as HTMLElement;
    if (active && host?.contains(active)) {
      active.blur();
    }
  }

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
          this.toasterService.success('Signature updated successfully');
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
            this.toasterService.success('Signature deleted successfully');
            this.deleteSignatureConfirmVisible.set(false);
          }
        },
        error: () => {
          this.deleteSignatureConfirmVisible.set(false);
        },
      });
  }
}
