import { EOpportunityAction, EPlanAction } from "src/app/shared/enums";
import { ENotificationCategory } from "src/app/shared/enums/notificationSetting.enum";

export interface INotification {
  action: EPlanAction | EOpportunityAction;
  actionURL: string;
  body: string;
  createdDate: string;
  customData: {
    PlanId: string,
    PlanType: number,
    PlanCode: string,
    Id: string
  };
  from: string;
  id: string;
  isRead: boolean;
  readDate: string | null;
  title: string;
  to: string;
  notificationCategory: ENotificationCategory
}

export interface INotificationItem extends INotification {
  route?: string[];
  params?: Record<string, string>;
  behavior: NotificationBehavior;
}

export interface INotificationParams {
  route: string[], params: Record<string, string>, behavior: NotificationBehavior
}

export type NotificationBehavior = 'planDetails' | null;

