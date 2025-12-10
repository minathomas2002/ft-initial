import { FormControl, FormGroup } from "@angular/forms";

export interface ISettingSlaReq {
  internalCycleTime : number;
  investorReplyTime: number; 
}

export interface ISettingSla extends ISettingSlaReq {
 
  minInvestorReplyTime : number;

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

}