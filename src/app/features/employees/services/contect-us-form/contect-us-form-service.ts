import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { IAddContactUsRequest } from 'src/app/shared/interfaces/contact-us.interface';
@Injectable({ providedIn: 'root' })
export class ContactUsFormService {
  private fb = inject(FormBuilder);
  readonly form: FormGroup<{
    title: FormControl<string | null>;
    description: FormControl<string | null>;
  }> = this.fb.group({
    title: this.fb.control<string | null>(null, [Validators.required,Validators.maxLength(150), Validators.minLength(3)]),
    description: this.fb.control<string | null>(null, [Validators.required,Validators.maxLength(1000), Validators.minLength(10)]),
  });

  get title() {
    return this.form.controls.title;
  }
  get description() {
    return this.form.controls.description;
  }

  patchForm(contactUsForm: IAddContactUsRequest) {
    this.form.patchValue({
      title: contactUsForm.title,
      description: contactUsForm.description,
    });
  }
  ResetFormFields() {
    this.form.reset();
  }
}
