import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ISettingAdminEmailNotification } from 'src/app/shared/interfaces/ISetting';

@Injectable({
  providedIn: 'root',
})
export class EmailNotificationFormService {
  
  private fb = inject(FormBuilder);


    /** Main form */
  readonly form: FormGroup<ISettingAdminEmailNotification> = this.fb.group({
    unassignedPlanAlert: this.fb.group({
      dvManager: this.fb.control(false, { nonNullable: true })
    }),
    planReassignment :this.fb.group({
      employeePrevious: this.fb.control(false, { nonNullable: true })
    }),
    reminderOnPlanAssignedforReview : this.fb.group({
      employee: this.fb.control(false, { nonNullable: true })
    }),
    internalPlanSLAReminder :this.fb.group({
      employee: this.fb.control(false, { nonNullable: true }),
      dvManager: this.fb.control(false, { nonNullable: true }),
      departmentManager: this.fb.control(false, { nonNullable: true })
    }),
    investorPlanSLAReminder :this.fb.group({
      investor: this.fb.control(false, { nonNullable: true }),
    }),
    overdueInternalPlan :this.fb.group({
      employee: this.fb.control(false, { nonNullable: true }),
      dvManager: this.fb.control(false, { nonNullable: true }),
      departmentManager: this.fb.control(false, { nonNullable: true })
    }),
    finalApprovalRejectionNotification :this.fb.group({
      investor: this.fb.control(false, { nonNullable: true }),
    }),
    


  });


  // ---------- Getters ----------- //
  get unassignedPlanAlert() {
    return this.form.controls.unassignedPlanAlert;
  }

  get planReassignment() {
    return this.form.controls.planReassignment;
  }

  get reminderOnPlanAssignedforReview(){
    return this.form.controls.reminderOnPlanAssignedforReview;
  }

  get internalPlanSLAReminder() {
    return this.form.controls.internalPlanSLAReminder;
  }

  get investorPlanSLAReminder() {
    return this.form.controls.investorPlanSLAReminder;
  }

  get overdueInternalPlan() {
    return this.form.controls.overdueInternalPlan;
  }

  get finalApprovalRejectionNotification() {
    return this.form.controls.finalApprovalRejectionNotification;
  }

    // ---------- Patch from API ----------- //
  patchForm(data: any) {
    this.form.patchValue({
      unassignedPlanAlert: {
        dvManager: data?.unassignedPlanAlert?.dvManager ?? false
      },
      planReassignment: {
        employeePrevious: data?.planReassignment?.employeePrevious ?? false
      },
      reminderOnPlanAssignedforReview : {
        employee: data?.reminderOnPlanAssignedforReview?.employee ?? false
      },
      internalPlanSLAReminder: {
        employee: data?.internalPlanSLAReminder?.employee ?? false,
        departmentManager: data?.internalPlanSLAReminder?.dvManager ?? false,
        dvManager: data?.internalPlanSLAReminder?.dvManager ?? false
      },
      investorPlanSLAReminder: {
        investor: data?.investorPlanSLAReminder?.investor ?? false
      },
      overdueInternalPlan: {
        employee: data?.overdueInternalPlan?.employee ?? false,
        departmentManager: data?.overdueInternalPlan?.dvManager ?? false,
        dvManager: data?.overdueInternalPlan?.dvManager ?? false
      },
      finalApprovalRejectionNotification: {
        investor: data?.finalApprovalRejectionNotification?.investor ?? false
      },

    });
  }


  ResetFormFields() {
    this.form.reset();
  }

  getPayload() {
    return this.form.getRawValue();
  }

}
