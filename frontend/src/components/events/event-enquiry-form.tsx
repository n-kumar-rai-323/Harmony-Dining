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
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
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
import {
  getEventTimeSlots,
  getEventTypes,
} from '@/data/booking-options';

import {
  submitEventEnquiry,
  type EnquiryResult,
} from '@/lib/api/enquiries';

const eventTypes = getEventTypes();

const eventTimes = getEventTimeSlots();

/* =========================================================
   COMPONENT
========================================================= */

export default function EventEnquiryForm() {
  const theme = useTheme();

  const [
    submitResult,
    setSubmitResult,
  ] = useState<EnquiryResult | null>(
    null,
  );

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

     Posts to the public enquiry endpoint. The backend
     re-validates, files the enquiry as NEW (it never blocks
     a date), notifies Harmony and returns a reference
     number. When the API is not connected the helper
     reports that and the form falls back to a manual flow.
  ======================================================= */

  async function onSubmit(
    data:
      EventEnquiryFormValues,
  ) {
    setSubmitResult(null);

    const result =
      await submitEventEnquiry({
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

        startTime:
          data.eventTime ||
          null,

        guests:
          Number(
            data.guests,
          ),

        requirements:
          data.requirements
            ?.trim() ||
          null,
      });

    setSubmitResult(result);
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
            SUBMIT RESULT
        =================================================== */}

        {submitResult &&
        submitResult.ok === false ? (
          <Box
            role="alert"
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
                    .error
                    .main,
                  0.07,
                ),

              border:
                '1px solid',

              borderColor:
                alpha(
                  theme.palette
                    .error
                    .main,
                  0.24,
                ),

              borderRadius:
                1.5,
            }}
          >
            <ErrorOutlineRoundedIcon
              aria-hidden
              sx={{
                color:
                  'error.main',
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
                We couldn’t send
                your enquiry.
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
                {submitResult.error}
              </Typography>
            </Box>
          </Box>
        ) : null}

        {submitResult &&
        submitResult.ok ? (
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

            {submitResult.connected ? (
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight:
                      800,
                  }}
                >
                  Enquiry received —
                  reference{' '}
                  {submitResult.reference}
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
                  Our team will review
                  your request for{' '}
                  {submitResult.preferredDate}{' '}
                  and contact you before
                  anything is confirmed.
                  Please keep your
                  reference number.
                </Typography>
              </Box>
            ) : (
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
            )}
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