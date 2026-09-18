export type StatusCounts = Record<string, number>;

export type DashboardSummary = {
  generatedAt: string;
  reservations: {
    byStatus: StatusCounts;
    pending: number;
    upcoming: number;
    today: number;
    last7Days: number;
    last30Days: number;
    previous7Days: number;
    oldestPendingHours: number | null;
  };
  enquiries: {
    byStatus: StatusCounts;
    open: number;
    upcoming: number;
    upcomingWithin7Days: number;
    last7Days: number;
    last30Days: number;
    previous7Days: number;
  };
  reviews: {
    byStatus: StatusCounts;
    pendingModeration: number;
    published: number;
    featured: number;
    averageRating: number | null;
    last7Days: number;
    last30Days: number;
    previous7Days: number;
    latestPending: { rating: number; name: string } | null;
  };
  content: {
    menuItems: { total: number; published: number };
    menuCategories: { total: number; published: number };
    galleryItems: { total: number; published: number };
    events: { total: number; upcoming: number };
  };
  notifications: { unread: number };
  activity: {
    auditLast24h: number;
    recentAudit: Array<{
      id: string;
      action: string;
      entityType: string;
      entityId: string | null;
      actorEmail: string | null;
      before: unknown;
      after: unknown;
      createdAt: string;
      actor: { name: string } | null;
    }>;
    feed: ActivityFeedItem[];
  };
};

export type ActivityFeedItem = {
  id: string;
  kind: 'reservation' | 'enquiry' | 'review' | 'menu' | 'gallery';
  title: string;
  context: string | null;
  actorName: string | null;
  createdAt: string;
  actionLabel: string;
  actionHref: string;
};

export const DASHBOARD_PATH = '/admin/dashboard';
