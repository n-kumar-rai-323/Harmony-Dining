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
  };
  enquiries: {
    byStatus: StatusCounts;
    open: number;
    upcoming: number;
    last7Days: number;
    last30Days: number;
  };
  reviews: {
    byStatus: StatusCounts;
    pendingModeration: number;
    published: number;
    featured: number;
    averageRating: number | null;
    last7Days: number;
    last30Days: number;
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
      createdAt: string;
    }>;
  };
};

export const DASHBOARD_PATH = '/admin/dashboard';
