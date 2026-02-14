'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from '@/contexts/LocaleContext';
import {
  notificationApi,
  formatNotificationMessage,
  getNotificationTypeLabel,
  type Notification,
} from '@/lib/api/notifications';

export default function NotificationsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const t = useTranslations();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showRead, setShowRead] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch notifications
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await notificationApi.getNotifications(currentPage, 10, showRead);
        setNotifications(response.notifications);
        if (response.pagination) {
          setTotalPages(response.pagination.last_page);
        }
        setError(null);
      } catch {
        setError(t('notifications.error'));
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [isAuthenticated, currentPage, showRead, t]);

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
    } catch {
      // Silent fail — mark-all-as-read is non-critical
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('el-GR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (authLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto" data-testid="notifications-page">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <ol className="flex items-center gap-2 text-sm text-neutral-500">
          <li>
            <Link href="/" className="hover:text-primary">
              {t('nav.home')}
            </Link>
          </li>
          <li>/</li>
          <li className="text-neutral-900">{t('notifications.title')}</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-neutral-900" data-testid="page-title">
          {t('notifications.title')}
        </h1>
        <div className="flex items-center gap-4">
          {/* Filter Toggle */}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showRead}
              onChange={(e) => {
                setShowRead(e.target.checked);
                setCurrentPage(1);
              }}
              className="rounded border-neutral-300 text-primary focus:ring-primary"
            />
            {t('notifications.showRead')}
          </label>
          {/* Mark All Read */}
          {notifications.some((n) => !n.read_at) && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-primary hover:text-primary-dark font-medium"
              data-testid="mark-all-read-page"
            >
              {t('notifications.markAllRead')}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg text-center">
          {error}
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-neutral-50 rounded-lg p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-neutral-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <p className="text-neutral-500">{t('notifications.empty')}</p>
        </div>
      ) : (
        <>
          {/* Notification List */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 divide-y divide-neutral-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-neutral-50 transition-colors ${
                  !notification.read_at ? 'bg-primary-pale' : ''
                }`}
                data-testid="notification-item"
              >
                <div className="flex items-start gap-4">
                  {/* Unread indicator */}
                  <div className="flex-shrink-0 pt-1">
                    {!notification.read_at ? (
                      <span className="block w-2 h-2 bg-primary rounded-full" />
                    ) : (
                      <span className="block w-2 h-2" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-neutral-900">
                      {formatNotificationMessage(notification)}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-600">
                        {getNotificationTypeLabel(notification.type)}
                      </span>
                      <span className="text-xs text-neutral-500">
                        {formatDate(notification.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Action */}
                  {!notification.read_at && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="flex-shrink-0 text-xs text-primary hover:text-primary-dark"
                      data-testid="mark-read-btn"
                    >
                      {t('notifications.markRead')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-neutral-300 rounded hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('common.previous')}
              </button>
              <span className="text-sm text-neutral-600">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-neutral-300 rounded hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('common.next')}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
