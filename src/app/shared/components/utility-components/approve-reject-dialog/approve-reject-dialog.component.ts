import { ChangeDetectionStrategy, Component, computed, effect, inject, input, model, output } from '@angular/core';
import { BaseDialogComponent } from '../../base-components/base-dialog/base-dialog.component';
import { FormsModule } from '@angular/forms';
import { TextareaModule } from 'primeng/textarea';
import { BaseLabelComponent } from "../../base-components/base-label/base-label.component";
import { SignaturePadComponent } from "../../form/signature-pad/signature-pad.component";
import { TranslatePipe } from 'src/app/shared/pipes';
import { ProfileStore } from 'src/app/shared/stores/profile/profile.store';
import { take } from 'rxjs';

@Component({
  selector: 'app-approve-reject-dialog',
  imports: [BaseDialogComponent, FormsModule, TextareaModule, BaseLabelComponent, SignaturePadComponent],
  templateUrl: './approve-reject-dialog.component.html',
  styleUrl: './approve-reject-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApproveRejectDialogComponent {
  title = input<string>('');
  label = input<string>('');
  placeholder = input<string>('');
  maxLength = input<number>(255);
  note = model<string>('');
  confirmationLabel = input<string>('Confirm');
  cancelLabel = input<string>('Cancel');
  icon = input<string>('icon-info');
  visible = model(false);
  confirmed = output();
  onCancel = output();
  isLoading = input(false);
  isRequired = input(false);
  confirmButtonSeverity = input<'primary' | 'secondary' | 'success' | 'info' | 'danger' | 'help'>("primary");
  showSignaturePad = input(false);
  signatureRequired = input(false);

  existingSignature = model<string | null>(null);
  signature = model<string | null>(null);

  private readonly profileStore = inject(ProfileStore);
  private hasFetchedSignatureForCurrentOpen = false;

  constructor() {
    effect(() => {
      const isVisible = this.visible();
      const showPad = this.showSignaturePad();

      if (isVisible && showPad) {
        if (!this.hasFetchedSignatureForCurrentOpen) {
          this.hasFetchedSignatureForCurrentOpen = true;
          this.profileStore.getUserProfile()
            .pipe(take(1))
            .subscribe({
              next: (res) => {
                if (res.success && res.body?.signature) {
                  this.existingSignature.set(res.body.signature);
                  this.signature.set(res.body.signature);
                }
              },
            });
        }
      } else if (!isVisible) {
        this.hasFetchedSignatureForCurrentOpen = false;
        this.existingSignature.set(null);
      }
    });
  }

  isConfirmDisabled = computed(() => {
    const noteRequired = this.isRequired() && !this.note().trim();
    const signatureNeeded = this.signatureRequired() && !this.signature();
    return noteRequired || signatureNeeded;
  });

  onConfirm(): void {
    if (this.isConfirmDisabled()) {
      return;
    }
    this.confirmed.emit();
  }

  onCancelClick(): void {
    this.onCancel.emit();
  }

  onSignatureChange(signatureData: string | null): void {
    this.signature.set(signatureData);
  }
}
