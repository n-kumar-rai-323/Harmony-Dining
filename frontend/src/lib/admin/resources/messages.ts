import { adminApi } from '../api';

export const MESSAGES_PATH = '/admin/messages';

export type AdminContactMessage = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  isRead: boolean;
  readById: string | null;
  readAt: string | null;
  createdAt: string;
};

export const messagesApi = {
  markRead: (id: string) => adminApi.post<AdminContactMessage>(`${MESSAGES_PATH}/${id}/read`),
  markUnread: (id: string) => adminApi.post<AdminContactMessage>(`${MESSAGES_PATH}/${id}/unread`),
  remove: (id: string) => adminApi.delete(`${MESSAGES_PATH}/${id}`),
};
