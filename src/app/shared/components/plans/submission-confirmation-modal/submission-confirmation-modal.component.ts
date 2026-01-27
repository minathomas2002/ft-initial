import { ChangeDetectionStrategy, Component, computed, effect, inject, input, model, output, signal } from '@angular/core';
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
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { parsePhoneNumber } from '../../../data/countries.data';

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
  contactInfo = input<{
    name?: string;
    jobTitle?: string;
    contactNumber?: string;
    emailId?: string;
  }>({});
  onConfirm = output<{
    name: string;
    jobTitle: string;
    contactNumber: string;
    emailId: string;
    signature: string;
  }>();
  onCancel = output<void>();

  formService = inject(SubmissionConfirmationModalFormService);
  private readonly planStore = inject(PlanStore);
  isProcessing = this.planStore.isProcessing;

  isSubmitting = signal(false);
  phoneInputValue = signal<IPhoneValue | null>(null);

  constructor() {
    // Initialize form when modal opens with existing data
    effect(() => {
      const isVisible = this.visible();
      const existingSig = this.existingSignature();
      const contactInfoData = this.contactInfo();
      
      if (isVisible) {
        // Pre-fill form with contactInfo from API response
        if (contactInfoData && Object.keys(contactInfoData).length > 0) {
          if (contactInfoData.name) {
            this.formService.nameControl.setValue(contactInfoData.name, { emitEvent: false });
            this.formService.nameControl.markAsTouched();
            this.formService.nameControl.markAsDirty();
          }
          
          if (contactInfoData.jobTitle) {
            this.formService.jobTitleControl.setValue(contactInfoData.jobTitle, { emitEvent: false });
            this.formService.jobTitleControl.markAsTouched();
            this.formService.jobTitleControl.markAsDirty();
          }
          
          if (contactInfoData.emailId) {
            this.formService.emailIdControl.setValue(contactInfoData.emailId, { emitEvent: false });
            this.formService.emailIdControl.markAsTouched();
            this.formService.emailIdControl.markAsDirty();
          }
          
          // Parse and set phone number
          if (contactInfoData.contactNumber) {
            const parsedPhone = parsePhoneNumber(contactInfoData.contactNumber);
            if (parsedPhone) {
              this.phoneInputValue.set({
                countryCode: parsedPhone.countryCode,
                phoneNumber: parsedPhone.phoneNumber
              });
              this.formService.contactNumberControl.setValue(contactInfoData.contactNumber, { emitEvent: false });
              this.formService.contactNumberControl.markAsTouched();
              this.formService.contactNumberControl.markAsDirty();
            }
          }
        }
        
        // Set signature if exists
        if (existingSig) {
          this.formService.signatureControl.setValue(existingSig, { emitEvent: false });
          this.formService.signatureControl.markAsTouched();
          this.formService.signatureControl.markAsDirty();
        }
      } else if (!isVisible) {
        // Reset form when modal closes
        this.formService.resetForm();
        this.phoneInputValue.set(null);
      }
    });
  }

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
