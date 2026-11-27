-- Index referencing columns used by media deletion/reference checks.
CREATE INDEX "menu_items_mediaId_idx" ON "menu_items"("mediaId");
CREATE INDEX "gallery_items_mediaId_idx" ON "gallery_items"("mediaId");
CREATE INDEX "events_coverMediaId_idx" ON "events"("coverMediaId");
CREATE INDEX "event_media_mediaId_idx" ON "event_media"("mediaId");
CREATE INDEX "event_media_posterMediaId_idx" ON "event_media"("posterMediaId");
CREATE INDEX "review_photos_mediaId_idx" ON "review_photos"("mediaId");

-- NOT VALID avoids scanning existing rows while installing the checks.
-- Validation fails explicitly if legacy data needs repair; no rows are rewritten.
ALTER TABLE "event_enquiries" ADD CONSTRAINT "event_enquiries_budget_nonnegative"
  CHECK ("budget" IS NULL OR "budget" >= 0) NOT VALID;
ALTER TABLE "media" ADD CONSTRAINT "media_dimensions_valid"
  CHECK ("sizeBytes" >= 0 AND ("width" IS NULL OR "width" > 0)
    AND ("height" IS NULL OR "height" > 0)) NOT VALID;
ALTER TABLE "reservation_settings" ADD CONSTRAINT "reservation_settings_times_valid"
  CHECK ("leadTimeHours" >= 0
    AND "openingTime" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
    AND "closingTime" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
    AND "openingTime" < "closingTime") NOT VALID;
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_time_valid"
  CHECK ("time" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$') NOT VALID;
ALTER TABLE "event_enquiries" VALIDATE CONSTRAINT "event_enquiries_budget_nonnegative";
ALTER TABLE "media" VALIDATE CONSTRAINT "media_dimensions_valid";
ALTER TABLE "reservation_settings" VALIDATE CONSTRAINT "reservation_settings_times_valid";
ALTER TABLE "reservations" VALIDATE CONSTRAINT "reservations_time_valid";
