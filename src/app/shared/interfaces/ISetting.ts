import { FormControl, FormGroup } from "@angular/forms";
import { EHolidaysManagementActions } from "../enums/holidays-management.enum";
import { IFilterBase } from "./filter.interface";

export interface ISettingSlaReq {
  internalCycle : number;
  investorReply: number; 
}

export interface ISettingSla extends ISettingSlaReq {
  remainingDaysValidation : number;
}

export interface ISettingAutoAssign{
  isEnabled : boolean;
}

export interface ISettingAutoAssignResponse{
  haveActiveUsers : boolean;
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

export interface IHolidaysManagementRecord {
  id: string;
  holidayName: string;
  type: string;
  startDate: Date;
  endDate: Date;
  numberOfDays: string;
  createdBy: string;
  lastUpdated: Date;
  actions: EHolidaysManagementActions[];
}

export type THolidaysManagementRecordKeys = keyof IHolidaysManagementRecord;

export interface IHolidayManagementFilter extends IFilterBase<THolidaysManagementRecordKeys> {
  searchText?: string;
  type?: String ;
  year?: number;
  dateRange? : Date;
}