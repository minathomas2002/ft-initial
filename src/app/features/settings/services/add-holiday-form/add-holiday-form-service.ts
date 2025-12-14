import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { IHolidayCreating } from 'src/app/shared/interfaces/ISetting';

@Injectable({
  providedIn: 'root',
})
export class AddHolidayFormService {

  // IHolidayCreating
  private fb = inject(FormBuilder);

  static readonly ARABIC_ENGLISH_REGEX =
    /^\s*[A-Za-z\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+(?:\s+[A-Za-z\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+)*\s*$/;


  /**  declare Strongly-typed form */
  readonly form: FormGroup<{
    name: FormControl<string | null>;
    typeId: FormControl<string | null>;
    fromDate: FormControl<Date | null>;
    toDate: FormControl<Date | null>;
    numberOfDays: FormControl<number | null>;
  }> = this.fb.group({
    typeId: this.fb.control<string | null>(null, [Validators.required]),
    name: this.fb.control<string | null>(null, [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(100),
      Validators.pattern(AddHolidayFormService.ARABIC_ENGLISH_REGEX)
    ]),
    fromDate: this.fb.control<Date | null>(null, [
      Validators.required,
    ]),
    toDate: this.fb.control<Date | null>(null, [
      Validators.required,
    ]),
    numberOfDays: this.fb.control<number | null>({ value: null, disabled: true })
  });
  get type() { return this.form.controls.typeId; }
  get name() { return this.form.controls.name; }
  get fromDate() { return this.form.controls.fromDate; }
  get toDate() { return this.form.controls.toDate; }
  get numberOfDays() { return this.form.controls.numberOfDays; }

  patchForm(holiday: IHolidayCreating) {
    this.form.patchValue({
      name: holiday.name,
      fromDate: holiday.dateFrom,
      toDate: holiday.dateTo,
      typeId: holiday.typeId
    });
  }

  ResetFormFields() {
    this.form.reset();
  }
}
