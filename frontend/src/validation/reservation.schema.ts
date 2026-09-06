import * as yup from 'yup';

/* =========================================================
   HELPERS
========================================================= */

function getTodayLocalDate() {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(
    now.getMonth() + 1,
  ).padStart(2, '0');

  const day = String(
    now.getDate(),
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

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
        (value) => {
          if (!value) {
            return false;
          }

          return (
            value >=
            getTodayLocalDate()
          );
        },
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