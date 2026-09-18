import { adminApi } from '../api';

export type EnquiryStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'COMPLETED';

export type AdminEnquiry = {
  id: string;
  reference: string;
  fullName: string;
  phone: string;
  email: string | null;
  eventType: string;
  preferredDate: string;
  alternativeDate: string | null;
  startTime: string | null;
  endTime: string | null;
  guests: number;
  budget: number | string | null;
  requirements: string | null;
  status: EnquiryStatus;
  handledById: string | null;
  createdAt: string;
  updatedAt: string;
  hasConflict: boolean;
};

export type EnquiryHistoryEntry = {
  id: string;
  fromStatus: EnquiryStatus | null;
  toStatus: EnquiryStatus;
  changedById: string | null;
  changedByName: string | null;
  note: string | null;
  createdAt: string;
};

export type DateConflict = {
  date: string;
  events: { id: string; title: string; slug: string }[];
  approvedEnquiries: { id: string; reference: string; eventType: string }[];
};

export type AdminEnquiryDetail = Omit<AdminEnquiry, 'hasConflict'> & {
  history: EnquiryHistoryEntry[];
  conflicts: {
    preferred: DateConflict | null;
    alternative: DateConflict | null;
  };
};

export const ENQUIRIES_PATH = '/admin/enquiries';

export const ALL_STATUSES: EnquiryStatus[] = [
  'NEW',
  'CONTACTED',
  'PENDING',
  'APPROVED',
  'REJECTED',
  'CANCELLED',
  'COMPLETED',
];

/** Statuses reachable from a given status (mirrors the backend rules). */
export const NEXT_STATUSES: Record<EnquiryStatus, EnquiryStatus[]> = {
  NEW: ['CONTACTED', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'],
  CONTACTED: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'],
  PENDING: ['CONTACTED', 'APPROVED', 'REJECTED', 'CANCELLED'],
  APPROVED: ['COMPLETED', 'CANCELLED'],
  REJECTED: [],
  CANCELLED: [],
  COMPLETED: [],
};

export const enquiriesApi = {
  get: (id: string) =>
    adminApi.get<AdminEnquiryDetail>(`${ENQUIRIES_PATH}/${id}`),
  setStatus: (id: string, status: EnquiryStatus, note?: string) =>
    adminApi.post(`${ENQUIRIES_PATH}/${id}/status`, note ? { status, note } : { status }),
};

export function conflictCount(c: DateConflict | null): number {
  if (!c) return 0;
  return c.events.length + c.approvedEnquiries.length;
}
