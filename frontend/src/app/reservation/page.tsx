'use client';

import {
  useMemo,
  useState,
} from 'react';

import Image from 'next/image';
import Link from 'next/link';

import {
  alpha,
  Box,
  Button,
  Container,
  MenuItem,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';

import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';

import {
  yupResolver,
} from '@hookform/resolvers/yup';

import {
  useForm,
  useWatch,
} from 'react-hook-form';

import {
  reservationSchema,
  type ReservationFormValues,
} from '@/validation/reservation.schema';

/* =========================================================
   DEVELOPMENT TIME SLOTS

   Future:
   GET /reservations/public/availability
========================================================= */

const timeSlots = [
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

/* =========================================================
   COMPACT BENEFITS
========================================================= */

const reservationBenefits = [
  {
    title: 'Choose Your Time',
    description:
      'Select your preferred date and dining time.',
    icon: ScheduleRoundedIcon,
  },
  {
    title: 'Tell Us Your Group Size',
    description:
      'Reserve for intimate dining or a larger table.',
    icon: GroupsRoundedIcon,
  },
  {
    title: 'We Confirm With You',
    description:
      'Our team checks availability before the reservation is confirmed.',
    icon: CheckCircleRoundedIcon,
  },
];

/* =========================================================
   HELPERS
========================================================= */

function getTodayLocalDate() {
  const now = new Date();

  const year =
    now.getFullYear();

  const month = String(
    now.getMonth() + 1,
  ).padStart(2, '0');

  const day = String(
    now.getDate(),
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/* =========================================================
   PAGE
========================================================= */

export default function ReservationPage() {
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
    useForm<ReservationFormValues>(
      {
        resolver:
          yupResolver(
            reservationSchema,
          ),

        mode:
          'onTouched',

        defaultValues: {
          fullName: '',
          phone: '',
          date: '',
          time: '',
          guests: '2',
          note: '',
        },
      },
    );

  const note =
    useWatch({
      control,
      name: 'note',
    }) ?? '';

  async function onSubmit(
    data:
      ReservationFormValues,
  ) {
    setRequestReady(false);

    const reservationPayload = {
      fullName:
        data.fullName.trim(),

      phone:
        data.phone.trim(),

      date:
        data.date,

      time:
        data.time,

      guests:
        Number(
          data.guests,
        ),

      note:
        data.note?.trim() ||
        null,
    };

    console.log(
      'Reservation payload:',
      reservationPayload,
    );

    /*
      FUTURE PRODUCTION API:

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reservations`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify(
            reservationPayload,
          ),
        },
      );

      if (!response.ok) {
        throw new Error(
          'Unable to create reservation request',
        );
      }

      Backend responsibilities:
      - validate again
      - sanitize payload
      - check slot availability
      - check restaurant capacity
      - prevent overbooking
      - create reservation number
      - status = PENDING
      - save PostgreSQL
      - show request in Admin Dashboard
    */

    setRequestReady(true);
  }

  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',

        bgcolor:
          'background.default',

        color:
          'text.primary',
      }}
    >
      {/* =====================================================
          HERO
      ===================================================== */}

      <Box
        component="section"
        sx={{
          pt: {
            xs: 2,
            sm: 3,
            md: 4,
          },

          pb: {
            xs: 5,
            md: 7,
          },
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              position:
                'relative',

              minHeight: {
                xs: 520,
                sm: 560,
                md: 600,
              },

              overflow:
                'hidden',

              borderRadius: {
                xs: 2,
                md: 3,
              },

              bgcolor:
                'primary.dark',

              border:
                '1px solid',

              borderColor:
                'divider',
            }}
          >
            <Image
              src="/images/home/harmony-hero-dining.jpg"
              alt="Dining experience at Harmony Dining and Event Center"
              fill
              priority
              quality={80}
              sizes="(max-width: 1200px) 100vw, 1200px"
              style={{
                objectFit:
                  'cover',

                objectPosition:
                  'center',
              }}
            />

            <Box
              aria-hidden
              sx={{
                position:
                  'absolute',

                inset: 0,

                bgcolor:
                  'primary.dark',

                opacity: {
                  xs: 0.74,
                  md: 0.66,
                },
              }}
            />

            <Box
              sx={{
                position:
                  'relative',

                zIndex: 1,

                minHeight: {
                  xs: 520,
                  sm: 560,
                  md: 600,
                },

                display:
                  'flex',

                alignItems:
                  'center',

                px: {
                  xs: 2.5,
                  sm: 4,
                  md: 6,
                },

                py: {
                  xs: 5,
                  md: 6,
                },
              }}
            >
              <Box
                sx={{
                  maxWidth: 660,
                }}
              >
                <Typography
                  variant="overline"
                  sx={{
                    color:
                      'secondary.light',
                  }}
                >
                  Reserve a Table
                </Typography>

                <Typography
                  component="h1"
                  variant="h1"
                  sx={{
                    mt: 1,

                    maxWidth:
                      620,

                    color:
                      'primary.contrastText',
                  }}
                >
                  Good food brings people together.
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    mt: 2.2,

                    maxWidth:
                      560,

                    color:
                      'primary.contrastText',

                    opacity:
                      0.8,
                  }}
                >
                  Choose your preferred
                  date, time and table
                  size. Harmony will
                  review availability
                  and confirm the
                  reservation with you.
                </Typography>

                <Link
                  href="#reservation-form"
                  style={{
                    display:
                      'inline-flex',

                    marginTop:
                      28,

                    textDecoration:
                      'none',
                  }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={
                      <CalendarMonthRoundedIcon />
                    }
                    endIcon={
                      <ArrowForwardRoundedIcon />
                    }
                    sx={{
                      minHeight:
                        52,

                      px: 3,
                    }}
                  >
                    Reserve Your Table
                  </Button>
                </Link>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* =====================================================
          RESERVATION
      ===================================================== */}

      <Box
        component="section"
        id="reservation-form"
        sx={{
          scrollMarginTop:
            110,

          py: {
            xs: 6,
            md: 9,
          },
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display:
                'grid',

              gridTemplateColumns:
                {
                  xs: '1fr',

                  lg:
                    'minmax(0,0.75fr) minmax(0,1.25fr)',
                },

              gap: {
                xs: 4,
                lg: 6,
              },

              alignItems:
                'start',
            }}
          >
            {/* =================================================
                LEFT
            ================================================= */}

            <Box
              sx={{
                position: {
                  lg: 'sticky',
                },

                top: {
                  lg: 110,
                },
              }}
            >
              <Typography
                variant="overline"
                sx={{
                  color:
                    'secondary.dark',
                }}
              >
                Simple Reservation
              </Typography>

              <Typography
                component="h2"
                variant="h2"
                sx={{
                  mt: 0.7,

                  maxWidth:
                    500,
                }}
              >
                Your table, your time.
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  mt: 1.5,

                  maxWidth:
                    500,

                  color:
                    'text.secondary',
                }}
              >
                Send us your dining
                preference and our
                team will confirm the
                final reservation
                with you.
              </Typography>

              <Stack
                sx={{
                  mt: 3.5,

                  gap: 1.5,
                }}
              >
                {reservationBenefits.map(
                  (benefit) => {
                    const Icon =
                      benefit.icon;

                    return (
                      <Box
                        key={
                          benefit.title
                        }
                        sx={{
                          display:
                            'grid',

                          gridTemplateColumns:
                            '52px minmax(0,1fr)',

                          gap: 1.4,

                          alignItems:
                            'center',
                        }}
                      >
                        <Box
                          sx={{
                            width:
                              52,

                            height:
                              52,

                            display:
                              'grid',

                            placeItems:
                              'center',

                            borderRadius:
                              '50%',

                            bgcolor:
                              alpha(
                                theme.palette
                                  .secondary
                                  .main,
                                0.1,
                              ),

                            color:
                              'secondary.dark',

                            border:
                              '1px solid',

                            borderColor:
                              alpha(
                                theme.palette
                                  .secondary
                                  .main,
                                0.22,
                              ),
                          }}
                        >
                          <Icon
                            aria-hidden
                          />
                        </Box>

                        <Box>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight:
                                800,
                            }}
                          >
                            {
                              benefit.title
                            }
                          </Typography>

                          <Typography
                            variant="body2"
                            sx={{
                              mt: 0.2,

                              color:
                                'text.secondary',
                            }}
                          >
                            {
                              benefit.description
                            }
                          </Typography>
                        </Box>
                      </Box>
                    );
                  },
                )}
              </Stack>
            </Box>

            {/* =================================================
                FORM
            ================================================= */}

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

                boxShadow:
                  theme
                    .shadows[4],
              }}
            >
              {/* HEADER */}

              <Box
                sx={{
                  p: {
                    xs: 2.4,
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
                        theme
                          .palette
                          .primary
                          .contrastText,
                        0.08,
                      ),

                    color:
                      'secondary.light',
                  }}
                >
                  <RestaurantRoundedIcon
                    aria-hidden
                  />
                </Box>

                <Typography
                  variant="overline"
                  sx={{
                    display:
                      'block',

                    mt: 1.5,

                    color:
                      'secondary.light',
                  }}
                >
                  Reservation Details
                </Typography>

                <Typography
                  component="h2"
                  variant="h3"
                  sx={{
                    mt: 0.4,

                    color:
                      'primary.contrastText',
                  }}
                >
                  Request your table.
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    mt: 0.8,

                    maxWidth:
                      550,

                    color:
                      'primary.contrastText',

                    opacity:
                      0.74,
                  }}
                >
                  Fill in your preferred
                  visit details and our
                  team will check
                  availability.
                </Typography>
              </Box>

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
                    label="Date"
                    type="date"
                    fullWidth
                    required
                    {...register(
                      'date',
                    )}
                    error={
                      Boolean(
                        errors.date,
                      )
                    }
                    helperText={
                      errors.date
                        ?.message
                    }
                    slotProps={{
                      inputLabel: {
                        shrink:
                          true,
                      },

                      htmlInput: {
                        min:
                          today,
                      },
                    }}
                  />

                  <TextField
                    select
                    label="Preferred Time"
                    defaultValue=""
                    fullWidth
                    required
                    {...register(
                      'time',
                    )}
                    error={
                      Boolean(
                        errors.time,
                      )
                    }
                    helperText={
                      errors.time
                        ?.message
                    }
                  >
                    <MenuItem value="">
                      Select time
                    </MenuItem>

                    {timeSlots.map(
                      (time) => (
                        <MenuItem
                          key={
                            time
                          }
                          value={
                            time
                          }
                        >
                          {time}
                        </MenuItem>
                      ),
                    )}
                  </TextField>
                </Box>

                {/* GUESTS */}

                <TextField
                  select
                  label="Number of Guests"
                  defaultValue="2"
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
                >
                  {Array.from(
                    {
                      length:
                        12,
                    },
                    (
                      _,
                      index,
                    ) =>
                      index +
                      1,
                  ).map(
                    (
                      guestCount,
                    ) => (
                      <MenuItem
                        key={
                          guestCount
                        }
                        value={String(
                          guestCount,
                        )}
                      >
                        {
                          guestCount
                        }{' '}
                        {guestCount ===
                        1
                          ? 'Guest'
                          : 'Guests'}
                      </MenuItem>
                    ),
                  )}
                </TextField>

                {/* NOTE */}

                <TextField
                  label="Special Request"
                  placeholder="Window-side table, special occasion, seating preference..."
                  multiline
                  minRows={4}
                  fullWidth
                  {...register(
                    'note',
                  )}
                  error={
                    Boolean(
                      errors.note,
                    )
                  }
                  helperText={
                    errors.note
                      ?.message ??
                    `${note.length}/500`
                  }
                  slotProps={{
                    htmlInput: {
                      maxLength:
                        500,
                    },
                  }}
                />

                {/* FRONTEND READY STATE */}

                {requestReady ? (
                  <Box
                    role="status"
                    sx={{
                      p: 1.5,

                      display:
                        'grid',

                      gridTemplateColumns:
                        '28px minmax(0,1fr)',

                      gap: 1,

                      bgcolor:
                        alpha(
                          theme
                            .palette
                            .primary
                            .main,
                          0.07,
                        ),

                      border:
                        '1px solid',

                      borderColor:
                        alpha(
                          theme
                            .palette
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
                        Reservation details are ready.
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
                        Online booking will become active when Harmony’s reservation service is connected.
                      </Typography>
                    </Box>
                  </Box>
                ) : null}

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={
                    isSubmitting
                  }
                  startIcon={
                    <CalendarMonthRoundedIcon />
                  }
                  endIcon={
                    <ArrowForwardRoundedIcon />
                  }
                  sx={{
                    minHeight:
                      54,

                    mt: 0.4,
                  }}
                >
                  {isSubmitting
                    ? 'Checking Details...'
                    : 'Request Reservation'}
                </Button>

                <Typography
                  variant="caption"
                  sx={{
                    textAlign:
                      'center',

                    color:
                      'text.secondary',
                  }}
                >
                  Sending a request does not automatically confirm the table. Harmony confirms availability separately.
                </Typography>
              </Stack>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* =====================================================
          CONTACT INFORMATION
      ===================================================== */}

      <Box
        component="section"
        sx={{
          borderTop:
            '1px solid',

          borderColor:
            'divider',

          bgcolor:
            'background.paper',
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              py: {
                xs: 3,
                md: 3.5,
              },

              display:
                'grid',

              gridTemplateColumns:
                {
                  xs: '1fr',

                  md:
                    'repeat(2,minmax(0,1fr))',
                },

              gap: {
                xs: 2,
                md: 0,
              },
            }}
          >
            {/* HOURS */}

            <Box
              sx={{
                display:
                  'grid',

                gridTemplateColumns:
                  '52px minmax(0,1fr)',

                gap: 1.5,

                alignItems:
                  'center',

                pr: {
                  md: 4,
                },

                borderRight: {
                  md:
                    '1px solid',
                },

                borderColor:
                  'divider',
              }}
            >
              <Box
                sx={{
                  width:
                    52,

                  height:
                    52,

                  display:
                    'grid',

                  placeItems:
                    'center',

                  borderRadius:
                    '50%',

                  bgcolor:
                    'action.hover',

                  color:
                    'secondary.dark',
                }}
              >
                <RestaurantRoundedIcon
                  aria-hidden
                />
              </Box>

              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight:
                      800,
                  }}
                >
                  Opening Hours
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    mt: 0.3,

                    color:
                      'text.secondary',
                  }}
                >
                  Mon – Sun
                  <br />
                  10:00 AM – 10:00 PM
                </Typography>
              </Box>
            </Box>

            {/* LOCATION */}

            <Box
              sx={{
                display:
                  'grid',

                gridTemplateColumns:
                  '52px minmax(0,1fr)',

                gap: 1.5,

                alignItems:
                  'center',

                pl: {
                  md: 4,
                },
              }}
            >
              <Box
                sx={{
                  width:
                    52,

                  height:
                    52,

                  display:
                    'grid',

                  placeItems:
                    'center',

                  borderRadius:
                    '50%',

                  bgcolor:
                    'action.hover',

                  color:
                    'secondary.dark',
                }}
              >
                <LocationOnRoundedIcon
                  aria-hidden
                />
              </Box>

              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight:
                      800,
                  }}
                >
                  Our Location
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    mt: 0.3,

                    color:
                      'text.secondary',
                  }}
                >
                  Harmony Dining & Event Center
                </Typography>

                <Link
                  href="/#location"
                  style={{
                    display:
                      'inline-flex',

                    marginTop:
                      4,

                    textDecoration:
                      'none',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color:
                        'primary.main',

                      fontWeight:
                        800,
                    }}
                  >
                    Get Directions →
                  </Typography>
                </Link>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}