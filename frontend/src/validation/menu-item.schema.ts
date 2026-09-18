import * as yup from 'yup';

/* =========================================================
   MENU ITEM SCHEMA
   Mirrors backend CreateItemDto / UpdateItemDto
   (backend/src/menu/dto.ts).
========================================================= */

export const menuVariantSchema = yup.object({
  id: yup.string().optional(),
  label: yup
    .string()
    .trim()
    .min(1, 'Portion name is required')
    .max(80, 'Portion name must be under 80 characters')
    .required('Portion name is required'),
  price: yup
    .number()
    .typeError('Enter a price')
    .min(0, 'Price must be 0 or more')
    .required('Price is required'),
});

export const menuItemSchema = yup
  .object({
    categoryId: yup.string().required('Category is required'),

    name: yup
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(160, 'Name must be under 160 characters')
      .required('Name is required'),

    description: yup
      .string()
      .trim()
      .max(1000, 'Description must be under 1000 characters')
      .optional(),

    mediaId: yup.string().required('A photo is required'),

    dietary: yup
      .mixed<'VEG' | 'NON_VEG' | 'EGG' | ''>()
      .oneOf(['VEG', 'NON_VEG', 'EGG', ''])
      .optional(),

    isAvailable: yup.boolean().default(true),
    isFeatured: yup.boolean().default(false),

    priceMode: yup
      .mixed<'number' | 'variants'>()
      .oneOf(['number', 'variants'])
      .required(),

    price: yup.string().default(''),

    // Kept as raw comma-separated text in the form; split into arrays on submit.
    tags: yup.string().default(''),
    ingredients: yup.string().default(''),

    variants: yup.array(menuVariantSchema).max(20, 'Up to 20 portions').default([]),
  })
  .test('pricing', 'Add a price or at least one portion', function pricingTest(value) {
    if (value.priceMode === 'number') {
      if (value.price !== '' && value.price != null) return true;
      return this.createError({ path: 'price', message: 'Add a price' });
    }
    if (value.priceMode === 'variants') {
      if ((value.variants?.length ?? 0) > 0) return true;
      return this.createError({ path: 'variants', message: 'Add at least one portion' });
    }
    return false;
  });

export type MenuItemFormValues = yup.InferType<typeof menuItemSchema>;

export const MENU_ITEM_LIMITS = {
  name: 160,
  description: 1000,
  variantLabel: 80,
  variantsMax: 20,
};
