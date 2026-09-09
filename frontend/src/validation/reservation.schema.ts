import * as yup from 'yup';

import { isNotInPast } from '@/lib/date';

/* =========================================================
   RESERVATION SCHEMA
========================================================= */

export const reservationSchema = yup
  .object({
    fullName: yup
      .string()
      .trim()
      .min(
        2,
        'Full name must be at least 2 characters',
      )
      .max(
        100,
        'Full name must be under 100 characters',
      )
      .required(
        'Full name is required',
      ),

    phone: yup
      .string()
      .trim()
      .matches(
        /^(?:\+977[-\s]?)?(?:96|97|98)\d{8}$/,
        'Enter a valid Nepal mobile number',
      )
      .required(
        'Phone number is required',
      ),

    date: yup
      .string()
      .required(
        'Reservation date is required',
      )
      .test(
        'not-in-past',
        'Reservation date cannot be in the past',
        (value) => isNotInPast(value),
      ),

    time: yup
      .string()
      .required(
        'Reservation time is required',
      ),

    guests: yup
      .string()
      .required(
        'Number of guests is required',
      ),

    note: yup
      .string()
      .trim()
      .max(
        500,
        'Special request must be under 500 characters',
      )
      .default(''),
  })
  .required();

export type ReservationFormValues =
  yup.InferType<
    typeof reservationSchema
  >;
