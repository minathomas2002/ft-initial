import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { min } from 'rxjs';
import { ISettingSla } from 'src/app/shared/interfaces/ISetting';

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
    internalCycle: this.fb.control<number | null>(0, 
      [Validators.required,
        Validators.min(1),
        Validators.max(365)
    ]),
    investorReply: this.fb.control<number | null>(0, [
      Validators.required,
      Validators.min(1),
      Validators.max(365),
    ]),

  });


  get internalCycle() { return this.form.controls.internalCycle; }
  get investorReply() { return this.form.controls.investorReply; }
  
   ResetFormFields() {
    this.form.reset();
  }

  patchForm(slaSetting : ISettingSla | null){
    this.form.patchValue({
      internalCycle: slaSetting?.internalCycle,
      investorReply: slaSetting?.investorReply,
    });
    this.form.controls.investorReply.addValidators(Validators.min(slaSetting?.remainingDaysValidation?? 1));
    this.form.controls.investorReply.updateValueAndValidity();

  }
}
