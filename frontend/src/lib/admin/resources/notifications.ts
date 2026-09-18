import { adminApi } from '../api';
import type { Paginated } from '../types';

export const NOTIFICATIONS_PATH = '/admin/notifications';

export type NotificationType =
  | 'RESERVATION_CREATED'
  | 'RESERVATION_CANCELLED'
  | 'ENQUIRY_CREATED'
  | 'REVIEW_CREATED'
  | 'CONTACT_MESSAGE_CREATED'
  | 'SYSTEM';

export type AdminNotification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string | null;
  entityType: string | null;
  entityId: string | null;
  createdAt: string;
  read: boolean;
  readAt: string | null;
};

export type NotificationPage = Paginated<AdminNotification> & { unreadCount: number };

/** Where a notification's entity is managed in the admin panel. */
export const ENTITY_HREF: Record<string, string> = {
  Reservation: '/admin/reservations',
  EventEnquiry: '/admin/enquiries',
  Review: '/admin/reviews',
  ContactMessage: '/admin/messages',
};

export const notificationsApi = {
  list: (params: string) =>
    adminApi.get<NotificationPage>(`${NOTIFICATIONS_PATH}${params}`),
  unreadCount: () =>
    adminApi.get<{ unreadCount: number }>(`${NOTIFICATIONS_PATH}/unread-count`),
  markRead: (id: string) =>
    adminApi.post<{ id: string; read: true }>(`${NOTIFICATIONS_PATH}/${id}/read`),
  markAllRead: () =>
    adminApi.post<{ marked: number }>(`${NOTIFICATIONS_PATH}/read-all`),
};
