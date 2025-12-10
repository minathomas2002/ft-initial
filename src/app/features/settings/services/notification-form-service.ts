import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ISettingAdminNotification } from 'src/app/shared/interfaces/ISetting';

@Injectable({
  providedIn: 'root',
})
export class NotificationFormService {
  
   private fb = inject(FormBuilder);

  /** Main form */
  readonly form: FormGroup<ISettingAdminNotification> = this.fb.group({
    unassignedPlanAlert: this.fb.group({
      dvManager: this.fb.control(false, { nonNullable: true })
    }),

    planAssignedForReview: this.fb.group({
      employee: this.fb.control(false, { nonNullable: true }),
      dvManager: this.fb.control(false, { nonNullable: true }),
      departmentManager: this.fb.control(false, { nonNullable: true })
    }),

    planReassignment: this.fb.group({
      employeeReassignee: this.fb.control(false, { nonNullable: true }),
      employeePrevious: this.fb.control(false, { nonNullable: true })
    }),

    internalPlanSLAReminder :this.fb.group({
      employee: this.fb.control(false, { nonNullable: true }),
      dvManager: this.fb.control(false, { nonNullable: true }),
      departmentManager: this.fb.control(false, { nonNullable: true })
    }),
    investorPlanSLAReminder :this.fb.group({
      investor: this.fb.control(false, { nonNullable: true }),
    }),
  });

  // ---------- Getters ----------- //
  get unassignedPlanAlert() {
    return this.form.controls.unassignedPlanAlert;
  }

  get planAssignedForReview() {
    return this.form.controls.planAssignedForReview;
  }

  get planReassignment() {
    return this.form.controls.planReassignment;
  }

  get internalPlanSLAReminder() {
    return this.form.controls.internalPlanSLAReminder;
  }
  get investorPlanSLAReminder() {
    return this.form.controls.investorPlanSLAReminder;
  }

  // ---------- Patch from API ----------- //
  patchForm(data: any) {
    this.form.patchValue({
      unassignedPlanAlert: {
        dvManager: data?.unassignedPlanAlert?.dvManager ?? false
      },
      planAssignedForReview: {
        employee: data?.planAssignedForReview?.employee ?? false,
        dvManager: data?.planAssignedForReview?.dvManager ?? false,
        departmentManager: data?.planAssignedForReview?.departmentManager ?? false
      },
      planReassignment: {
        employeeReassignee: data?.planReassignment?.employeeReassignee ?? false,
        employeePrevious: data?.planReassignment?.employeePrevious ?? false
      },
      internalPlanSLAReminder: {
        employee: data?.internalPlanSLAReminder?.employee ?? false,
        departmentManager: data?.departmentManager?.dvManager ?? false,
        dvManager: data?.internalPlanSLAReminder?.dvManager ?? false
      },
      investorPlanSLAReminder: {
        investor: data?.investorPlanSLAReminder?.investor ?? false
      }
    });
  }

  ResetFormFields() {
    this.form.reset();
  }

  getPayload() {
    return this.form.getRawValue();
  }
}
