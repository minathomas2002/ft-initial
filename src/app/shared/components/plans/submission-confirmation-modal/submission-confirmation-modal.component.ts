import { ChangeDetectionStrategy, Component, computed, inject, model, output, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SignaturePadComponent } from './signature-pad/signature-pad.component';
import { SubmissionConfirmationModalFormService } from './submission-confirmation-modal-form.service';
import { BaseDialogComponent } from '../../base-components/base-dialog/base-dialog.component';
import { TextareaModule } from 'primeng/textarea';
import { BaseErrorMessages } from '../../base-components/base-error-messages/base-error-messages';
import { PhoneInputComponent } from '../../form/phone-input/phone-input.component';
import { IPhoneValue } from '../../../interfaces';
import { TranslatePipe } from '../../../pipes';

@Component({
  selector: 'app-submission-confirmation-modal',
  imports: [
    BaseDialogComponent,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    FormsModule,
    ReactiveFormsModule,
    SignaturePadComponent,
    BaseErrorMessages,
    PhoneInputComponent,
    TranslatePipe
  ],
  providers: [SubmissionConfirmationModalFormService],
  templateUrl: './submission-confirmation-modal.component.html',
  styleUrl: './submission-confirmation-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubmissionConfirmationModalComponent {
  visible = model<boolean>(false);
  existingSignature = model<string | null>(null);
  onConfirm = output<{
    name: string;
    jobTitle: string;
    contactNumber: string;
    emailId: string;
    signature: string;
  }>();
  onCancel = output<void>();

  formService = inject(SubmissionConfirmationModalFormService);

  isSubmitting = signal(false);
  phoneInputValue = signal<IPhoneValue | null>(null);

  isSubmitDisabled = computed(() => {
    return !this.formService.isFormValid() || this.isSubmitting();
  });

  onSignatureChange(signatureData: string | null): void {
    this.formService.signatureControl.setValue(signatureData);
    if (signatureData) {
      this.formService.signatureControl.markAsTouched();
      this.formService.signatureControl.markAsDirty();
    } else {
      this.formService.signatureControl.markAsDirty();
    }
  }

  onPhoneNumberChange(phoneValue: IPhoneValue | null): void {
    this.phoneInputValue.set(phoneValue);
    if (phoneValue && phoneValue.countryCode && phoneValue.phoneNumber) {
      // Combine country code and phone number as a string
      const combinedPhone = `${phoneValue.countryCode}${phoneValue.phoneNumber}`;
      this.formService.contactNumberControl.setValue(combinedPhone);
      this.formService.contactNumberControl.markAsTouched();
      this.formService.contactNumberControl.markAsDirty();
    } else {
      // Clear the control if phone value is null
      this.formService.contactNumberControl.setValue('');
      this.formService.contactNumberControl.markAsDirty();
    }
  }

  onBackClick(): void {
    this.visible.set(false);
    this.onCancel.emit();
  }

  onSubmitClick(): void {
    if (!this.formService.isFormValid()) {
      // Mark all fields as touched and dirty to show errors
      Object.keys(this.formService.submissionForm.controls).forEach(key => {
        const control = this.formService.submissionForm.get(key);
        if (control) {
          control.markAsTouched();
          control.markAsDirty();
        }
      });
      return;
    }

    const formValue = this.formService.submissionForm.value;
    this.onConfirm.emit({
      name: formValue.name,
      jobTitle: formValue.jobTitle,
      contactNumber: formValue.contactNumber,
      emailId: formValue.emailId,
      signature: formValue.signature
    });
  }

  onDialogClose(): void {
    this.formService.resetForm();
    this.phoneInputValue.set(null);
    // Clear the signature when dialog closes
    this.existingSignature.set(null);
    this.onSignatureChange(null);
    this.onCancel.emit();
  }
}
