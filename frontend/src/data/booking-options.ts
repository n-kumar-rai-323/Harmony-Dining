/* =========================================================
   BOOKING FORM OPTIONS

   Choices shown in the reservation and event-enquiry forms.

   Later:
     Harmony Admin
          ↓
     NestJS API
          ↓
     GET /reservations/public/availability
     GET /events/public/options
          ↓
     these accessors
========================================================= */

const RESERVATION_TIME_SLOTS: string[] = [
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '12:30 PM',
  '1:00 PM',
  '1:30 PM',
  '2:00 PM',
  '2:30 PM',
  '3:00 PM',
  '3:30 PM',
  '4:00 PM',
  '4:30 PM',
  '5:00 PM',
  '5:30 PM',
  '6:00 PM',
  '6:30 PM',
  '7:00 PM',
  '7:30 PM',
  '8:00 PM',
  '8:30 PM',
];

const RESERVATION_MAX_GUESTS = 12;

const EVENT_TYPES: string[] = [
  'Birthday',
  'Wedding',
  'Anniversary',
  'Corporate Event',
  'Family Gathering',
  'Engagement',
  'Private Celebration',
  'Other',
];

const EVENT_TIME_SLOTS: string[] = [
  'Morning',
  'Lunch',
  'Afternoon',
  'Evening',
  'Dinner',
  'Full Day',
];

export function getReservationTimeSlots(): string[] {
  return RESERVATION_TIME_SLOTS;
}

export function getReservationMaxGuests(): number {
  return RESERVATION_MAX_GUESTS;
}

export function getEventTypes(): string[] {
  return EVENT_TYPES;
}

export function getEventTimeSlots(): string[] {
  return EVENT_TIME_SLOTS;
}
