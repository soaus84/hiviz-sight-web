export type NotificationRoute = 'insights' | 'visits' | 'sites' | 'communities';

export interface Notification {
  id: string;
  tone: string;
  chip?: 'hi';
  icon: string;
  unread?: boolean;
  subject: string;
  verb: string;
  detail: string;
  when: string;
  to: NotificationRoute;
}
