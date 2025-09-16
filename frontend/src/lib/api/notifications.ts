const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

export interface Notification {
  id: number;
  user_id: number;
  type: string;
  payload: {
    order_id?: number;
    message?: string;
    buyer_name?: string;
    total_amount?: number;
    refund_amount?: number;
    tracking_number?: string;
  };
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationResponse {
  success: boolean;
  notifications: Notification[];
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}

export interface UnreadCountResponse {
  success: boolean;
  unread_count: number;
}

export interface LatestNotificationsResponse {
  success: boolean;
  notifications: Notification[];
  unread_count: number;
}

export const notificationApi = {
  /**
   * Get paginated notifications for the authenticated user
   */
  async getNotifications(page = 1, perPage = 20, showRead = true): Promise<NotificationResponse> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const params = new URLSearchParams({
      per_page: perPage.toString(),
      show_read: showRead.toString(),
    });

    if (page > 1) {
      params.append('page', page.toString());
    }

    const response = await fetch(`${API_BASE_URL}/notifications?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  /**
   * Get unread notifications count
   */
  async getUnreadCount(): Promise<UnreadCountResponse> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  /**
   * Get latest unread notifications for the notification bell
   */
  async getLatestNotifications(limit = 5): Promise<LatestNotificationsResponse> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/notifications/latest?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  /**
   * Mark a specific notification as read
   */
  async markAsRead(notificationId: number): Promise<{ success: boolean; message: string }> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<{ success: boolean; message: string }> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },
};

/**
 * Format notification message for display
 */
export function formatNotificationMessage(notification: Notification): string {
  const { type, payload } = notification;

  switch (type) {
    case 'order_placed':
      if (payload.buyer_name) {
        return `Νέα παραγγελία από ${payload.buyer_name} - #${payload.order_id}`;
      }
      return `Η παραγγελία σας #${payload.order_id} καταχωρήθηκε επιτυχώς!`;

    case 'order_shipped':
      return `Η παραγγελία σας #${payload.order_id} έχει αποσταλεί!`;

    case 'refund_issued':
      return `Έγινε επιστροφή €${payload.refund_amount} για την παραγγελία #${payload.order_id}`;

    default:
      return payload.message || 'Νέα ειδοποίηση';
  }
}

/**
 * Get notification type label for display
 */
export function getNotificationTypeLabel(type: string): string {
  switch (type) {
    case 'order_placed':
      return 'Παραγγελία';
    case 'order_shipped':
      return 'Αποστολή';
    case 'refund_issued':
      return 'Επιστροφή';
    default:
      return 'Ειδοποίηση';
  }
}