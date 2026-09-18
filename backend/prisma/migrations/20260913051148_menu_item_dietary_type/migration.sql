-- CreateEnum
CREATE TYPE "DietaryType" AS ENUM ('VEG', 'NON_VEG', 'EGG');

-- AlterTable
ALTER TABLE "menu_items" ADD COLUMN     "dietary" "DietaryType";
