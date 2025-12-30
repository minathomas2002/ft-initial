import { ENotificationCategory, ENotificationRecipient, ENotificationType } from "src/app/shared/enums/notificationSetting.enum";
import { I18nService } from "src/app/shared/services/i18n";

export class notificationSettingMapper {

  constructor(private i18nService: I18nService) { }

  private _categoryTranslationMap: Record<ENotificationCategory, string> = {
    [ENotificationCategory.PlanWorkflow]: 'setting.adminView.notification.planWorkflowTitle',
    [ENotificationCategory.Opportunity]: 'setting.adminView.notification.opportunityNotifications',
    [ENotificationCategory.Access]: 'setting.adminView.notification.accessNotifications'

  };

  getCategoryName(catgId: string | number): string {
    const type = typeof catgId === 'string' ? parseInt(catgId) : catgId;
    const translationKey = this._categoryTranslationMap[type as ENotificationCategory];
    return translationKey ? this.i18nService.translate(translationKey) : catgId?.toString() || '';
  }

  private _recipitiontTranslationMap: Record<ENotificationRecipient, string> = {
    [ENotificationRecipient.DVManager]: 'setting.adminView.notification.dvManager',
    [ENotificationRecipient.Employee]: 'setting.adminView.notification.employee',
    [ENotificationRecipient.DepartmentManager]: 'setting.adminView.notification.departmentManager',
    [ENotificationRecipient.Investor]: 'setting.adminView.notification.investor',
    [ENotificationRecipient.Admins]: 'setting.adminView.notification.admins',
    [ENotificationRecipient.UserBeingImpersonated]: 'setting.adminView.notification.userBeingImpersonated',
    [ENotificationRecipient.UserPerformingImpersonation]: 'setting.adminView.notification.userperformingImpersonation',
    [ENotificationRecipient.EmployeePreviousOne]: 'setting.adminView.notification.employeePrev',
    [ENotificationRecipient.EmployeeReassignee]: 'setting.adminView.notification.employeeReassignee',


  };
  getRecipientName(recipitiont: string | number): string {
    const type = typeof recipitiont === 'string' ? parseInt(recipitiont) : recipitiont;
    const translationKey = this._recipitiontTranslationMap[type as ENotificationRecipient];
    return translationKey ? this.i18nService.translate(translationKey) : recipitiont?.toString() || '';
  }

  private _typetTranslationMap: Record<ENotificationType, string> = {
    [ENotificationType.UnassignedPlanAlert]: 'setting.adminView.notification.unAssignedAlert',
    [ENotificationType.PlanAssignedForReview]: 'setting.adminView.notification.planAssignedReview',
    [ENotificationType.PlanReassignment]: 'setting.adminView.notification.planReassignment',
    [ENotificationType.InternalPlanSLAReminder]: 'setting.adminView.notification.internalPlanSLAReminder',
    [ENotificationType.InvestorPlanSLAReminder]: 'setting.adminView.notification.investorPlanSLAReminder',
    [ENotificationType.OverdueInternalPlan]: 'setting.adminView.notification.overdueInternalPlan',
    [ENotificationType.FinalApprovalRejection]: 'setting.adminView.notification.finalApprovalRejectionNotification',
    [ENotificationType.InactiveOpportunityAlert]: 'setting.adminView.notification.inactiveOpportunityAlert',
    [ENotificationType.DraftOpportunityReminder]: 'setting.adminView.notification.draftOpportunityReminder',
    [ENotificationType.OpportunityUpdateNotification]: 'setting.adminView.notification.opportunityUpdateNotification',
    [ENotificationType.NewOpportunityCreatedNotification]: 'setting.adminView.notification.newOpportunityCreatedNotification',
    [ENotificationType.ImpersonationAccessAlert]: 'setting.adminView.notification.impersonationAccessAlert',

  };
  getTypeName(typeId: string | number): string {
    const type = typeof typeId === 'string' ? parseInt(typeId) : typeId;
    const translationKey = this._typetTranslationMap[type as ENotificationType];
    return translationKey ? this.i18nService.translate(translationKey) : typeId?.toString() || '';
  }

}