-- Domain integrity constraints that Prisma's schema language cannot express.

ALTER TABLE "reviews"
  ADD CONSTRAINT "reviews_rating_range" CHECK ("rating" BETWEEN 1 AND 5);

ALTER TABLE "reservations"
  ADD CONSTRAINT "reservations_guests_positive" CHECK ("guests" > 0);

ALTER TABLE "event_enquiries"
  ADD CONSTRAINT "event_enquiries_guests_positive" CHECK ("guests" > 0);

ALTER TABLE "menu_items"
  ADD CONSTRAINT "menu_items_price_nonneg" CHECK ("price" IS NULL OR "price" >= 0);

ALTER TABLE "menu_item_variants"
  ADD CONSTRAINT "menu_item_variants_price_nonneg" CHECK ("price" >= 0);

ALTER TABLE "reservation_settings"
  ADD CONSTRAINT "reservation_settings_sane"
  CHECK (
    "slotDurationMinutes" > 0
    AND "capacityPerSlot" > 0
    AND "maxGuestsPerReservation" > 0
    AND "maxAdvanceDays" > 0
  );
