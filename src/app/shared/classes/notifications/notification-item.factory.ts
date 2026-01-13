import { INotification, INotificationItem } from "src/app/core/layouts/main-layout/models/notifications.interface";
import { EPlanAction, ERoles, ERoutes } from "../../enums";
import { EInternalUserPlanStatus } from "../../interfaces";

class BaseNotificationParams {
  route: string[] = [];
  params: Record<string, string> = {};
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
      } as INotificationItem;
    }

    // investors
    if (userRole === ERoles.INVESTOR) {
      const investor = new EmployeeNotificationParams(notification);
      return {
        ...notification,
        route: investor.route,
        params: investor.params,
      } as INotificationItem;
    }

    // fallback for others
    return {
      ...notification,
      route: [],
      params: {},
    } as INotificationItem;
  }
}

class InternalUserNotificationParams extends BaseNotificationParams {
  constructor(notification: INotification) {
    super();
    const built = buildInternalParams(notification, [ERoutes.dashboard]);
    this.route = built.route;
    this.params = built.params;
  }
}

class EmployeeNotificationParams extends BaseNotificationParams {
  constructor(notification: INotification) {
    super();
    const built = buildInternalParams(notification, [ERoutes.dashboard, ERoutes.investors]);
    this.route = built.route;
    this.params = built.params;
  }
}

function buildInternalParams(notification: INotification, defaultRoute: string[]) {
  let route: string[] = [];
  let params: Record<string, string> = {};
  let parsedCustomData = safeParseCustomData(notification.customData);
  let searchText = parsedCustomData?.PlanId || '';
  let actionsToTrigger = [EPlanAction.Submitted, EPlanAction.Reassigned]

  if (actionsToTrigger.includes(notification.action)) {
    route = defaultRoute;
    params = { searchText };
  }

  return { route, params };
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


