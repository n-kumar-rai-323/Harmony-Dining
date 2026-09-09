'use client';

import {
  useMemo,
  useState,
} from 'react';

import {
  alpha,
  Box,
  Button,
  MenuItem,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';

import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CelebrationRoundedIcon from '@mui/icons-material/CelebrationRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';

import {
  Controller,
  useForm,
  useWatch,
} from 'react-hook-form';

import {
  yupResolver,
} from '@hookform/resolvers/yup';

import {
  eventEnquirySchema,
  type EventEnquiryFormValues,
} from '@/validation/event-enquiry.schema';

import { getTodayLocalDate } from '@/lib/date';

/* =========================================================
   OPTIONS

   Future:
   GET /events/public/options
   controlled by Harmony Admin.
========================================================= */

const eventTypes = [
  'Birthday',
  'Wedding',
  'Anniversary',
  'Corporate Event',
  'Family Gathering',
  'Engagement',
  'Private Celebration',
  'Other',
];

const eventTimes = [
  'Morning',
  'Lunch',
  'Afternoon',
  'Evening',
  'Dinner',
  'Full Day',
];

/* =========================================================
   COMPONENT
========================================================= */

export default function EventEnquiryForm() {
  const theme = useTheme();

  const [
    requestReady,
    setRequestReady,
  ] = useState(false);

  const today =
    useMemo(
      () =>
        getTodayLocalDate(),
      [],
    );

  const {
    register,
    handleSubmit,
    control,
    formState: {
      errors,
      isSubmitting,
    },
  } =
    useForm<EventEnquiryFormValues>(
      {
        resolver:
          yupResolver(
            eventEnquirySchema,
          ),

        mode:
          'onTouched',

        defaultValues: {
          fullName: '',
          phone: '',
          email: '',
          eventType: '',
          preferredDate: '',
          alternativeDate: '',
          guests: 50,
          eventTime: '',
          requirements: '',
        },
      },
    );

  const requirements =
    useWatch({
      control,
      name: 'requirements',
    }) ?? '';

  /* =======================================================
     SUBMIT

     Current state:
     frontend validation only.

     Production:
     POST /event-bookings
  ======================================================= */

  async function onSubmit(
    data:
      EventEnquiryFormValues,
  ) {
    setRequestReady(false);

    const eventPayload = {
      fullName:
        data.fullName.trim(),

      phone:
        data.phone.trim(),

      email:
        data.email?.trim() ||
        null,

      eventType:
        data.eventType,

      preferredDate:
        data.preferredDate,

      alternativeDate:
        data.alternativeDate ||
        null,

      guests:
        Number(
          data.guests,
        ),

      eventTime:
        data.eventTime,

      requirements:
        data.requirements
          ?.trim() ||
        null,
    };

    console.log(
      'Event enquiry payload:',
      eventPayload,
    );

    /*
      =====================================================
      FUTURE PRODUCTION REQUEST
      =====================================================

      const response =
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/event-bookings`,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify(
                eventPayload,
              ),
          },
        );

      if (!response.ok) {
        throw new Error(
          'Unable to submit event enquiry',
        );
      }

      Backend responsibilities:

      1. Validate payload again
      2. Sanitize input
      3. Check tenant/event rules
      4. Generate enquiry number
      5. status = PENDING
      6. DO NOT block the date yet
      7. Save to PostgreSQL
      8. Notify Harmony Admin
      9. Staff reviews enquiry
      10. Only confirmed booking blocks date
    */

    setRequestReady(true);
  }

  return (
    <Box
      component="form"
      onSubmit={
        handleSubmit(
          onSubmit,
        )
      }
      noValidate
      sx={{
        overflow:
          'hidden',

        bgcolor:
          'background.paper',

        border:
          '1px solid',

        borderColor:
          'divider',

        borderRadius:
          2.5,

        boxShadow: {
          xs: 0,
          md:
            theme
              .shadows[4],
        },
      }}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <Box
        sx={{
          p: {
            xs: 2.5,
            sm: 3,
          },

          bgcolor:
            'primary.dark',

          color:
            'primary.contrastText',
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,

            display:
              'grid',

            placeItems:
              'center',

            borderRadius:
              '50%',

            bgcolor:
              alpha(
                theme.palette
                  .primary
                  .contrastText,
                0.08,
              ),

            color:
              'secondary.light',
          }}
        >
          <CelebrationRoundedIcon
            aria-hidden
          />
        </Box>

        <Typography
          variant="overline"
          sx={{
            display:
              'block',

            mt: 1.6,

            color:
              'secondary.light',
          }}
        >
          Plan Your Event
        </Typography>

        <Typography
          component="h2"
          variant="h3"
          sx={{
            mt: 0.5,

            color:
              'primary.contrastText',
          }}
        >
          Tell us about your celebration.
        </Typography>

        <Typography
          variant="body2"
          sx={{
            mt: 1,

            maxWidth:
              580,

            color:
              'primary.contrastText',

            opacity: 0.74,
          }}
        >
          Share your preferred
          date, guest count and
          event details. Our team
          will review your request
          and contact you before
          anything is confirmed.
        </Typography>
      </Box>

      {/* =====================================================
          FORM
      ===================================================== */}

      <Stack
        sx={{
          p: {
            xs: 2.4,
            sm: 3,
          },

          gap: 2,
        }}
      >
        {/* NAME + PHONE */}

        <Box
          sx={{
            display:
              'grid',

            gridTemplateColumns:
              {
                xs: '1fr',

                sm:
                  'repeat(2,minmax(0,1fr))',
              },

            gap: 2,
          }}
        >
          <TextField
            label="Full Name"
            placeholder="Your full name"
            autoComplete="name"
            fullWidth
            required
            {...register(
              'fullName',
            )}
            error={
              Boolean(
                errors.fullName,
              )
            }
            helperText={
              errors.fullName
                ?.message
            }
          />

          <TextField
            label="Phone Number"
            placeholder="98XXXXXXXX"
            type="tel"
            autoComplete="tel"
            fullWidth
            required
            {...register(
              'phone',
            )}
            error={
              Boolean(
                errors.phone,
              )
            }
            helperText={
              errors.phone
                ?.message
            }
            slotProps={{
              htmlInput: {
                inputMode:
                  'tel',
              },
            }}
          />
        </Box>

        {/* EMAIL + EVENT TYPE */}

        <Box
          sx={{
            display:
              'grid',

            gridTemplateColumns:
              {
                xs: '1fr',

                sm:
                  'repeat(2,minmax(0,1fr))',
              },

            gap: 2,
          }}
        >
          <TextField
            label="Email"
            placeholder="Optional"
            type="email"
            autoComplete="email"
            fullWidth
            {...register(
              'email',
            )}
            error={
              Boolean(
                errors.email,
              )
            }
            helperText={
              errors.email
                ?.message
            }
          />

          <Controller
            name="eventType"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Event Type"
                fullWidth
                required
                error={Boolean(
                  errors.eventType,
                )}
                helperText={
                  errors.eventType
                    ?.message
                }
              >
                <MenuItem value="">
                  Select event type
                </MenuItem>

                {eventTypes.map(
                  (eventType) => (
                    <MenuItem
                      key={eventType}
                      value={eventType}
                    >
                      {eventType}
                    </MenuItem>
                  ),
                )}
              </TextField>
            )}
          />
        </Box>

        {/* DATE + TIME */}

        <Box
          sx={{
            display:
              'grid',

            gridTemplateColumns:
              {
                xs: '1fr',

                sm:
                  'repeat(2,minmax(0,1fr))',
              },

            gap: 2,
          }}
        >
          <TextField
            label="Preferred Date"
            type="date"
            fullWidth
            required
            {...register(
              'preferredDate',
            )}
            error={
              Boolean(
                errors.preferredDate,
              )
            }
            helperText={
              errors.preferredDate
                ?.message
            }
            slotProps={{
              inputLabel: {
                shrink: true,
              },

              htmlInput: {
                min: today,
              },
            }}
          />

          <Controller
            name="eventTime"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Preferred Time"
                fullWidth
                required
                error={Boolean(
                  errors.eventTime,
                )}
                helperText={
                  errors.eventTime
                    ?.message
                }
              >
                <MenuItem value="">
                  Select time
                </MenuItem>

                {eventTimes.map(
                  (time) => (
                    <MenuItem
                      key={time}
                      value={time}
                    >
                      {time}
                    </MenuItem>
                  ),
                )}
              </TextField>
            )}
          />
        </Box>

        {/* GUESTS + ALTERNATIVE DATE */}

        <Box
          sx={{
            display:
              'grid',

            gridTemplateColumns:
              {
                xs: '1fr',

                sm:
                  'repeat(2,minmax(0,1fr))',
              },

            gap: 2,
          }}
        >
          <TextField
            label="Estimated Guests"
            type="number"
            fullWidth
            required
            {...register(
              'guests',
            )}
            error={
              Boolean(
                errors.guests,
              )
            }
            helperText={
              errors.guests
                ?.message
            }
            slotProps={{
              htmlInput: {
                min: 1,
                max: 2000,

                inputMode:
                  'numeric',
              },
            }}
          />

          <TextField
            label="Alternative Date"
            type="date"
            fullWidth
            {...register(
              'alternativeDate',
            )}
            error={
              Boolean(
                errors.alternativeDate,
              )
            }
            helperText={
              errors.alternativeDate
                ?.message ??
              'Optional'
            }
            slotProps={{
              inputLabel: {
                shrink: true,
              },

              htmlInput: {
                min: today,
              },
            }}
          />
        </Box>

        {/* EVENT DETAILS */}

        <TextField
          label="Tell Us About Your Event"
          placeholder="Decoration ideas, food preferences, seating requirements or anything else we should know..."
          multiline
          minRows={4}
          fullWidth
          {...register(
            'requirements',
          )}
          error={
            Boolean(
              errors.requirements,
            )
          }
          helperText={
            errors.requirements
              ?.message ??
            `${requirements.length}/1000`
          }
          slotProps={{
            htmlInput: {
              maxLength:
                1000,
            },
          }}
        />

        {/* ===================================================
            FRONTEND DEVELOPMENT STATE
        =================================================== */}

        {requestReady ? (
          <Box
            role="status"
            sx={{
              p: 1.6,

              display:
                'grid',

              gridTemplateColumns:
                '28px minmax(0,1fr)',

              gap: 1,

              bgcolor:
                alpha(
                  theme.palette
                    .primary
                    .main,
                  0.07,
                ),

              border:
                '1px solid',

              borderColor:
                alpha(
                  theme.palette
                    .primary
                    .main,
                  0.22,
                ),

              borderRadius:
                1.5,
            }}
          >
            <CheckCircleRoundedIcon
              aria-hidden
              sx={{
                color:
                  'primary.main',
              }}
            />

            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight:
                    800,
                }}
              >
                Your event details
                are ready.
              </Typography>

              <Typography
                variant="caption"
                sx={{
                  display:
                    'block',

                  mt: 0.25,

                  color:
                    'text.secondary',
                }}
              >
                Online submission
                will become active
                when Harmony’s
                booking service is
                connected.
              </Typography>
            </Box>
          </Box>
        ) : null}

        {/* ===================================================
            SUBMIT
        =================================================== */}

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={
            isSubmitting
          }
          startIcon={
            <EventAvailableRoundedIcon />
          }
          endIcon={
            <ArrowForwardRoundedIcon />
          }
          sx={{
            minHeight:
              54,

            mt: 0.5,
          }}
        >
          {isSubmitting
            ? 'Checking Details...'
            : 'Send Event Enquiry'}
        </Button>

        <Box
          sx={{
            display:
              'flex',

            alignItems:
              'flex-start',

            justifyContent:
              'center',

            gap: 0.8,
          }}
        >
          <GroupsRoundedIcon
            aria-hidden
            sx={{
              mt: 0.05,

              fontSize:
                16,

              color:
                'text.secondary',
            }}
          />

          <Typography
            variant="caption"
            sx={{
              maxWidth:
                560,

              textAlign:
                'center',

              color:
                'text.secondary',
            }}
          >
            Sending an enquiry
            does not reserve the
            date. Harmony confirms
            availability and final
            booking with you
            separately.
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}