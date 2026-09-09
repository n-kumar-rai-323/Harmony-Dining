import type { ComponentType } from 'react';

import type { SvgIconProps } from '@mui/material';

import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CelebrationRoundedIcon from '@mui/icons-material/CelebrationRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import EventSeatRoundedIcon from '@mui/icons-material/EventSeatRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import RestaurantMenuRoundedIcon from '@mui/icons-material/RestaurantMenuRounded';
import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import SpaRoundedIcon from '@mui/icons-material/SpaRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';

import type { IconKey } from '@/data/marketing';

/**
 * Maps a serialisable `IconKey` (from marketing data / a future
 * admin API) to a concrete MUI icon.
 */
const ICON_MAP: Record<
  IconKey,
  ComponentType<SvgIconProps>
> = {
  celebration: CelebrationRoundedIcon,
  groups: GroupsRoundedIcon,
  restaurant: RestaurantRoundedIcon,
  autoAwesome: AutoAwesomeRoundedIcon,
  locationOn: LocationOnRoundedIcon,
  eventSeat: EventSeatRoundedIcon,
  restaurantMenu: RestaurantMenuRoundedIcon,
  supportAgent: SupportAgentRoundedIcon,
  schedule: ScheduleRoundedIcon,
  checkCircle: CheckCircleRoundedIcon,
  spa: SpaRoundedIcon,
  favorite: FavoriteRoundedIcon,
};

type FeatureIconProps = SvgIconProps & {
  iconKey: IconKey;
};

export default function FeatureIcon({
  iconKey,
  ...props
}: FeatureIconProps) {
  const Icon =
    ICON_MAP[iconKey] ?? CelebrationRoundedIcon;

  return <Icon {...props} />;
}
