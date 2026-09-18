import * as yup from 'yup';

/* =========================================================
   CONTACT FORM SCHEMA
   Mirrors backend CreateContactMessageDto (backend/src/contact-messages/dto.ts).
========================================================= */

export const CONTACT_LIMITS = {
  fullName: 120,
  phone: 30,
  subject: 150,
  message: 2000,
};

export const contactSchema = yup.object({
  fullName: yup
    .string()
    .trim()
    .min(2, 'Please enter your name')
    .max(CONTACT_LIMITS.fullName, 'That name is too long')
    .required('Your name is required'),

  email: yup
    .string()
    .trim()
    .email('Enter a valid email address')
    .max(200, 'That email is too long')
    .required('Your email is required'),

  phone: yup
    .string()
    .trim()
    .max(CONTACT_LIMITS.phone, 'That phone number is too long')
    .optional(),

  subject: yup
    .string()
    .trim()
    .max(CONTACT_LIMITS.subject, 'Keep the subject short')
    .optional(),

  message: yup
    .string()
    .trim()
    .min(4, 'Please write a little more')
    .max(CONTACT_LIMITS.message, 'That message is a bit long')
    .required('Please tell us how we can help'),
});

export type ContactFormValues = yup.InferType<typeof contactSchema>;
