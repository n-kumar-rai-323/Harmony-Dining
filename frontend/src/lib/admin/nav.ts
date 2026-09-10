import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import EventSeatRoundedIcon from '@mui/icons-material/EventSeatRounded';
import CelebrationRoundedIcon from '@mui/icons-material/CelebrationRounded';
import RateReviewRoundedIcon from '@mui/icons-material/RateReviewRounded';
import RestaurantMenuRoundedIcon from '@mui/icons-material/RestaurantMenuRounded';
import PhotoLibraryRoundedIcon from '@mui/icons-material/PhotoLibraryRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import WebRoundedIcon from '@mui/icons-material/WebRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import MarkEmailReadRoundedIcon from '@mui/icons-material/MarkEmailReadRounded';
import type { SvgIconComponent } from '@mui/icons-material';

export type AdminNavItem = {
  label: string;
  href: string;
  icon: SvgIconComponent;
  /** Permission required to see the item. null = any authenticated admin. */
  permission: string | null;
  /** Whether the screen has been built yet. */
  ready: boolean;
};

export const ADMIN_NAV: AdminNavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: DashboardRoundedIcon, permission: 'dashboard.read', ready: true },
  { label: 'Reservations', href: '/admin/reservations', icon: EventSeatRoundedIcon, permission: 'reservations.read', ready: true },
  { label: 'Event enquiries', href: '/admin/enquiries', icon: CelebrationRoundedIcon, permission: 'enquiries.read', ready: true },
  { label: 'Reviews', href: '/admin/reviews', icon: RateReviewRoundedIcon, permission: 'reviews.read', ready: true },
  { label: 'Menu', href: '/admin/menu', icon: RestaurantMenuRoundedIcon, permission: 'menu.read', ready: false },
  { label: 'Gallery', href: '/admin/gallery', icon: PhotoLibraryRoundedIcon, permission: 'gallery.read', ready: false },
  { label: 'Events', href: '/admin/events', icon: CalendarMonthRoundedIcon, permission: 'events.read', ready: false },
  { label: 'Homepage', href: '/admin/homepage', icon: WebRoundedIcon, permission: 'homepage.read', ready: true },
  { label: 'Site settings', href: '/admin/site-settings', icon: TuneRoundedIcon, permission: 'settings.read', ready: false },
  { label: 'Admin users', href: '/admin/users', icon: GroupRoundedIcon, permission: 'users.read', ready: false },
  { label: 'Audit log', href: '/admin/audit', icon: HistoryRoundedIcon, permission: 'audit.read', ready: false },
  { label: 'Mail log', href: '/admin/mail-logs', icon: MarkEmailReadRoundedIcon, permission: 'mail.read', ready: false },
];
