import { inject } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { IAddDelegationRequest, IDelegationRecord } from "src/app/shared/interfaces/delegation.interface";

export class AddDelegationFormService {
   private fb = inject(FormBuilder);

   readonly form: FormGroup<{
    delegatorId: FormControl<string | null>;
    delegateeId: FormControl<string | null>;
    from : FormControl<string | null>;
    to : FormControl<string | null>;
   }> = this.fb.group({
    delegatorId: this.fb.control<string | null>(null, [Validators.required]),
    delegateeId: this.fb.control<string | null>(null, [Validators.required]),
    from : this.fb.control<string | null>(null, [Validators.required]),
    to : this.fb.control<string | null>(null, [Validators.required]),
   });

   get delegatorId() { return this.form.controls.delegatorId; }
   get delegateeId() { return this.form.controls.delegateeId; }
    get from() { return this.form.controls.from; }
    get to() { return this.form.controls.to; }

   patchForm(delegation: IAddDelegationRequest) {
    this.form.patchValue({
        delegatorId: delegation.delegatorId,
        delegateeId: delegation.delegateeId,
        from : delegation.startDate,
        to : delegation.endDate,
    })
   }
   ResetFormFields() {
    this.form.reset();
  }

}
