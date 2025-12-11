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
    internalCycleTime: FormControl<number | null>;
    investorReplyTime: FormControl<number | null>;
   
  }> = this.fb.group({
    internalCycleTime: this.fb.control<number | null>(14, 
      [Validators.required,
        Validators.min(1),
        Validators.max(365)
    ]),
    investorReplyTime: this.fb.control<number | null>(14, [
      Validators.required,
      Validators.min(1),
      Validators.max(365),
    ]),

  });


  get internalCycleTime() { return this.form.controls.internalCycleTime; }
  get investorReplyTime() { return this.form.controls.investorReplyTime; }
  
   ResetFormFields() {
    this.form.reset();
  }

  patchForm(slaSetting : ISettingSla){
    this.form.patchValue({
      internalCycleTime: slaSetting.internalCycle,
      investorReplyTime: slaSetting.investorReply,
    });
    this.form.controls.investorReplyTime.addValidators(Validators.min(slaSetting.remainingDaysValidation));
    this.form.controls.investorReplyTime.updateValueAndValidity();

  }
}
