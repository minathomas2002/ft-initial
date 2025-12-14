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
    overdueInternalPlan :this.fb.group({
      employee: this.fb.control(false, { nonNullable: true }),
      dvManager: this.fb.control(false, { nonNullable: true }),
      departmentManager: this.fb.control(false, { nonNullable: true })
    }),
    finalApprovalRejectionNotification :this.fb.group({
      investor: this.fb.control(false, { nonNullable: true }),
    }),
    inactiveOpportunityAlert :this.fb.group({
      admins: this.fb.control(false, { nonNullable: true }),
    }),
    draftOpportunityReminder :this.fb.group({
      admins: this.fb.control(false, { nonNullable: true }),
    }),
    opportunityUpdateNotification :this.fb.group({
      investor: this.fb.control(false, { nonNullable: true }),
    }),
    newOpportunityCreatedNotification :this.fb.group({
      investor: this.fb.control(false, { nonNullable: true }),
    }),
    impersonationAccessAlert :this.fb.group({
      userBeingImpersonated: this.fb.control(false, { nonNullable: true }),
      userperformingImpersonation: this.fb.control(false, { nonNullable: true }),
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
  get overdueInternalPlan() {
    return this.form.controls.overdueInternalPlan;
  }
  get finalApprovalRejectionNotification() {
    return this.form.controls.finalApprovalRejectionNotification;
  }

  get inactiveOpportunityAlert() {
    return this.form.controls.inactiveOpportunityAlert;
  }
  get draftOpportunityReminder() {
    return this.form.controls.draftOpportunityReminder;
  }
  get opportunityUpdateNotification() {
    return this.form.controls.opportunityUpdateNotification;
  }
  get newOpportunityCreatedNotification() {
    return this.form.controls.newOpportunityCreatedNotification;
  }
  get impersonationAccessAlert() {
    return this.form.controls.impersonationAccessAlert;
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
      inactiveOpportunityAlert: {
        admins: data?.inactiveOpportunityAlert?.admins ?? false
      },
      draftOpportunityReminder: {
        admins: data?.draftOpportunityReminder?.admins ?? false
      },
      opportunityUpdateNotification: {
        investor: data?.opportunityUpdateNotification?.investor ?? false
      },
      newOpportunityCreatedNotification: {
        investor: data?.newOpportunityCreatedNotification?.investor ?? false
      },
       impersonationAccessAlert: {
        userBeingImpersonated: data?.impersonationAccessAlert?.userBeingImpersonated ?? false,
        userperformingImpersonation: data?.impersonationAccessAlert?.userperformingImpersonation ?? false

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
