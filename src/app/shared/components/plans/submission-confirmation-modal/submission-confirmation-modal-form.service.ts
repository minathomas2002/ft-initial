import { inject, Injectable } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Injectable()
export class SubmissionConfirmationModalFormService {
  private readonly _fb = inject(FormBuilder);

  readonly submissionForm: FormGroup = this._fb.group({
    name: ['', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(100),
      this.alphabetsAndSpacesOnlyValidator
    ]],
    jobTitle: ['', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(100),
      this.jobTitleValidator
    ]],
    contactNumber: ['', [
      Validators.required,
      this.contactNumberValidator
    ]],
    emailId: ['', [
      Validators.required,
      Validators.email
    ]],
    signature: [null, Validators.required]
  });

  get nameControl(): FormControl<string> {
    return this.submissionForm.get('name') as FormControl<string>;
  }

  get jobTitleControl(): FormControl<string> {
    return this.submissionForm.get('jobTitle') as FormControl<string>;
  }

  get contactNumberControl(): FormControl<string> {
    return this.submissionForm.get('contactNumber') as FormControl<string>;
  }

  get emailIdControl(): FormControl<string> {
    return this.submissionForm.get('emailId') as FormControl<string>;
  }

  get signatureControl(): FormControl<string | null> {
    return this.submissionForm.get('signature') as FormControl<string | null>;
  }

  /**
   * Validator for alphabets and spaces only
   */
  private alphabetsAndSpacesOnlyValidator(control: AbstractControl): { [key: string]: any } | null {
    if (!control.value) return null;
    const value = control.value as string;
    const pattern = /^[A-Za-z\s]+$/;
    if (!pattern.test(value)) {
      return { alphabetsAndSpacesOnly: true };
    }
    return null;
  }

  /**
   * Validator for job title (alphanumeric + - . / ( ))
   */
  private jobTitleValidator(control: AbstractControl): { [key: string]: any } | null {
    if (!control.value) return null;
    const value = control.value as string;
    const pattern = /^[A-Za-z0-9\s.\-/(/)]+$/;
    if (!pattern.test(value)) {
      return { invalidJobTitle: true };
    }
    return null;
  }

  /**
   * Validator for contact number (numeric, + at start allowed, 10-15 digits)
   */
  private contactNumberValidator(control: AbstractControl): { [key: string]: any } | null {
    if (!control.value) return null;
    const value = control.value as string;
    // Remove spaces and dashes for validation
    const cleaned = value.replace(/[\s-]/g, '');
    // Check if starts with + and has 10-15 digits after, or just 10-15 digits
    const pattern = /^(\+?[0-9]{10,15})$/;
    if (!pattern.test(cleaned)) {
      return { invalidContactNumber: true };
    }
    return null;
  }

  /**
   * Check if form is valid
   */
  isFormValid(): boolean {
    return this.submissionForm.valid;
  }

  /**
   * Reset form
   */
  resetForm(): void {
    this.submissionForm.reset();
  }
}
