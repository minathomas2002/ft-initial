import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ISettingSla } from 'src/app/shared/interfaces/ISetting';

const slaDayValidators = [
  Validators.required,
  Validators.max(365),
  Validators.pattern(/^[0-9]+$/),
];

@Injectable({
  providedIn: 'root',
})
export class SlaForm {


  private fb = inject(FormBuilder);

  /**  declare Strongly-typed form */
  readonly form: FormGroup<{
    internalCycle: FormControl<number | null>;
    investorReply: FormControl<number | null>;

  }> = this.fb.group({
    internalCycle: this.fb.control<number | null>(0, [...slaDayValidators]),
    investorReply: this.fb.control<number | null>(0, [...slaDayValidators]),

  });


  get internalCycle() { return this.form.controls.internalCycle; }
  get investorReply() { return this.form.controls.investorReply; }

  ResetFormFields() {
    this.form.reset();
    this.form.controls.investorReply.setValidators([...slaDayValidators]);
    this.form.controls.investorReply.updateValueAndValidity({ emitEvent: true });
    this.form.updateValueAndValidity({ emitEvent: true });
  }

  patchForm(slaSetting: ISettingSla | null) {
    this.form.patchValue({
      internalCycle: slaSetting?.internalCycle,
      investorReply: slaSetting?.investorReply,
    });
    const minReply = slaSetting?.remainingDaysValidation ?? 1;
    this.form.controls.investorReply.setValidators([
      ...slaDayValidators,
      Validators.min(minReply),
    ]);
    this.form.controls.internalCycle.markAsDirty();
    this.form.controls.investorReply.markAsDirty();
    this.form.controls.investorReply.markAsTouched();

    this.form.controls.investorReply.updateValueAndValidity({ emitEvent: true });
    this.form.updateValueAndValidity({ emitEvent: true });
  }
}
