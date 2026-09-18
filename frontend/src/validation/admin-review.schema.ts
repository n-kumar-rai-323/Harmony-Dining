import * as yup from 'yup';

/* =========================================================
   ADMIN "ADD A REVIEW" SCHEMA
   Mirrors backend AdminCreateReviewDto (backend/src/reviews/dto.ts).
========================================================= */

export const ADMIN_REVIEW_LIMITS = { name: 80, role: 80, comment: 1500, photosMax: 3 };

export const adminReviewSchema = yup.object({
  name: yup
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(ADMIN_REVIEW_LIMITS.name, `Name must be under ${ADMIN_REVIEW_LIMITS.name} characters`)
    .required('Guest name is required'),

  role: yup
    .string()
    .trim()
    .max(ADMIN_REVIEW_LIMITS.role, `Label must be under ${ADMIN_REVIEW_LIMITS.role} characters`)
    .optional(),

  rating: yup
    .number()
    .typeError('Choose a rating')
    .min(1, 'Choose a rating')
    .max(5, 'Choose a rating')
    .required('Choose a rating'),

  comment: yup
    .string()
    .trim()
    .min(4, 'Comment must be at least 4 characters')
    .max(
      ADMIN_REVIEW_LIMITS.comment,
      `Comment must be under ${ADMIN_REVIEW_LIMITS.comment} characters`,
    )
    .required('Comment is required'),

  approve: yup.boolean().default(true),
  feature: yup.boolean().default(false),
});

export type AdminReviewFormValues = yup.InferType<typeof adminReviewSchema>;

/* =========================================================
   ADMIN REPLY SCHEMA
   Mirrors backend ReplyToReviewDto (backend/src/reviews/dto.ts).
   An empty/blank reply is valid — it clears an existing reply.
========================================================= */

export const REVIEW_REPLY_LIMIT = 1000;

export const reviewReplySchema = yup.object({
  reply: yup
    .string()
    .trim()
    .max(REVIEW_REPLY_LIMIT, `Reply must be under ${REVIEW_REPLY_LIMIT} characters`)
    .default(''),
});

export type ReviewReplyFormValues = yup.InferType<typeof reviewReplySchema>;
