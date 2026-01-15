import { INotification, INotificationItem } from "src/app/core/layouts/main-layout/models/notifications.interface";
import { EPlanAction, ERoles, ERoutes } from "../../enums";

export type NotificationBehavior = 'planDetails' | null;

class BaseNotificationParams {
  route: string[] = [];
  params: Record<string, string> = {};
  behavior: NotificationBehavior = null;
}

export class NotificationItemFactory {
  static create(notification: INotification, userRole: ERoles): INotificationItem {
    const internalUsersRoles: ERoles[] = [
      ERoles.DEPARTMENT_MANAGER,
      ERoles.Division_MANAGER,
      ERoles.EMPLOYEE,
    ];

    // managerial roles
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
    const built = buildInternalParams(notification, [ERoutes.plans]);
    this.route = built.route;
    this.params = built.params;
    this.behavior = built.behavior;
  }
}

class InvestorNotificationParams extends BaseNotificationParams {
  constructor(notification: INotification) {
    super();
    const built = buildInternalParams(notification, [ERoutes.plans]);
    this.route = built.route;
    this.params = built.params;
    this.behavior = built.behavior;
  }
}

function buildInternalParams(notification: INotification, defaultRoute: string[]) {
  let route: string[] = [];
  let params: Record<string, string> = {};
  let parsedCustomData = safeParseCustomData(notification.customData);
  let searchText = parsedCustomData?.PlanId || '';
  let actionsWithNavigations = [EPlanAction.Submitted, EPlanAction.Reassigned, EPlanAction.Assigned];
  let behavior: NotificationBehavior = null;

  const action = notification.action;

  if (action === EPlanAction.AutoRejection || action === EPlanAction.CommentSubmitted) {
    route = defaultRoute;
    params = { searchText };
    behavior = 'planDetails';
  } else if (actionsWithNavigations.includes(action)) {
    route = defaultRoute;
    params = { searchText };
    behavior = null;
  }

  return { route, params, behavior };
}

function safeParseCustomData(value: string | { PlanId: string; }) {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  return value;
};


