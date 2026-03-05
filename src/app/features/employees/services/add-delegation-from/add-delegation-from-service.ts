import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { EDelegationStatus } from 'src/app/shared/enums';
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
    this.form.enable();
    this.form.updateValueAndValidity();
  }

  setFormInEditMode(delegation: IDelegationRecord) {
    const fromDate = this.parseToLocalDate(delegation.startDate);
    const toDate = this.parseToLocalDate(delegation.endDate);
    this.form.patchValue({
      id: delegation.delgationId,
      delegatorId: delegation.delegatorId,
      delegateeId: delegation.delegateeId,
      from: fromDate,
      to: toDate,
    });
    this.delegatorId.disable();
    this.delegateeId.disable();
    if (delegation.status === EDelegationStatus.ACTIVE) {
      this.from.disable();
    }
    this.form.updateValueAndValidity();
    this.form.markAsPristine();
  }

  /** Parse API date string to local midnight to avoid timezone/minDate display issues */
  private parseToLocalDate(dateStr: string): Date | null {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
}
