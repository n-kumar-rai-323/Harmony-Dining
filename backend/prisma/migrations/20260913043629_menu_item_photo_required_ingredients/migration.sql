/*
  Warnings:

  - Made the column `mediaId` on table `menu_items` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "menu_items" DROP CONSTRAINT "menu_items_mediaId_fkey";

-- AlterTable
ALTER TABLE "menu_items" ADD COLUMN     "ingredients" TEXT[] DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "mediaId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
