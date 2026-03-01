import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { parsePhoneNumber } from 'src/app/shared/data/countries.data';
import { EViewMode } from 'src/app/shared/enums';
import { IPhoneValue, IProfileResponse } from 'src/app/shared/interfaces';
import { phoneNumberPatternValidator } from 'src/app/shared/validators/phone-number.validator';

@Injectable()
export class PersonalInformationFormService {
  private fb = inject(FormBuilder);
  personalInformationForm = this.fb.group({
    fullName: new FormControl<string>('', [Validators.required, Validators.maxLength(150)]),
    email: new FormControl<string>('', [Validators.required, Validators.email, Validators.maxLength(100)]),
    phoneNumber: new FormControl<IPhoneValue | null>(null, [Validators.required, phoneNumberPatternValidator()]),
    otherPhoneNumber: new FormControl<IPhoneValue | null>(null, [phoneNumberPatternValidator()]),
    benaId: new FormControl<string | null>(null, [Validators.maxLength(7)]),
    secRegisteredId: new FormControl<string | null>(null, [Validators.maxLength(7)]),
  });

  get fullName(): FormControl<string | null> {
    return this.personalInformationForm.get('fullName') as FormControl<string | null>;
  }

  get email(): FormControl<string | null> {
    return this.personalInformationForm.get('email') as FormControl<string | null>;
  }

  get phoneNumber(): FormControl<IPhoneValue | null> {
    return this.personalInformationForm.get('phoneNumber') as FormControl<IPhoneValue | null>;
  }

  get otherPhoneNumber(): FormControl<IPhoneValue | null> {
    return this.personalInformationForm.get('otherPhoneNumber') as FormControl<IPhoneValue | null>;
  }

  get benaId(): FormControl<string | null> {
    return this.personalInformationForm.get('benaId') as FormControl<string | null>;
  }

  get secRegisteredId(): FormControl<string | null> {
    return this.personalInformationForm.get('secRegisteredId') as FormControl<string | null>;
  }

  initializeForm(user: IProfileResponse): void {
    this.personalInformationForm.patchValue({
      fullName: user.nameEn,
      email: user.email,
      phoneNumber: {
        countryCode: user.countryCode ?? '',
        phoneNumber: user.phoneNumber,
      },
      otherPhoneNumber: user.otherPhoneNumber ? {
        countryCode: user.countryCode ?? '',
        phoneNumber: user.otherPhoneCountryCode,
      } : null,
      benaId: user.benaId,
      secRegisteredId: user.secRegisteredId,
    });
    this.personalInformationForm.updateValueAndValidity();
  }

  updateViewMode(viewMode: EViewMode) {
    if (viewMode === EViewMode.View) {
      this.personalInformationForm.disable();
    } else if (viewMode === EViewMode.Edit) {
      this.personalInformationForm.enable();
      this.email.disable();
      this.benaId.disable();
    }
  }

  getFormValue(): any {
    return this.personalInformationForm.getRawValue();
  }

  get invalid(): boolean {
    return this.personalInformationForm.invalid;
  }
}
