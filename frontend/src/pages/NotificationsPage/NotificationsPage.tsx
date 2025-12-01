/**
 * NotificationsPage component
 * Screen for displaying match notifications
 */

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  NotificationCard,
  MeetingConfirmationModal,
  ArchiveConfirmationModal,
  NotificationsEmptyState,
  ProfilePopup,
  EventPopup,
} from './components';
import { BottomNav } from '../HomePage/components';
import { api } from '../../api/client';
import type { Notification, GetNotificationsResponse } from './NotificationsPage.types';
import styles from './NotificationsPage.module.css';

export function NotificationsPage() {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [showEventPopup, setShowEventPopup] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get<GetNotificationsResponse>('/api/v1/notifications', {
        requireAuth: true,
      });

      if (response.success && response.data) {
        setNotifications(response.data.notifications);
      } else {
        console.error('Failed to fetch notifications:', response.error);
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleViewProfile = useCallback((notification: Notification) => {
    setSelectedUserId(notification.user.id);
    setShowProfilePopup(true);
  }, []);

  const handleViewEvent = useCallback((notification: Notification) => {
    setSelectedEventId(notification.event.id);
    setShowEventPopup(true);
  }, []);

  const handleWrite = useCallback((notification: Notification) => {
    // Open Telegram chat
    if (notification.user.telegramUsername) {
      const telegramUrl = `https://t.me/${notification.user.telegramUsername}`;
      window.open(telegramUrl, '_blank', 'noopener,noreferrer');
    } else {
      console.error('Telegram username not available');
    }
  }, []);

  const handleConfirmMeeting = useCallback((notification: Notification) => {
    setSelectedNotification(notification);
    setShowMeetingModal(true);
  }, []);

  const handleArchive = useCallback((notification: Notification) => {
    setSelectedNotification(notification);
    setShowArchiveModal(true);
  }, []);

  const confirmMeeting = useCallback(async () => {
    if (selectedNotification) {
      try {
        const response = await api.post(
          `/api/v1/notifications/${selectedNotification.id}/confirm-meeting`,
          {},
          { requireAuth: true }
        );

        if (response.success) {
          // Refresh notifications
          await fetchNotifications();
        } else {
          console.error('Failed to confirm meeting:', response.error);
        }
      } catch (error) {
        console.error('Error confirming meeting:', error);
      } finally {
        setShowMeetingModal(false);
        setSelectedNotification(null);
      }
    }
  }, [selectedNotification, fetchNotifications]);

  const confirmArchive = useCallback(async () => {
    if (selectedNotification) {
      try {
        const response = await api.post(
          `/api/v1/notifications/${selectedNotification.id}/archive`,
          {},
          { requireAuth: true }
        );

        if (response.success) {
          setNotifications((prev) => prev.filter((n) => n.id !== selectedNotification.id));
        } else {
          console.error('Failed to archive notification:', response.error);
        }
      } catch (error) {
        console.error('Error archiving notification:', error);
      } finally {
        setShowArchiveModal(false);
        setSelectedNotification(null);
      }
    }
  }, [selectedNotification]);

  const cancelMeeting = useCallback(() => {
    setShowMeetingModal(false);
    setSelectedNotification(null);
  }, []);

  const cancelArchive = useCallback(() => {
    setShowArchiveModal(false);
    setSelectedNotification(null);
  }, []);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.notificationsHeader}>
        <h1 className={styles.notificationsTitle}>{t('notifications.title')}</h1>
      </div>

      <div className={styles.notificationsList}>
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onViewProfile={() => handleViewProfile(notification)}
              onViewEvent={() => handleViewEvent(notification)}
              onWrite={() => handleWrite(notification)}
              onConfirmMeeting={() => handleConfirmMeeting(notification)}
              onArchive={() => handleArchive(notification)}
            />
          ))
        ) : (
          <NotificationsEmptyState />
        )}
      </div>

      {showMeetingModal && selectedNotification && (
        <MeetingConfirmationModal
          userName={selectedNotification.user.name}
          onConfirm={confirmMeeting}
          onCancel={cancelMeeting}
        />
      )}

      {showArchiveModal && selectedNotification && (
        <ArchiveConfirmationModal
          userName={selectedNotification.user.name}
          onConfirm={confirmArchive}
          onCancel={cancelArchive}
        />
      )}

      {showProfilePopup && selectedUserId && (
        <ProfilePopup userId={selectedUserId} onClose={() => setShowProfilePopup(false)} />
      )}

      {showEventPopup && selectedEventId && (
        <EventPopup eventId={selectedEventId} onClose={() => setShowEventPopup(false)} />
      )}

      <BottomNav activeTab="notifications" />
    </div>
  );
}

