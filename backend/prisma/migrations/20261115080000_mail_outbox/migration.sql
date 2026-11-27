ALTER TABLE "mail_logs" ADD COLUMN "bodyHtml" TEXT,
  ADD COLUMN "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "lockedUntil" TIMESTAMP(3);
CREATE INDEX "mail_logs_status_nextAttemptAt_idx" ON "mail_logs"("status", "nextAttemptAt");
