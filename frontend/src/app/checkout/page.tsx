'use client';

import Image from 'next/image';
import Link from 'next/link';

import {
  alpha,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';

import {
  yupResolver,
} from '@hookform/resolvers/yup';

import {
  useForm,
} from 'react-hook-form';

import {
  useCart,
} from '@/components/cart/cart-provider';

import type {
  MenuGroup,
} from '@/data/menu-data';

import {
  checkoutSchema,
  type CheckoutFormValues,
} from '@/validation/checkout.schema';

/* =========================================================
   GROUP IMAGES
========================================================= */

const groupImage: Record<
  MenuGroup,
  string
> = {
  FOOD:
    '/images/menu/harmony-food-menu-bg.jpg',

  BEVERAGES:
    '/images/menu/harmony-beverages-menu-bg.jpg',

  BAR:
    '/images/menu/harmony-bar-menu-bg.jpg',
};

/* =========================================================
   HELPERS
========================================================= */

function formatPrice(
  price: number,
) {
  return `NPR ${price.toLocaleString(
    'en-IN',
  )}`;
}

/* =========================================================
   PAGE
========================================================= */

export default function CheckoutPage() {
  const theme = useTheme();

  const {
    cart,
    cartCount,
    subtotal,
    isCartReady,
    updateQuantity,
    removeItem,
  } = useCart();

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } =
    useForm<CheckoutFormValues>(
      {
        resolver:
          yupResolver(
            checkoutSchema,
          ),

        mode:
          'onTouched',

        defaultValues: {
          fullName: '',
          phone: '',
          orderNote: '',
        },
      },
    );

  /* =========================================================
     SUBMIT
  ========================================================= */

  async function onSubmit(
    data:
      CheckoutFormValues,
  ) {
    if (
      cart.length === 0
    ) {
      return;
    }

    const orderPayload = {
      customerName:
        data.fullName.trim(),

      customerPhone:
        data.phone.trim(),

      customerNote:
        data.orderNote
          ?.trim() ||
        null,

      items:
        cart.map(
          (item) => ({
            menuItemId:
              item.menuItemId ??
              null,

            name:
              item.name,

            categoryName:
              item.categoryName,

            group:
              item.group,

            price:
              item.price,

            quantity:
              item.quantity,
          }),
        ),
    };

    console.log(
      'Validated order payload:',
      orderPayload,
    );

    /*
      FUTURE PRODUCTION API:

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/orders`,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body:
            JSON.stringify(
              orderPayload,
            ),
        },
      );

      if (!response.ok) {
        throw new Error(
          'Unable to place order',
        );
      }

      Backend responsibilities:
      - validate again
      - check current menu prices
      - check item availability
      - calculate totals server-side
      - create order number
      - status = PENDING
      - persist order
      - notify Admin/Kitchen
      - return safe response
    */
  }

  /* =========================================================
     LOADING
  ========================================================= */

  if (!isCartReady) {
    return (
      <Box
        component="main"
        sx={{
          minHeight:
            '100vh',

          display:
            'grid',

          placeItems:
            'center',

          bgcolor:
            'background.default',
        }}
      >
        <Stack
          sx={{
            alignItems:
              'center',

            gap: 1.5,
          }}
        >
          <CircularProgress
            size={34}
          />

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Loading your order...
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      component="main"
      sx={{
        minHeight:
          '100vh',

        bgcolor:
          'background.default',

        color:
          'text.primary',
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          py: {
            xs: 4,
            md: 6,
          },
        }}
      >
        {/* =====================================================
            BACK
        ===================================================== */}

        <Link
          href="/menu"
          style={{
            display:
              'inline-flex',

            textDecoration:
              'none',
          }}
        >
          <Button
            startIcon={
              <ArrowBackRoundedIcon />
            }
            sx={{
              mb: 3,
            }}
          >
            Back to Menu
          </Button>
        </Link>

        {/* =====================================================
            EMPTY CART
        ===================================================== */}

        {cart.length ===
        0 ? (
          <Box
            sx={{
              maxWidth:
                720,

              mx:
                'auto',

              py: {
                xs: 7,
                md: 10,
              },

              px: 3,

              textAlign:
                'center',

              bgcolor:
                'background.paper',

              border:
                '1px solid',

              borderColor:
                'divider',

              borderRadius:
                2,

              boxShadow:
                theme
                  .shadows[1],
            }}
          >
            <Box
              sx={{
                width: 72,
                height: 72,

                mx:
                  'auto',

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
                      .secondary
                      .main,
                    0.1,
                  ),

                color:
                  'secondary.dark',
              }}
            >
              <ShoppingBagOutlinedIcon
                sx={{
                  fontSize:
                    34,
                }}
              />
            </Box>

            <Typography
              component="h1"
              variant="h3"
              sx={{
                mt: 2,
              }}
            >
              Your cart is empty
            </Typography>

            <Typography
              variant="body1"
              sx={{
                mt: 1,

                color:
                  'text.secondary',
              }}
            >
              Add your favourite
              Harmony dishes before
              heading to checkout.
            </Typography>

            <Link
              href="/menu"
              style={{
                display:
                  'inline-flex',

                marginTop:
                  24,

                textDecoration:
                  'none',
              }}
            >
              <Button
                variant="contained"
                size="large"
              >
                Browse Menu
              </Button>
            </Link>
          </Box>
        ) : (
          /* ===================================================
             CHECKOUT
          =================================================== */

          <Box
            component="form"
            onSubmit={
              handleSubmit(
                onSubmit,
              )
            }
            noValidate
            sx={{
              display:
                'grid',

              gridTemplateColumns:
                {
                  xs: '1fr',

                  lg:
                    'minmax(0,1fr) 390px',
                },

              gap: {
                xs: 3,
                lg: 3.5,
              },

              alignItems:
                'start',
            }}
          >
            {/* =================================================
                CUSTOMER DETAILS
            ================================================= */}

            <Box
              sx={{
                bgcolor:
                  'background.paper',

                border:
                  '1px solid',

                borderColor:
                  'divider',

                borderRadius:
                  2,

                p: {
                  xs: 2.3,
                  sm: 3.2,
                },

                boxShadow:
                  theme
                    .shadows[1],
              }}
            >
              <Typography
                variant="overline"
                sx={{
                  color:
                    'secondary.dark',
                }}
              >
                Checkout
              </Typography>

              <Typography
                component="h1"
                variant="h3"
                sx={{
                  mt: 0.5,
                }}
              >
                Your Details
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  mt: 1,

                  maxWidth:
                    650,

                  color:
                    'text.secondary',
                }}
              >
                Enter your contact
                details. Harmony staff
                will contact you to
                confirm your order.
              </Typography>

              <Stack
                sx={{
                  mt: 3,

                  gap: 2,
                }}
              >
                <TextField
                  fullWidth
                  required
                  label="Full Name"
                  placeholder="Enter your name"
                  autoComplete="name"
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
                      ?.message ??
                    ' '
                  }
                />

                <TextField
                  fullWidth
                  required
                  label="Phone Number"
                  placeholder="98XXXXXXXX"
                  type="tel"
                  autoComplete="tel"
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
                      ?.message ??
                    'Harmony staff will use this number to confirm your order.'
                  }
                  slotProps={{
                    htmlInput: {
                      inputMode:
                        'tel',
                    },
                  }}
                />

                <TextField
                  fullWidth
                  multiline
                  minRows={4}
                  label="Order Note"
                  placeholder="Optional note..."
                  {...register(
                    'orderNote',
                  )}
                  error={
                    Boolean(
                      errors.orderNote,
                    )
                  }
                  helperText={
                    errors.orderNote
                      ?.message ??
                    'Optional — maximum 500 characters.'
                  }
                />
              </Stack>

              <Divider
                sx={{
                  my: 3,
                }}
              />

              <Stack
                direction={{
                  xs:
                    'column',

                  sm:
                    'row',
                }}
                sx={{
                  gap: 1.5,
                }}
              >
                <Link
                  href="/menu"
                  style={{
                    display:
                      'flex',

                    flex: 1,

                    textDecoration:
                      'none',
                  }}
                >
                  <Button
                    fullWidth
                    variant="outlined"
                    size="large"
                    startIcon={
                      <ArrowBackRoundedIcon />
                    }
                    sx={{
                      minHeight:
                        54,
                    }}
                  >
                    Continue Shopping
                  </Button>
                </Link>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={
                    isSubmitting ||
                    cart.length ===
                      0
                  }
                  endIcon={
                    <ArrowForwardRoundedIcon />
                  }
                  sx={{
                    minHeight:
                      54,
                  }}
                >
                  {isSubmitting
                    ? 'Placing Order...'
                    : 'Place Order'}
                </Button>
              </Stack>

              <Typography
                variant="caption"
                sx={{
                  display:
                    'block',

                  mt: 1.2,

                  textAlign:
                    'center',

                  color:
                    'text.secondary',
                }}
              >
                No online payment
                is required at this
                stage. Harmony
                confirms the final
                order with you.
              </Typography>
            </Box>

            {/* =================================================
                ORDER SUMMARY
            ================================================= */}

            <Box
              component="aside"
              sx={{
                position: {
                  lg:
                    'sticky',
                },

                top: {
                  lg: 92,
                },

                overflow:
                  'hidden',

                bgcolor:
                  'background.paper',

                border:
                  '1px solid',

                borderColor:
                  'divider',

                borderRadius:
                  2,

                boxShadow:
                  theme
                    .shadows[4],
              }}
            >
              {/* HEADER */}

              <Box
                sx={{
                  px: 2.2,

                  py: 1.8,

                  display:
                    'flex',

                  justifyContent:
                    'space-between',

                  alignItems:
                    'center',

                  borderBottom:
                    '1px solid',

                  borderColor:
                    'divider',
                }}
              >
                <Stack
                  direction="row"
                  sx={{
                    alignItems:
                      'center',

                    gap: 1,
                  }}
                >
                  <ShoppingBagOutlinedIcon
                    sx={{
                      color:
                        'secondary.dark',
                    }}
                  />

                  <Typography
                    variant="h5"
                  >
                    Your Order
                  </Typography>

                  <Box
                    sx={{
                      minWidth:
                        26,

                      height: 26,

                      px: 0.75,

                      display:
                        'grid',

                      placeItems:
                        'center',

                      borderRadius:
                        999,

                      bgcolor:
                        'secondary.main',

                      color:
                        'secondary.contrastText',
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight:
                          800,

                        lineHeight:
                          1,
                      }}
                    >
                      {cartCount}
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              {/* ITEMS */}

              <Box
                sx={{
                  maxHeight: {
                    xs: 360,
                    lg: 430,
                  },

                  overflowY:
                    'auto',

                  p: 2,

                  scrollbarWidth:
                    'thin',

                  scrollbarColor: `${alpha(
                    theme.palette
                      .text
                      .secondary,
                    0.35,
                  )} transparent`,

                  '&::-webkit-scrollbar':
                    {
                      width:
                        7,
                    },

                  '&::-webkit-scrollbar-thumb':
                    {
                      bgcolor:
                        alpha(
                          theme
                            .palette
                            .text
                            .secondary,
                          0.3,
                        ),

                      borderRadius:
                        999,
                    },
                }}
              >
                <Stack
                  sx={{
                    gap: 1.4,
                  }}
                >
                  {cart.map(
                    (item) => (
                      <Box
                        key={
                          item.id
                        }
                        sx={{
                          display:
                            'grid',

                          gridTemplateColumns:
                            '58px minmax(0,1fr)',

                          gap:
                            1.2,

                          pb:
                            1.4,

                          borderBottom:
                            '1px solid',

                          borderColor:
                            'divider',
                        }}
                      >
                        {/* IMAGE */}

                        <Box
                          sx={{
                            position:
                              'relative',

                            width:
                              58,

                            height:
                              58,

                            overflow:
                              'hidden',

                            borderRadius:
                              1.2,

                            bgcolor:
                              'action.hover',
                          }}
                        >
                          <Image
                            src={
                              groupImage[
                                item
                                  .group
                              ]
                            }
                            alt={
                              item.name
                            }
                            fill
                            sizes="58px"
                            quality={
                              75
                            }
                            style={{
                              objectFit:
                                'cover',
                            }}
                          />
                        </Box>

                        {/* DETAILS */}

                        <Box
                          sx={{
                            minWidth:
                              0,
                          }}
                        >
                          <Box
                            sx={{
                              display:
                                'flex',

                              justifyContent:
                                'space-between',

                              alignItems:
                                'flex-start',

                              gap:
                                1,
                            }}
                          >
                            <Box
                              sx={{
                                minWidth:
                                  0,
                              }}
                            >
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  fontWeight:
                                    800,

                                  lineHeight:
                                    1.3,
                                }}
                              >
                                {
                                  item.name
                                }
                              </Typography>

                              <Typography
                                variant="caption"
                                sx={{
                                  display:
                                    'block',

                                  mt:
                                    0.2,

                                  color:
                                    'text.secondary',
                                }}
                              >
                                {
                                  item.categoryName
                                }
                              </Typography>
                            </Box>

                            <IconButton
                              type="button"
                              size="small"
                              aria-label={`Remove ${item.name}`}
                              onClick={() =>
                                removeItem(
                                  item.id,
                                )
                              }
                              sx={{
                                width:
                                  30,

                                height:
                                  30,

                                flexShrink:
                                  0,
                              }}
                            >
                              <CloseRoundedIcon
                                sx={{
                                  fontSize:
                                    17,
                                }}
                              />
                            </IconButton>
                          </Box>

                          <Box
                            sx={{
                              mt:
                                0.8,

                              display:
                                'flex',

                              justifyContent:
                                'space-between',

                              alignItems:
                                'center',

                              gap:
                                1,
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight:
                                  800,
                              }}
                            >
                              {formatPrice(
                                item.price *
                                  item.quantity,
                              )}
                            </Typography>

                            <Stack
                              direction="row"
                              sx={{
                                alignItems:
                                  'center',

                                border:
                                  '1px solid',

                                borderColor:
                                  'divider',

                                borderRadius:
                                  1,

                                overflow:
                                  'hidden',
                              }}
                            >
                              <IconButton
                                type="button"
                                size="small"
                                aria-label={`Decrease ${item.name}`}
                                onClick={() =>
                                  updateQuantity(
                                    item.id,
                                    -1,
                                  )
                                }
                                sx={{
                                  width:
                                    30,

                                  height:
                                    30,

                                  borderRadius:
                                    0,
                                }}
                              >
                                <RemoveRoundedIcon
                                  sx={{
                                    fontSize:
                                      16,
                                  }}
                                />
                              </IconButton>

                              <Typography
                                variant="caption"
                                sx={{
                                  minWidth:
                                    30,

                                  textAlign:
                                    'center',

                                  fontWeight:
                                    800,
                                }}
                              >
                                {
                                  item.quantity
                                }
                              </Typography>

                              <IconButton
                                type="button"
                                size="small"
                                aria-label={`Increase ${item.name}`}
                                onClick={() =>
                                  updateQuantity(
                                    item.id,
                                    1,
                                  )
                                }
                                sx={{
                                  width:
                                    30,

                                  height:
                                    30,

                                  borderRadius:
                                    0,
                                }}
                              >
                                <AddRoundedIcon
                                  sx={{
                                    fontSize:
                                      16,
                                  }}
                                />
                              </IconButton>
                            </Stack>
                          </Box>
                        </Box>
                      </Box>
                    ),
                  )}
                </Stack>
              </Box>

              {/* SUMMARY */}

              <Box
                sx={{
                  px: 2.2,

                  py: 2,

                  borderTop:
                    '1px solid',

                  borderColor:
                    'divider',

                  bgcolor:
                    'background.paper',
                }}
              >
                <Stack
                  sx={{
                    gap: 1,
                  }}
                >
                  <Box
                    sx={{
                      display:
                        'flex',

                      justifyContent:
                        'space-between',

                      gap:
                        2,
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Items
                    </Typography>

                    <Typography
                      variant="body2"
                    >
                      {cartCount}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display:
                        'flex',

                      justifyContent:
                        'space-between',

                      gap:
                        2,
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Subtotal
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight:
                          700,
                      }}
                    >
                      {formatPrice(
                        subtotal,
                      )}
                    </Typography>
                  </Box>
                </Stack>

                <Divider
                  sx={{
                    my: 1.7,
                  }}
                />

                <Box
                  sx={{
                    display:
                      'flex',

                    justifyContent:
                      'space-between',

                    alignItems:
                      'baseline',

                    gap: 2,
                  }}
                >
                  <Typography
                    variant="h5"
                  >
                    Total
                  </Typography>

                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight:
                        700,

                      color:
                        'primary.main',
                    }}
                  >
                    {formatPrice(
                      subtotal,
                    )}
                  </Typography>
                </Box>

                <Typography
                  variant="caption"
                  sx={{
                    display:
                      'block',

                    mt: 1.2,

                    color:
                      'text.secondary',
                  }}
                >
                  Final charges, if
                  any, will be
                  confirmed by
                  Harmony staff.
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
}