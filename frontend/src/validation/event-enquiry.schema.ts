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
   EVENT ENQUIRY SCHEMA
========================================================= */

export const eventEnquirySchema = yup
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

    email: yup
      .string()
      .trim()
      .email(
        'Enter a valid email address',
      )
      .default(''),

    eventType: yup
      .string()
      .required(
        'Event type is required',
      ),

    preferredDate: yup
      .string()
      .required(
        'Preferred date is required',
      )
      .test(
        'not-in-past',
        'Preferred date cannot be in the past',
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

    alternativeDate: yup
      .string()
      .default('')
      .test(
        'not-in-past',
        'Alternative date cannot be in the past',
        (value) => {
          if (!value) {
            return true;
          }

          return (
            value >=
            getTodayLocalDate()
          );
        },
      )
      .test(
        'different-from-preferred',
        'Alternative date should be different from the preferred date',
        function (value) {
          if (!value) {
            return true;
          }

          return (
            value !==
            this.parent
              .preferredDate
          );
        },
      ),

    guests: yup
      .number()
      .typeError(
        'Estimated guests is required',
      )
      .integer(
        'Guests must be a whole number',
      )
      .min(
        1,
        'At least 1 guest is required',
      )
      .max(
        2000,
        'Please contact Harmony directly for very large events',
      )
      .required(
        'Estimated guests is required',
      ),

    eventTime: yup
      .string()
      .required(
        'Preferred event time is required',
      ),

    requirements: yup
      .string()
      .trim()
      .max(
        1000,
        'Event details must be under 1000 characters',
      )
      .default(''),
  })
  .required();

export type EventEnquiryFormValues =
  yup.InferType<
    typeof eventEnquirySchema
  >;