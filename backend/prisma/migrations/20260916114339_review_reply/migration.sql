-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "repliedAt" TIMESTAMP(3),
ADD COLUMN     "repliedById" TEXT,
ADD COLUMN     "reply" TEXT;
