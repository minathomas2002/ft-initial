import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import {
  IAddDelegationRequest,
  IDelegationRecord,
} from 'src/app/shared/interfaces/delegation.interface';
@Injectable({ providedIn: 'root' })
export class AddDelegationFormService {
  private fb = inject(FormBuilder);
  readonly form: FormGroup<{
    id: FormControl<string | null>;
    delegatorId: FormControl<string | null>;
    delegateeId: FormControl<string | null>;
    from: FormControl<Date | null>;
    to: FormControl<Date | null>;
  }> = this.fb.group({
    id: this.fb.control<string | null>(null),
    delegatorId: this.fb.control<string | null>(null, Validators.required),
    delegateeId: this.fb.control<string | null>(null, Validators.required),
    from: this.fb.control<Date | null>(null, Validators.required),
    to: this.fb.control<Date | null>(null, Validators.required),
  });

  get delegatorId() {
    return this.form.controls.delegatorId;
  }
  get delegateeId() {
    return this.form.controls.delegateeId;
  }
  get from() {
    return this.form.controls.from;
  }
  get to() {
    return this.form.controls.to;
  }

  patchForm(delegation: IAddDelegationRequest) {
    this.form.patchValue({
      delegatorId: delegation.delegatorId,
      delegateeId: delegation.delegateeId,
      from: delegation.from ? new Date(delegation.from) : null,
      to: delegation.to ? new Date(delegation.to) : null,
    });
  }
  ResetFormFields() {
    this.form.reset();
  }
}
