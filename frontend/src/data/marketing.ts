/* =========================================================
   MARKETING CONTENT

   Short feature / benefit lists shown across the site. Icons
   are referenced by key so this data stays serialisable and
   an admin API can supply it later.

   Render with <FeatureIcon iconKey={item.iconKey} />.
========================================================= */

export type IconKey =
  | 'celebration'
  | 'groups'
  | 'restaurant'
  | 'autoAwesome'
  | 'locationOn'
  | 'eventSeat'
  | 'restaurantMenu'
  | 'supportAgent'
  | 'schedule'
  | 'checkCircle'
  | 'spa'
  | 'favorite';

export type FeatureItem = {
  iconKey: IconKey;
  title: string;
  description: string;
};

const EVENT_CATEGORY_CARDS: FeatureItem[] = [
  {
    iconKey: 'celebration',
    title: 'Birthday Celebrations',
    description:
      'Warm celebrations designed for family, friends and unforgettable birthday moments.',
  },
  {
    iconKey: 'groups',
    title: 'Corporate Events',
    description:
      'Professional spaces for meetings, company dinners and team gatherings.',
  },
  {
    iconKey: 'restaurant',
    title: 'Private Dining',
    description:
      'A more intimate setting for families, friends and special occasions.',
  },
  {
    iconKey: 'autoAwesome',
    title: 'Custom Celebrations',
    description:
      'Tell us your idea and our team will help shape the experience around it.',
  },
];

const HARMONY_EVENT_BENEFITS: FeatureItem[] = [
  {
    iconKey: 'locationOn',
    title: 'Beautiful Venue',
    description:
      'A polished setting designed for dining, celebrations and memorable gatherings.',
  },
  {
    iconKey: 'eventSeat',
    title: 'Flexible Setup',
    description:
      'Seating and event arrangements can be planned around your guest count.',
  },
  {
    iconKey: 'restaurantMenu',
    title: 'Dining Together',
    description:
      'Coordinate your event experience with Harmony food and beverage options.',
  },
  {
    iconKey: 'supportAgent',
    title: 'Event Support',
    description:
      'Our team helps coordinate the important details before your event is confirmed.',
  },
];

const EVENT_ENQUIRY_STEPS: string[] = [
  'Share your event details',
  'We check your preferred date',
  'Our team contacts you',
  'Confirm the final plan',
];

const RESERVATION_BENEFITS: FeatureItem[] = [
  {
    iconKey: 'schedule',
    title: 'Choose Your Time',
    description:
      'Select your preferred date and dining time.',
  },
  {
    iconKey: 'groups',
    title: 'Tell Us Your Group Size',
    description:
      'Reserve for intimate dining or a larger table.',
  },
  {
    iconKey: 'checkCircle',
    title: 'We Confirm With You',
    description:
      'Our team checks availability before the reservation is confirmed.',
  },
];

const ABOUT_VALUES: FeatureItem[] = [
  {
    iconKey: 'spa',
    title: 'Fresh, considered ingredients',
    description:
      'We build our menu around seasonal produce and trusted suppliers, so every plate tastes the way it should.',
  },
  {
    iconKey: 'favorite',
    title: 'Hospitality that feels personal',
    description:
      'From a quiet dinner for two to a hall full of guests, our team looks after the details so you can be present.',
  },
  {
    iconKey: 'restaurant',
    title: 'One place for every occasion',
    description:
      'Everyday dining, private events and large celebrations share the same kitchen and the same standard of care.',
  },
];

export function getEventCategoryCards(): FeatureItem[] {
  return EVENT_CATEGORY_CARDS;
}

export function getHarmonyEventBenefits(): FeatureItem[] {
  return HARMONY_EVENT_BENEFITS;
}

export function getEventEnquirySteps(): string[] {
  return EVENT_ENQUIRY_STEPS;
}

export function getReservationBenefits(): FeatureItem[] {
  return RESERVATION_BENEFITS;
}

export function getAboutValues(): FeatureItem[] {
  return ABOUT_VALUES;
}
