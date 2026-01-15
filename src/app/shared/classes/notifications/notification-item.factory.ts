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
  const parsedCustomData = safeParseCustomData(notification.customData);
  const searchText = parsedCustomData?.PlanId || '';

  const action = (typeof notification.action === 'string'
    ? Number(notification.action)
    : notification.action) as EPlanAction;

  const baseNavigationConfig = {
    route: defaultRoute,
    params: { searchText },
  };

  const planDetailsActions = new Set<EPlanAction>([
    EPlanAction.AutoRejection,
    EPlanAction.CommentSubmitted,
    EPlanAction.Rejected,
    EPlanAction.DeptRejected,
    EPlanAction.DVRejected,
    EPlanAction.DVRejectionAcknowledged,
  ]);

  const navigationActions = new Set<EPlanAction>([
    EPlanAction.Submitted,
    EPlanAction.Reassigned,
    EPlanAction.Assigned,
  ]);

  if (planDetailsActions.has(action)) {
    return { ...baseNavigationConfig, behavior: 'planDetails' as const };
  }

  if (navigationActions.has(action)) {
    return { ...baseNavigationConfig, behavior: null };
  }

  return { route: [], params: {}, behavior: null };
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


