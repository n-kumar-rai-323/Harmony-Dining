import * as yup from 'yup';

/* =========================================================
   SITE SETTINGS SCHEMAS
   Mirrors backend BusinessDto / SocialLinkDto
   (backend/src/site-settings/dto.ts).
========================================================= */

// Loose international phone format: optional leading +, 7-20 digits/spaces/-/().
export const PHONE_RE = /^\+?[0-9()][0-9()\s-]{6,19}$/;
export const HEX_COLOR_RE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const HREF_RE = /^https?:\/\/.+/i;

export const businessSchema = yup.object({
  name: yup
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(120, 'Name must be under 120 characters')
    .required('Name is required'),

  phone: yup
    .string()
    .trim()
    .max(40, 'Phone must be under 40 characters')
    .test('phone-format', 'Enter a valid phone number', (v) => !v || PHONE_RE.test(v))
    .optional(),

  email: yup
    .string()
    .trim()
    .max(160, 'Email must be under 160 characters')
    .test('email-format', 'Enter a valid email address', (v) => !v || yup.string().email().isValidSync(v))
    .optional(),

  addressLines: yup.array(yup.string().max(160)).max(6, 'Up to 6 address lines').default([]),

  latitude: yup
    .number()
    .typeError('Latitude must be a number')
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90')
    .required(),

  longitude: yup
    .number()
    .typeError('Longitude must be a number')
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180')
    .required(),

  mapHref: yup
    .string()
    .trim()
    .max(300, 'Map link must be under 300 characters')
    .test(
      'map-href-format',
      'Use a page link (/#location) or a full https:// URL',
      (v) => !v || /^(\/|#|https?:\/\/)/i.test(v),
    )
    .optional(),
});

export type BusinessFormValues = yup.InferType<typeof businessSchema>;

export const socialLinkSchema = yup.object({
  platform: yup.string().required(),
  label: yup
    .string()
    .trim()
    .min(1, 'Label is required')
    .max(40, 'Label must be under 40 characters')
    .required('Label is required'),
  href: yup
    .string()
    .trim()
    .max(300, 'URL must be under 300 characters')
    .matches(HREF_RE, { message: 'Must be a valid http(s) URL', excludeEmptyString: false })
    .required('URL is required'),
  brandColor: yup
    .string()
    .trim()
    .test('hex-format', 'Enter a hex colour like #1877F2', (v) => !v || HEX_COLOR_RE.test(v))
    .optional(),
});

export type SocialLinkFormValues = yup.InferType<typeof socialLinkSchema>;

export const socialFormSchema = yup.object({
  links: yup.array(socialLinkSchema).max(12, 'Up to 12 social links').default([]),
});

export type SocialFormValues = yup.InferType<typeof socialFormSchema>;
