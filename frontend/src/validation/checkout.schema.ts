import * as yup from 'yup';

export const checkoutSchema = yup
  .object({
    fullName: yup
      .string()
      .trim()
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name must be under 100 characters')
      .required('Full name is required'),

    phone: yup
      .string()
      .trim()
      .matches(
        /^(?:\+977[-\s]?)?(?:98|97|96)\d{8}$/,
        'Enter a valid Nepal mobile number',
      )
      .required('Phone number is required'),

    orderNote: yup
      .string()
      .trim()
      .max(500, 'Order note must be under 500 characters')
      .default(''),
  })
  .required();

export type CheckoutFormValues = yup.InferType<
  typeof checkoutSchema
>;