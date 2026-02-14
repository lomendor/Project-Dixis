'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from '@/contexts/LocaleContext';
import {
  notificationApi,
  formatNotificationMessage,
  getNotificationTypeLabel,
  type Notification,
} from '@/lib/api/notifications';

interface NotificationDropdownProps {
  onClose: () => void;
  onNotificationsRead: () => void;
}

export default function NotificationDropdown({
  onClose,
  onNotificationsRead,
}: NotificationDropdownProps) {
  const t = useTranslations();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await notificationApi.getLatestNotifications(5);
        setNotifications(response.notifications);
        setError(null);
      } catch {
        setError(t('notifications.error'));
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [t]);

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await notificationApi.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n
        )
      );
    } catch {
      // Silent fail — mark-as-read is non-critical
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
      );
      onNotificationsRead();
    } catch {
      // Silent fail — mark-all-as-read is non-critical
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('notifications.justNow');
    if (diffMins < 60) return `${diffMins} ${t('notifications.minutesAgo')}`;
    if (diffHours < 24) return `${diffHours} ${t('notifications.hoursAgo')}`;
    return `${diffDays} ${t('notifications.daysAgo')}`;
  };

  return (
    <div
      className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-neutral-200 z-50"
      data-testid="notification-dropdown"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200">
        <h3 className="font-semibold text-neutral-900">{t('notifications.title')}</h3>
        {notifications.some((n) => !n.read_at) && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-xs text-primary hover:text-primary-dark font-medium"
            data-testid="mark-all-read"
          >
            {t('notifications.markAllRead')}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : error ? (
          <div className="px-4 py-8 text-center text-neutral-500">{error}</div>
        ) : notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-neutral-500">
            {t('notifications.empty')}
          </div>
        ) : (
          <ul>
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className={`px-4 py-3 border-b border-neutral-100 last:border-0 hover:bg-neutral-50 cursor-pointer ${
                  !notification.read_at ? 'bg-primary-pale' : ''
                }`}
                onClick={() => !notification.read_at && handleMarkAsRead(notification.id)}
                data-testid="notification-item"
              >
                <div className="flex items-start gap-3">
                  {/* Unread indicator */}
                  {!notification.read_at && (
                    <span className="flex-shrink-0 w-2 h-2 mt-2 bg-primary rounded-full" />
                  )}
                  <div className={`flex-1 ${notification.read_at ? 'ml-5' : ''}`}>
                    <p className="text-sm text-neutral-900">
                      {formatNotificationMessage(notification)}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-neutral-500">
                        {getNotificationTypeLabel(notification.type)}
                      </span>
                      <span className="text-xs text-neutral-400">
                        {formatTimeAgo(notification.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-neutral-200 bg-neutral-50 rounded-b-lg">
        <Link
          href="/account/notifications"
          onClick={onClose}
          className="block text-center text-sm text-primary hover:text-primary-dark font-medium"
          data-testid="view-all-notifications"
        >
          {t('notifications.viewAll')}
        </Link>
      </div>
    </div>
  );
}
