export enum ENotificationCategory {
  PlanWorkflow = 1,
  Opportunity = 2,
  Access = 3
}

export enum ENotificationChannel
{
    System = 1,
    Email
}


 export enum ENotificationRecipient
 {
     // Roles
     DVManager=1,
     Employee,
     DepartmentManager,
     Investor,
     Admins,

     // Specific user targets for impersonation
     UserBeingImpersonated,
     UserPerformingImpersonation,
     // Specific user targets for reassignments
    EmployeeReassignee,
    EmployeePreviousOne
 }

 export enum ENotificationType
 {
     // Plan Workflow - System
     UnassignedPlanAlert = 1,
     PlanAssignedForReview = 2,
     PlanReassignment = 3,
     InternalPlanSLAReminder = 4,
     InvestorPlanSLAReminder = 5,
     OverdueInternalPlan = 6,
     FinalApprovalRejection = 7,
     ReminderOnPlanAssignedforReview=8,
     CommentNotification=9,

     // Opportunity
     DraftOpportunityReminder = 21,
     OpportunityUpdateNotification = 22,
     NewOpportunityCreatedNotification = 23,
     InactiveOpportunityAlert = 24,

     // Access
     ImpersonationAccessAlert = 30
 }
