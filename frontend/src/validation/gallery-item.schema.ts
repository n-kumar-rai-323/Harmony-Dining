import * as yup from 'yup';

/* =========================================================
   GALLERY ITEM SCHEMA
   Mirrors backend CreateGalleryItemDto / UpdateGalleryItemDto
   (backend/src/gallery/dto.ts), including the MinWords rules.
========================================================= */

export const GALLERY_CATEGORY_VALUES = [
  'DINING',
  'EVENTS',
  'SPACES',
  'TEAM',
  'KITCHEN',
] as const;

function minWords(min: number) {
  return (value: string | undefined) => {
    if (!value) return true;
    return value.trim().split(/\s+/).filter(Boolean).length >= min;
  };
}

export const galleryItemSchema = yup.object({
  mediaId: yup.string().required('A photo is required'),

  title: yup
    .string()
    .trim()
    .min(2, 'Title must be at least 2 characters')
    .max(160, 'Title must be under 160 characters')
    .test('min-words', 'Title must be at least 2 words', minWords(2))
    .required('Title is required'),

  altText: yup
    .string()
    .trim()
    .min(2, 'Alt text must be at least 2 characters')
    .max(300, 'Alt text must be under 300 characters')
    .test(
      'min-words',
      'Alt text must describe the image in at least 3 words',
      minWords(3),
    )
    .required('Alt text is required'),

  caption: yup
    .string()
    .trim()
    .max(500, 'Caption must be under 500 characters')
    .test('min-words', 'Caption must be at least 3 words', minWords(3))
    .optional(),

  category: yup
    .mixed<(typeof GALLERY_CATEGORY_VALUES)[number]>()
    .oneOf(GALLERY_CATEGORY_VALUES)
    .required('Category is required'),

  featuredOnHome: yup.boolean().default(false),
  published: yup.boolean().default(false),
});

export type GalleryItemFormValues = yup.InferType<typeof galleryItemSchema>;
