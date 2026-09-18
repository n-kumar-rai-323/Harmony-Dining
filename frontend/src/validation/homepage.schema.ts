import * as yup from 'yup';

/* =========================================================
   HOMEPAGE CMS SCHEMAS
   Mirror backend Hero/Dining/Animated/Events/Reservation/
   Reviews/Location DTOs (backend/src/homepage/dto.ts).
========================================================= */

const ASSET_RE = /^(\/|https?:\/\/).+/i;
const HREF_RE = /^(\/|#|https?:\/\/|mailto:|tel:).+/i;

const imageSlide = yup.object({
  src: yup.string().matches(ASSET_RE, 'Upload a photo').max(300).required('Upload a photo'),
  alt: yup.string().trim().min(1, 'Add a description').max(200, 'Under 200 characters').required('Add a description'),
  position: yup.string().max(40).optional(),
});

const link = yup.object({
  label: yup.string().trim().min(1, 'Button text is required').max(80, 'Under 80 characters').required(),
  href: yup.string().matches(HREF_RE, 'Use a path, anchor or URL').max(300).required('Link is required'),
});

const toggleLink = yup.object({
  label: yup.string().trim().min(1, 'Button text is required').max(80, 'Under 80 characters').required(),
  enabled: yup.boolean().default(true),
});

const heroAction = yup.object({
  label: yup.string().trim().min(1, 'Label is required').max(80, 'Under 80 characters').required(),
  href: yup.string().matches(HREF_RE, 'Use a path, anchor or URL').max(300).required('Link is required'),
  iconKey: yup.mixed<'celebration' | 'calendar' | 'menu' | ''>().optional(),
  variant: yup.mixed<'primary' | 'secondary' | 'tertiary'>().oneOf(['primary', 'secondary', 'tertiary']).required(),
});

export const heroSectionSchema = yup.object({
  eyebrow: yup.string().trim().max(120, 'Under 120 characters').optional(),
  title: yup.string().trim().min(1, 'Headline is required').max(160, 'Under 160 characters').required(),
  accentTitle: yup.string().trim().max(120, 'Under 120 characters').optional(),
  description: yup.string().trim().max(600, 'Under 600 characters').optional(),
  image: yup.string().matches(ASSET_RE, 'Add at least one photo').max(300).required('Add at least one photo'),
  imageAlt: yup.string().trim().min(1).max(200).required(),
  images: yup.array(imageSlide).max(5, 'Up to 5 photos').default([]),
  imageLabel: yup.string().trim().max(80, 'Under 80 characters').optional(),
  imageCaption: yup.string().trim().max(120, 'Under 120 characters').optional(),
  actions: yup.array(heroAction).max(4, 'Up to 4 buttons').default([]),
});

export const diningSectionSchema = yup.object({
  eyebrow: yup.string().trim().max(120, 'Under 120 characters').optional(),
  title: yup.string().trim().min(1, 'Headline is required').max(160, 'Under 160 characters').required(),
  description: yup.string().trim().max(600, 'Under 600 characters').optional(),
  image: yup.string().matches(ASSET_RE, 'Add at least one photo').max(300).required('Add at least one photo'),
  imageAlt: yup.string().trim().min(1).max(200).required(),
  images: yup.array(imageSlide).max(5, 'Up to 5 photos').default([]),
  detail: yup
    .object({ title: yup.string().trim().max(60, 'Under 60 characters').optional(), iconKey: yup.string().optional() })
    .optional()
    .default(undefined),
  cta: link.optional().default(undefined),
});

const experienceStory = yup.object({
  id: yup.string().required(),
  eyebrow: yup.string().trim().max(80, 'Under 80 characters').optional(),
  title: yup.string().trim().min(1, 'Title is required').max(160, 'Under 160 characters').required(),
  description: yup.string().trim().max(600, 'Under 600 characters').optional(),
  image: yup.string().matches(ASSET_RE, 'Add a photo').max(300).required('Add a photo'),
  imageAlt: yup.string().trim().min(1, 'Add a description').max(200).required('Add a description'),
});

export const animatedSectionSchema = yup.object({
  eyebrow: yup.string().trim().max(120, 'Under 120 characters').optional(),
  title: yup.string().trim().min(1, 'Headline is required').max(160, 'Under 160 characters').required(),
  description: yup.string().trim().max(600, 'Under 600 characters').optional(),
  stories: yup.array(experienceStory).max(8, 'Up to 8 stories').default([]),
});

const eventFeature = yup.object({
  id: yup.string().required(),
  title: yup.string().trim().min(1, 'Title is required').max(80, 'Under 80 characters').required(),
  description: yup.string().trim().max(300, 'Under 300 characters').optional(),
  iconKey: yup.mixed<'celebration' | 'groups' | 'restaurant' | 'tune'>().oneOf(['celebration', 'groups', 'restaurant', 'tune']).required(),
});

export const eventsShowcaseSectionSchema = yup.object({
  enabled: yup.boolean().default(true),
  eyebrow: yup.string().trim().max(120, 'Under 120 characters').optional(),
  title: yup.string().trim().min(1, 'Headline is required').max(160, 'Under 160 characters').required(),
  accentTitle: yup.string().trim().max(160, 'Under 160 characters').optional(),
  closingTitle: yup.string().trim().max(160, 'Under 160 characters').optional(),
  description: yup.string().trim().max(600, 'Under 600 characters').optional(),
  image: yup.string().matches(ASSET_RE, 'Add a photo').max(300).required('Add a photo'),
  imageAlt: yup.string().trim().min(1).max(200).required(),
  imageLabel: yup.string().trim().max(80, 'Under 80 characters').optional(),
  imageMeta: yup.string().trim().max(120, 'Under 120 characters').optional(),
  tags: yup.array(yup.string().max(60)).max(12, 'Up to 12 tags').default([]),
  features: yup.array(eventFeature).max(8, 'Up to 8 features').default([]),
  primaryCta: link.optional().default(undefined),
  secondaryCta: link.optional().default(undefined),
  supportingNote: yup.string().trim().max(400, 'Under 400 characters').optional(),
});

const reservationBadge = yup.object({
  id: yup.string().required(),
  label: yup.string().trim().min(1, 'Badge text is required').max(80, 'Under 80 characters').required(),
  iconKey: yup.mixed<'calendar' | 'celebration' | 'clock' | 'groups' | 'restaurant'>()
    .oneOf(['calendar', 'celebration', 'clock', 'groups', 'restaurant'])
    .required(),
});

const reservationCard = yup.object({
  id: yup.string().required(),
  enabled: yup.boolean().default(true),
  eyebrow: yup.string().trim().max(80, 'Under 80 characters').optional(),
  title: yup.string().trim().min(1, 'Title is required').max(120, 'Under 120 characters').required(),
  description: yup.string().trim().max(400, 'Under 400 characters').optional(),
  iconKey: yup.mixed<'calendar' | 'celebration' | 'clock' | 'groups' | 'restaurant'>()
    .oneOf(['calendar', 'celebration', 'clock', 'groups', 'restaurant'])
    .required(),
  badges: yup.array(reservationBadge).max(4, 'Up to 4 badges').default([]),
  cta: yup
    .object({
      label: yup.string().trim().min(1, 'Button text is required').max(80).required(),
      href: yup.string().matches(HREF_RE, 'Use a path, anchor or URL').max(300).required('Link is required'),
      variant: yup.mixed<'contained' | 'outlined'>().oneOf(['contained', 'outlined']).required(),
    })
    .optional()
    .default(undefined),
});

export const reservationCtaSectionSchema = yup.object({
  enabled: yup.boolean().default(true),
  eyebrow: yup.string().trim().max(120, 'Under 120 characters').optional(),
  title: yup.string().trim().min(1, 'Headline is required').max(160, 'Under 160 characters').required(),
  accentTitle: yup.string().trim().max(160, 'Under 160 characters').optional(),
  description: yup.string().trim().max(600, 'Under 600 characters').optional(),
  cards: yup.array(reservationCard).max(4, 'Up to 4 cards').default([]),
  supportingNote: yup.string().trim().max(400, 'Under 400 characters').optional(),
});

export const reviewsSectionSchema = yup.object({
  enabled: yup.boolean().default(true),
  eyebrow: yup.string().trim().max(120, 'Under 120 characters').optional(),
  title: yup.string().trim().min(1, 'Headline is required').max(160, 'Under 160 characters').required(),
  accentTitle: yup.string().trim().max(160, 'Under 160 characters').optional(),
  description: yup.string().trim().max(600, 'Under 600 characters').optional(),
  footerText: yup.string().trim().max(400, 'Under 400 characters').optional(),
  cta: link.optional().default(undefined),
});

const nearbyPlace = yup.object({
  id: yup.string().required(),
  name: yup.string().trim().min(1, 'Name is required').max(120, 'Under 120 characters').required(),
  shortName: yup.string().trim().min(1, 'Short name is required').max(60, 'Under 60 characters').required(),
  category: yup.string().trim().min(1, 'Category is required').max(60, 'Under 60 characters').required(),
  latitude: yup.number().typeError('Enter a latitude').min(-90).max(90).required(),
  longitude: yup.number().typeError('Enter a longitude').min(-180).max(180).required(),
});

export const locationSectionSchema = yup.object({
  enabled: yup.boolean().default(true),
  eyebrow: yup.string().trim().max(120, 'Under 120 characters').optional(),
  title: yup.string().trim().min(1, 'Headline is required').max(160, 'Under 160 characters').required(),
  accentTitle: yup.string().trim().max(160, 'Under 160 characters').optional(),
  description: yup.string().trim().max(600, 'Under 600 characters').optional(),
  location: yup.object({
    id: yup.string().required(),
    name: yup.string().trim().min(1, 'Restaurant name is required').max(120, 'Under 120 characters').required(),
    address: yup.string().trim().min(1, 'Address is required').max(200, 'Under 200 characters').required(),
    latitude: yup.number().typeError('Enter a latitude').min(-90).max(90).required(),
    longitude: yup.number().typeError('Enter a longitude').min(-180).max(180).required(),
    openingHours: yup.string().trim().max(200, 'Under 200 characters').optional(),
  }),
  nearbyPlaces: yup.array(nearbyPlace).max(12, 'Up to 12 places').default([]),
  directionsCta: toggleLink.optional().default(undefined),
  mapCta: toggleLink.optional().default(undefined),
  helperText: yup.string().trim().max(300, 'Under 300 characters').optional(),
  estimateNote: yup.string().trim().max(300, 'Under 300 characters').optional(),
});

export const HOMEPAGE_SCHEMAS = {
  hero: heroSectionSchema,
  dining: diningSectionSchema,
  animated: animatedSectionSchema,
  eventsShowcase: eventsShowcaseSectionSchema,
  reservationCta: reservationCtaSectionSchema,
  reviews: reviewsSectionSchema,
  location: locationSectionSchema,
} as const;

export const HOMEPAGE_LIMITS = {
  eyebrow: 120,
  title: 160,
  accentTitle: 160,
  closingTitle: 160,
  description: 600,
  supportingNote: 400,
  footerText: 400,
  helperText: 300,
  estimateNote: 300,
  imageLabel: 80,
  imageCaption: 120,
  imageMeta: 120,
  photoAlt: 200,
  galleryMax: 5,
  storiesMax: 8,
  featuresMax: 8,
  cardsMax: 4,
  badgesMax: 4,
  nearbyPlacesMax: 12,
  actionsMax: 4,
} as const;
