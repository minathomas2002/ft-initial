import { Injectable, inject } from '@angular/core';
import { FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
import { ISystemEmployeeDetails } from 'src/app/shared/interfaces';

@Injectable({ providedIn: 'root' })
export class AddEmployeeFormService {

  // Regex constants
  static readonly ARABIC_REGEX =
    /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF ]+$/;

  static readonly ENGLISH_REGEX =
    /^\s*[A-Za-z]+(?:\s+[A-Za-z]+)*\s*$/;

  // Same as above but also accept all special characters (punctuation, symbols)
  static readonly ARABIC_REGEX_WITH_SPECIAL_CHARS =
    /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF \p{P}\p{S}]+$/u;

  static readonly ENGLISH_REGEX_WITH_SPECIAL_CHARS =
    /^\s*[A-Za-z\p{P}\p{S}]+(?:\s+[A-Za-z\p{P}\p{S}]+)*\s*$/u;

  static readonly PHONE_REGEX =
    /^\+?[0-9]+$/;

  /* small english letters and numbers */
  static readonly EMPLOYEE_ID_REGEX =
    /^[a-z0-9]+$/;

  private fb = inject(FormBuilder);

  /**  declare Strongly-typed form */
  readonly form: FormGroup<{
    roleId: FormControl<string | null>;
    job: FormControl<string | null>;
    email: FormControl<string | null>;
    nameAr: FormControl<string | null>;
    nameEn: FormControl<string | null>;
    phoneNumber: FormControl<string | null>;
  }> = this.fb.group({
    roleId: this.fb.control<string | null>(null, [Validators.required, Validators.pattern(AddEmployeeFormService.EMPLOYEE_ID_REGEX)]),

    job: this.fb.control<string | null>(null, [
      Validators.required,
      Validators.maxLength(20),
    ]),

    email: this.fb.control<string | null>({ value: null, disabled: true }),

    nameAr: this.fb.control<string | null>(null, [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(100),
      Validators.pattern(AddEmployeeFormService.ARABIC_REGEX_WITH_SPECIAL_CHARS)

    ]),

    nameEn: this.fb.control<string | null>(null, [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(100),
      Validators.pattern(AddEmployeeFormService.ENGLISH_REGEX_WITH_SPECIAL_CHARS)
    ]),

    phoneNumber: this.fb.control<string | null>(null, [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(15),
      Validators.pattern(AddEmployeeFormService.PHONE_REGEX)
    ])
  });


  get roleId() { return this.form.controls.roleId; }
  get job() { return this.form.controls.job; }
  get email() { return this.form.controls.email; }
  get nameAr() { return this.form.controls.nameAr; }
  get nameEn() { return this.form.controls.nameEn; }
  get phoneNumber() { return this.form.controls.phoneNumber; }

  patchForm(user: ISystemEmployeeDetails, isEditMode: boolean = false) {
    this.form.patchValue({
      roleId: user.roleId,
      job: user.employeeID,
      email: user.email,
      nameAr: user.name_Ar,
      nameEn: user.name_En,
      phoneNumber: user.phoneNumber,
    });

    if (isEditMode && !user.isAddedManually) {
      this.job.disable();
    }
  }

  ResetFormFields() {
    this.form.reset();
    this.job.enable();
  }

}
