import { FormControl, FormGroup } from "@angular/forms";

export interface ISettingSlaReq {
  internalCycle : number;
  investorReply: number; 
}

export interface ISettingSla extends ISettingSlaReq {
 
  remainingDaysValidation : number;

}

export interface ISettingAutoAssign{
 
  isAssign : boolean;

}


export interface ISettingAdminNotification {
    unassignedPlanAlert: FormGroup<{
    dvManager: FormControl<boolean>;
  }>;

  planAssignedForReview: FormGroup<{
    employee: FormControl<boolean>;
    dvManager: FormControl<boolean>;
    departmentManager: FormControl<boolean>;
  }>;

  planReassignment: FormGroup<{
    employeeReassignee: FormControl<boolean>;
    employeePrevious: FormControl<boolean>;
  }>;

  internalPlanSLAReminder: FormGroup<{
    employee: FormControl<boolean>;
    dvManager: FormControl<boolean>;
    departmentManager: FormControl<boolean>;
  }>;

  investorPlanSLAReminder: FormGroup<{
    investor: FormControl<boolean>;
  }>;

  overdueInternalPlan: FormGroup<{
    employee: FormControl<boolean>;
    dvManager: FormControl<boolean>;
    departmentManager: FormControl<boolean>;
  }>;

  finalApprovalRejectionNotification: FormGroup<{
    investor: FormControl<boolean>;
  }>;

  inactiveOpportunityAlert:FormGroup<{
    admins: FormControl<boolean>;
  }>;

  draftOpportunityReminder:FormGroup<{
      admins: FormControl<boolean>;
  }>;
  opportunityUpdateNotification:FormGroup<{
      investor: FormControl<boolean>;
  }>;

  newOpportunityCreatedNotification:FormGroup<{
      investor: FormControl<boolean>;
  }>;

  impersonationAccessAlert:FormGroup<{
      userBeingImpersonated: FormControl<boolean>;
      userperformingImpersonation: FormControl<boolean>;
  }>;

}

export interface ISettingAdminEmailNotification {
  unassignedPlanAlert: FormGroup<{
    dvManager: FormControl<boolean>;
  }>;

  planReassignment: FormGroup<{
    employeePrevious: FormControl<boolean>;
  }>;

  reminderOnPlanAssignedforReview : FormGroup<{
    employee: FormControl<boolean>;
  }>;

   internalPlanSLAReminder: FormGroup<{
    employee: FormControl<boolean>;
    dvManager: FormControl<boolean>;
    departmentManager: FormControl<boolean>;
  }>;

  investorPlanSLAReminder: FormGroup<{
    investor: FormControl<boolean>;
  }>;

  overdueInternalPlan: FormGroup<{
    employee: FormControl<boolean>;
    dvManager: FormControl<boolean>;
    departmentManager: FormControl<boolean>;
  }>;

  finalApprovalRejectionNotification: FormGroup<{
    investor: FormControl<boolean>;
  }>;

}