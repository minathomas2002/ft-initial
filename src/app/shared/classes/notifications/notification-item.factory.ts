import { INotification, INotificationItem } from "src/app/core/layouts/main-layout/models/notifications.interface";
import { EPlanAction, ERoles, ERoutes } from "../../enums";
import { EInternalUserPlanStatus } from "../../interfaces";
import { ENotificationAction } from "../../enums/notification.enum";

class BaseNotificationParams {
  params?: Record<string, string>;
  route?: string[];
}

export class NotificationItemFactory {
  static create(notification: INotification, userRole: ERoles): INotificationItem {
    const roleValue = Number(userRole);
    if (roleValue === ERoles.Division_MANAGER) {
      const managerParams = new DivisionMangerNotificationParams(notification);
      return {
        ...notification,
        route: managerParams.route,
        params: managerParams.params,
      };
    }

    return notification;
  }
}

class DivisionMangerNotificationParams extends BaseNotificationParams {
  constructor(notification: INotification) {
    super();
    this.route = [ERoutes.dashboard, ERoutes.dvManager] as string[];
    switch (notification.action) {
      case EPlanAction.Submitted:
        this.params = {
          status: EInternalUserPlanStatus.UNASSIGNED.toString(),
          notificationAction: ENotificationAction.filter.toString(),
        };
        break;
    }
  }
}