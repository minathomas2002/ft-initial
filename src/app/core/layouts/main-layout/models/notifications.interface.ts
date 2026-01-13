import { EPlanAction } from "src/app/shared/enums";

export interface INotification {
  action: EPlanAction;
  actionURL: string;
  body: string;
  createdDate: string;
  customData: {
    PlanId: string,
  };
  from: string;
  id: string;
  isRead: boolean;
  readDate: string | null;
  title: string;
  to: string;
}

export interface INotificationItem extends INotification {
  route?: string[];
  params?: Record<string, string>;
}
