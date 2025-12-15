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
  /^\s*[A-Za-z0-9\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF-]+(?:\s+[A-Za-z0-9\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF-]+)*\s*$/;


  /**  declare Strongly-typed form */
  readonly form: FormGroup<{
    name: FormControl<string | null>;
    typeId: FormControl<string | null>;
    dateFrom: FormControl<Date | null>;
    dateTo: FormControl<Date | null>;
    numberOfDays: FormControl<number | null>;
  }> = this.fb.group({
    typeId: this.fb.control<string | null>(null, [Validators.required]),
    name: this.fb.control<string | null>(null, [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(100),
      Validators.pattern(AddHolidayFormService.ARABIC_ENGLISH_REGEX)
    ]),
    dateFrom: this.fb.control<Date | null>(null, [
      Validators.required,
    ]),
    dateTo: this.fb.control<Date | null>(null),
    numberOfDays: this.fb.control<number | null>({ value: null, disabled: true })
  });
  get type() { return this.form.controls.typeId; }
  get name() { return this.form.controls.name; }
  get fromDate() { return this.form.controls.dateFrom; }
  get toDate() { return this.form.controls.dateTo; }
  get numberOfDays() { return this.form.controls.numberOfDays; }

  patchForm(holiday: IHolidayCreating) {
    this.form.patchValue({
      name: holiday.name,
      dateFrom: holiday.dateFrom,
      dateTo: holiday.dateTo,
      typeId: holiday.typeId
    });
  }

  ResetFormFields() {
    this.form.reset();
  }

  loadData(){
    return this.form.getRawValue();
  }

   listenToFormChanges(){
    // validate date to must be grater or equal from
    this.fromDate.valueChanges.subscribe(() => {
      const toDate = this.toDate.value;
      if(toDate ===null)
        this.numberOfDays.setValue(1);
      else{
        const diffDays = this.getAbsoluteDaysDifference(this.fromDate.value!, this.toDate.value!);
        this.numberOfDays.setValue(diffDays);
      }
    });

    this.toDate.valueChanges.subscribe(() => {
      const toDate = this.toDate.value;
      if(toDate ===null)
        this.numberOfDays.setValue(1);
      else{
        const diffDays = this.getAbsoluteDaysDifference(this.fromDate.value!, this.toDate.value!);
        this.numberOfDays.setValue(diffDays);
      }
    });
  }

  getAbsoluteDaysDifference(d1: Date, d2: Date): number {
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);

    const diffMs = d2.getTime() - d1.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24)) +1;
  }

}
