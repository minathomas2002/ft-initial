export interface INotification {
  action: number;
  actionURL: string;
  body: string;
  createdDate: string;
  customData: string;
  from: string;
  id: string;
  isRead: boolean;
  readDate: string | null;
  title: string;
  to: string;
}
