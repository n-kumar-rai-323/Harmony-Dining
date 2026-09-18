import * as yup from 'yup';

/* =========================================================
   MENU CATEGORY SCHEMA
   Mirrors backend CreateCategoryDto / UpdateCategoryDto
   (backend/src/menu/dto.ts).
========================================================= */

export const menuCategorySchema = yup.object({
  name: yup
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(120, 'Name must be under 120 characters')
    .required('Name is required'),

  group: yup
    .mixed<'FOOD' | 'BEVERAGES' | 'BAR'>()
    .oneOf(['FOOD', 'BEVERAGES', 'BAR'])
    .required('Group is required'),

  description: yup
    .string()
    .trim()
    .max(500, 'Description must be under 500 characters')
    .optional(),
});

export type MenuCategoryFormValues = yup.InferType<typeof menuCategorySchema>;

export const MENU_CATEGORY_LIMITS = {
  name: 120,
  description: 500,
};
