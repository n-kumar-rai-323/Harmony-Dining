import { adminApi } from '../api';

export type ReservationStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'COMPLETED';

export type ReservationAction = 'confirm' | 'reject' | 'cancel' | 'complete';

export type AdminReservation = {
  id: string;
  reference: string;
  fullName: string;
  phone: string;
  email: string | null;
  date: string;
  time: string;
  guests: number;
  note: string | null;
  status: ReservationStatus;
  source: 'WEBSITE' | 'ADMIN';
  handledById: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ReservationHistoryEntry = {
  id: string;
  fromStatus: ReservationStatus | null;
  toStatus: ReservationStatus;
  changedById: string | null;
  changedByName: string | null;
  note: string | null;
  createdAt: string;
};

export type AdminReservationDetail = AdminReservation & {
  history: ReservationHistoryEntry[];
};

export const RESERVATIONS_PATH = '/admin/reservations';

/** Which workflow actions are offered for a given current status. */
export const NEXT_ACTIONS: Record<ReservationStatus, ReservationAction[]> = {
  PENDING: ['confirm', 'reject', 'cancel'],
  CONFIRMED: ['complete', 'cancel'],
  REJECTED: [],
  CANCELLED: [],
  COMPLETED: [],
};

export const ACTION_LABEL: Record<ReservationAction, string> = {
  confirm: 'Confirm',
  reject: 'Reject',
  cancel: 'Cancel',
  complete: 'Mark completed',
};

export const reservationsApi = {
  get: (id: string) =>
    adminApi.get<AdminReservationDetail>(`${RESERVATIONS_PATH}/${id}`),
  transition: (id: string, action: ReservationAction, note?: string) =>
    adminApi.post(`${RESERVATIONS_PATH}/${id}/${action}`, note ? { note } : {}),
};
