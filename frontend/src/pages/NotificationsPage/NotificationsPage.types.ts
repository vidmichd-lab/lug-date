/**
 * Types for NotificationsPage
 */

export interface NotificationUser {
  id: string;
  name: string;
  avatar: string;
  telegramUsername: string;
}

export interface NotificationEvent {
  id: string;
  title: string;
  image: string;
}

export interface Notification {
  id: string;
  type: 'match';
  user: NotificationUser;
  event: NotificationEvent;
  createdAt: string;
  isRead: boolean;
}

export interface NotificationsPageProps {
  userId?: string;
}

export interface GetNotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}
