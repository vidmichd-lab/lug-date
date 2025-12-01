/**
 * Types for NotificationCard component
 */

import type { Notification } from '../../NotificationsPage.types';

export interface NotificationCardProps {
  notification: Notification;
  onViewProfile: () => void;
  onViewEvent: () => void;
  onWrite: () => void;
  onConfirmMeeting: () => void;
  onArchive: () => void;
}

