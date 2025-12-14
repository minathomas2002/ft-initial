import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { disabled } from '@angular/forms/signals';
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
    holidayName: FormControl<string | null>;
    type: FormControl<string | null>;
    startDate: FormControl<Date | null>;
    endDate: FormControl<Date | null>;
    numberOfDays: FormControl<number | null>;
  }> = this.fb.group({

    type: this.fb.control<string | null>(null, [Validators.required]),
    holidayName: this.fb.control<string | null>(null, [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(100),
      Validators.pattern(AddHolidayFormService.ARABIC_ENGLISH_REGEX)
    ]),
    startDate: this.fb.control<Date | null>(null, [
      Validators.required,
    ]),
    endDate: this.fb.control<Date | null>(null, [
      Validators.required,
    ]),
    numberOfDays: this.fb.control<number | null>({ value: null, disabled: true })
  });
  get type(){return this.form.controls.type;}
  get holidayName(){return this.form.controls.holidayName;}
  get startDate(){return this.form.controls.startDate;}
  get endDate(){return this.form.controls.endDate;}
  get numberOfDays(){return this.form.controls.numberOfDays;}


    patchForm(holiday: IHolidayCreating) {
      this.form.patchValue({
        holidayName: holiday.holidayName,
        startDate: holiday.startDate,
        endDate: holiday.endDate,
        numberOfDays: holiday.numberOfDays,
        type: holiday.type
      });
  
      
    }

   ResetFormFields() {
    this.form.reset();
  }
}
