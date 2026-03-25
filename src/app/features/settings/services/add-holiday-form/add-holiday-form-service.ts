import { DestroyRef, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { IHolidayCreating } from 'src/app/shared/interfaces/ISetting';
import { dateRangeValidator } from 'src/app/shared/validators/date-range-validator';

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
    dateTo: this.fb.control<Date | null>(null, [
      Validators.required,
    ]),
    numberOfDays: this.fb.control<number | null>({ value: null, disabled: true })
  },
    { validators: dateRangeValidator }
  );
  get type() { return this.form.controls.typeId; }
  get name() { return this.form.controls.name; }
  get fromDate() { return this.form.controls.dateFrom; }
  get toDate() { return this.form.controls.dateTo; }
  get numberOfDays() { return this.form.controls.numberOfDays; }
  private readonly destroyRef = inject(DestroyRef);

  patchForm(holiday: IHolidayCreating) {
    // holiday.dateFrom = new Date(holiday.dateFrom);
    // holiday.dateTo = new Date(holiday.dateTo);
    this.form.patchValue({
      name: holiday.name,
      dateFrom: new Date(holiday.dateFrom),
      dateTo: new Date(holiday.dateTo),
      typeId: holiday.typeId
    });
    this.fromDate.setValue(new Date(holiday.dateFrom));
    this.toDate.setValue(new Date(holiday.dateTo));
    this.syncNumberOfDays();
  }

  ResetFormFields() {
    this.form.reset();
  }

  loadData() {
    const payload = {
      ...this.form.getRawValue(),
      dateFrom: this.form.controls.dateFrom.value!.toLocaleDateString("en-CA"), //this.formatDateOnly(this.form.controls.dateFrom.value!),
      dateTo: this.form.controls.dateTo.value!.toLocaleDateString("en-CA"),
    };
    return payload;
  }

  listenToFormChanges() {
    this.fromDate.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        const from = this.fromDate.value;
        const to = this.toDate.value;
        if (from && to === null) {
          this.toDate.setValue(from, { emitEvent: false });
        }
        this.syncNumberOfDays();
      });

    this.toDate.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.syncNumberOfDays());
  }

  /**
   * Sets numberOfDays to inclusive calendar days between dateFrom and dateTo (same day = 1).
   * When either date is missing or range is invalid (to before from), uses null or 0 respectively.
   */
  private syncNumberOfDays(): void {
    const from = this.fromDate.value;
    const to = this.toDate.value;
    if (!from || !to) {
      this.numberOfDays.setValue(null);
      return;
    }
    this.numberOfDays.setValue(this.getCalendarDaysInclusive(from, to));
  }

  /** Inclusive count of calendar days from start through end (normalized to local midnight). */
  private getCalendarDaysInclusive(from: Date, to: Date): number {
    const start = new Date(from);
    const end = new Date(to);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    const diffMs = end.getTime() - start.getTime();
    const wholeDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (wholeDays < 0) {
      return 0;
    }
    return wholeDays + 1;
  }

}
