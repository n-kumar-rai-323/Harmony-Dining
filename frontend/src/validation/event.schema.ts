import * as yup from 'yup';

/* =========================================================
   EVENT SCHEMA
   Mirrors backend CreateEventDto / UpdateEventDto
   (backend/src/events/dto.ts).
========================================================= */

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export const eventSchema = yup.object({
  title: yup
    .string()
    .trim()
    .min(2, 'Title must be at least 2 characters')
    .max(200, 'Title must be under 200 characters')
    .required('Title is required'),

  category: yup
    .string()
    .trim()
    .min(2, 'Category must be at least 2 characters')
    .max(80, 'Category must be under 80 characters')
    .required('Category is required'),

  summary: yup
    .string()
    .trim()
    .min(2, 'Summary must be at least 2 characters')
    .max(500, 'Summary must be under 500 characters')
    .required('Summary is required'),

  description: yup
    .string()
    .trim()
    .max(4000, 'Description must be under 4000 characters')
    .optional(),

  eventDate: yup
    .string()
    .length(10, 'Pick a valid date')
    .required('Event date is required'),

  startTime: yup
    .string()
    .matches(TIME_RE, { message: 'Use HH:mm', excludeEmptyString: true })
    .optional(),

  endTime: yup
    .string()
    .matches(TIME_RE, { message: 'Use HH:mm', excludeEmptyString: true })
    .optional(),

  guestsLabel: yup
    .string()
    .trim()
    .max(60, 'Guests label must be under 60 characters')
    .optional(),

  lifecycle: yup
    .mixed<'UPCOMING' | 'COMPLETED' | 'CANCELLED'>()
    .oneOf(['UPCOMING', 'COMPLETED', 'CANCELLED'])
    .required(),
});

export type EventFormValues = yup.InferType<typeof eventSchema>;

export const EVENT_LIMITS = {
  title: 200,
  category: 80,
  summary: 500,
  description: 4000,
  guestsLabel: 60,
  galleryMax: 4,
};
