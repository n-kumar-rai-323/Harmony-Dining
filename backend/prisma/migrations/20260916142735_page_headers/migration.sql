-- CreateTable
CREATE TABLE "page_headers" (
    "key" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_headers_pkey" PRIMARY KEY ("key")
);
