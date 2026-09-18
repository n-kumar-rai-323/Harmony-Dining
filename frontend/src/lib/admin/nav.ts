import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import EventSeatRoundedIcon from '@mui/icons-material/EventSeatRounded';
import CelebrationRoundedIcon from '@mui/icons-material/CelebrationRounded';
import RateReviewRoundedIcon from '@mui/icons-material/RateReviewRounded';
import RestaurantMenuRoundedIcon from '@mui/icons-material/RestaurantMenuRounded';
import PhotoLibraryRoundedIcon from '@mui/icons-material/PhotoLibraryRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import WebRoundedIcon from '@mui/icons-material/WebRounded';
import ViewCarouselRoundedIcon from '@mui/icons-material/ViewCarouselRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import MarkEmailReadRoundedIcon from '@mui/icons-material/MarkEmailReadRounded';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import type { SvgIconComponent } from '@mui/icons-material';

export type AdminNavItem = {
  label: string;
  href: string;
  icon: SvgIconComponent;
  /** Permission required to see the item. null = any authenticated admin. */
  permission: string | null;
};

export const ADMIN_NAV: AdminNavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: DashboardRoundedIcon, permission: 'dashboard.read' },
  { label: 'Accounts', href: '/admin/accounts', icon: AccountBalanceWalletRoundedIcon, permission: null },
  { label: 'AI Module', href: '/admin/ai', icon: AutoAwesomeRoundedIcon, permission: null },
  { label: 'AI Calling', href: '/admin/ai-calling', icon: SupportAgentRoundedIcon, permission: null },
  { label: 'Reservations', href: '/admin/reservations', icon: EventSeatRoundedIcon, permission: 'reservations.read' },
  { label: 'Event enquiries', href: '/admin/enquiries', icon: CelebrationRoundedIcon, permission: 'enquiries.read' },
  { label: 'Messages', href: '/admin/messages', icon: ForumRoundedIcon, permission: 'messages.read' },
  { label: 'Reviews', href: '/admin/reviews', icon: RateReviewRoundedIcon, permission: 'reviews.read' },
  { label: 'Menu', href: '/admin/menu', icon: RestaurantMenuRoundedIcon, permission: 'menu.read' },
  { label: 'Gallery', href: '/admin/gallery', icon: PhotoLibraryRoundedIcon, permission: 'gallery.read' },
  { label: 'Events', href: '/admin/events', icon: CalendarMonthRoundedIcon, permission: 'events.read' },
  { label: 'Homepage', href: '/admin/homepage', icon: WebRoundedIcon, permission: 'homepage.read' },
  { label: 'Page Headers', href: '/admin/page-headers', icon: ViewCarouselRoundedIcon, permission: 'pageHeaders.read' },
  { label: 'Site settings', href: '/admin/site-settings', icon: TuneRoundedIcon, permission: 'settings.read' },
  { label: 'Admin users', href: '/admin/users', icon: GroupRoundedIcon, permission: 'users.read' },
  { label: 'Audit log', href: '/admin/audit', icon: HistoryRoundedIcon, permission: 'audit.read' },
  { label: 'Mail log', href: '/admin/mail-logs', icon: MarkEmailReadRoundedIcon, permission: 'mail.read' },
];
