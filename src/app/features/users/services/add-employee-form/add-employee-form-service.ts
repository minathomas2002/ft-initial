import { Injectable, inject } from '@angular/core';
import { FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
import { disabled } from '@angular/forms/signals';
import { ERoles } from 'src/app/shared/enums';
import { IUserDetails } from 'src/app/shared/interfaces';

@Injectable({ providedIn: 'root' })
export class AddEmployeeFormService {

  // Regex constants
  static readonly ARABIC_REGEX =
    /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF ]+$/;

  static readonly ENGLISH_REGEX =
    /^[A-Za-z]+( [A-Za-z]+)*$/;

  static readonly PHONE_REGEX =
    /^\+?[0-9]{8,15}$/;

  private fb = inject(FormBuilder);

  /**  declare Strongly-typed form */
  readonly form: FormGroup<{
    roleId: FormControl<string | null>;
    job: FormControl<string | null>;
    employeeID: FormControl<string | null>;
    email: FormControl<string | null>;
    nameAr: FormControl<string | null>;
    nameEn: FormControl<string | null>;
    phoneNumber: FormControl<string | null>;
  }> = this.fb.group({
    roleId: this.fb.control<string | null>(null, [Validators.required]),

    job: this.fb.control<string | null>(null, [
      Validators.required,
      Validators.maxLength(20),
    ]),

    employeeID: this.fb.control<string | null>(null, [Validators.required]),

    email: this.fb.control<string | null>({ value: null, disabled: true }),

    nameAr: this.fb.control<string | null>({ value: null, disabled: true }, [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(20),
      Validators.pattern(AddEmployeeFormService.ARABIC_REGEX)
      
    ]),

    nameEn: this.fb.control<string | null>({ value: null, disabled: true }, [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(100),
      Validators.pattern(AddEmployeeFormService.ENGLISH_REGEX)
    ]),

    phoneNumber: this.fb.control<string | null>({ value: null, disabled: true }, [
      Validators.required,
      Validators.pattern(AddEmployeeFormService.PHONE_REGEX)
    ])
  });

  
  get roleId() { return this.form.controls.roleId; }
  get job() { return this.form.controls.job; }
  get employeeID() { return this.form.controls.employeeID; }
  get email() { return this.form.controls.email; }
  get nameAr() { return this.form.controls.nameAr; }
  get nameEn() { return this.form.controls.nameEn; }
  get phoneNumber() { return this.form.controls.phoneNumber; }

  patchForm(user: IUserDetails, isEditMode: boolean = false) {
  this.form.patchValue({
    roleId: user.roleId,
    job: user.employeeID,
    employeeID: user.employeeID,
    email: user.email,
    nameAr: user.name_Ar,
    nameEn: user.name_En,
    phoneNumber: user.phoneNumber,
  });

  if (isEditMode) {
    this.enableEditableFields();
  }
}

enableEditableFields() {
  this.nameAr.enable();
  this.nameEn.enable();
  this.phoneNumber.enable();
  this.job.disable();
}

ResetFormFields() {
  this.form.reset();
  this.nameAr.disable();
  this.nameEn.disable();
  this.phoneNumber.disable();
  this.job.enable();
}

}
