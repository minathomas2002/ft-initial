import { INotification, INotificationItem, INotificationParams, NotificationBehavior } from "src/app/core/layouts/main-layout/models/notifications.interface";
import { EOpportunityAction, EPlanAction, ERoles, ERoutes } from "../../enums";
import { ENotificationCategory } from "src/app/shared/enums/notificationSetting.enum";
import { safeJsonParse } from "src/app/shared/utils/safe-parse-json";

class BaseNotificationParams {
  route: string[] = [];
  params: Record<string, string> = {};
  behavior: NotificationBehavior = null;
}

export class NotificationItemFactory {
  static create(notification: INotification, userRole: ERoles): INotificationItem {

    notification = {...notification, customData: safeJsonParse(notification.customData)}

    const internalUsersRoles: ERoles[] = [
      ERoles.DEPARTMENT_MANAGER,
      ERoles.Division_MANAGER,
      ERoles.EMPLOYEE,
    ];

    // internal roles
    if (internalUsersRoles.includes(userRole)) {
      const internalUser = new InternalUserNotificationParams(notification);
      return {
        ...notification,
        route: internalUser.route,
        params: internalUser.params,
        behavior: internalUser.behavior,
      } as INotificationItem;
    }

    // investors
    if (userRole === ERoles.INVESTOR) {
      const investor = new InvestorNotificationParams(notification);
      return {
        ...notification,
        route: investor.route,
        params: investor.params,
        behavior: investor.behavior,
      } as INotificationItem;
    }

    // fallback for others
    return {
      ...notification,
      route: [],
      params: {},
      behavior: null,
    } as INotificationItem;
  }
}

class InternalUserNotificationParams extends BaseNotificationParams {
  constructor(notification: INotification) {
    super();
    const built = buildParams(notification);
    this.route = built.route;
    this.params = built.params;
    this.behavior = built.behavior;
  }
}

class InvestorNotificationParams extends BaseNotificationParams {
  constructor(notification: INotification) {
    super();
    const built = buildParams(notification);
    this.route = built.route;
    this.params = built.params;
    this.behavior = built.behavior;
  }
}

function buildParams(notification: INotification): INotificationParams {

  if (notification.notificationCategory === ENotificationCategory.PlanWorkflow) {
    return handlePlansNotificationFlow(notification)
  }

  if (notification.notificationCategory === ENotificationCategory.Opportunity) {
    return handleOpportunityNotificationFlow(notification)
  }

  return {route: [], params: {}, behavior: null}

}

function handlePlansNotificationFlow(notification: INotification) {
  const searchText = notification.customData?.PlanCode || '';
  const action = notification.action as EPlanAction;

  const baseNavigationConfig = {
    route: [],
    params: { searchText },
    behavior: null,
  };

  const actionsToOpenPlanDetails = new Set<EPlanAction>([]);

  const actionsToNavigate = new Set<EPlanAction>([
    EPlanAction.Submitted,
    EPlanAction.Reassigned,
    EPlanAction.Assigned,
    EPlanAction.AutoRejection,
    EPlanAction.CommentSubmitted,
    EPlanAction.Rejected,
    EPlanAction.DeptRejected,
    EPlanAction.DVRejected,
    EPlanAction.DVRejectionAcknowledged,
    EPlanAction.SystemReminder
  ]);

  if (actionsToNavigate.has(action)) {
    return { ...baseNavigationConfig, route: [ERoutes.plans] };
  }

  if (actionsToOpenPlanDetails.has(action)) {
    return { ...baseNavigationConfig, behavior: 'planDetails' as const };
  }

  return baseNavigationConfig
}

function handleOpportunityNotificationFlow(notification: INotification) {
  const opportunityId = notification.customData?.Id || '';
  const action = notification.action as EOpportunityAction;

  const baseNavigationConfig = {
    route: [],
    params: {},
    behavior: null,
  };

  const actionsToNavigateToOpportunity = new Set<EOpportunityAction>([
    EOpportunityAction.Publish,
    EOpportunityAction.Edit,
    EOpportunityAction.InActive,
  ])

  if (actionsToNavigateToOpportunity.has(action)) {
    return {...baseNavigationConfig, route: [ERoutes.opportunities, opportunityId]}
  }

  return baseNavigationConfig
}


