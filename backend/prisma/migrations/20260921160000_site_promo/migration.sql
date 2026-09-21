-- CreateTable
CREATE TABLE "site_promos" (
    "key" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_promos_pkey" PRIMARY KEY ("key")
);
