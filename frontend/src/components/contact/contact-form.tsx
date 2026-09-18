'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import {
  Alert,
  Box,
  Button,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';

import { submitContactMessage } from '@/lib/api/contact';
import { contactSchema, CONTACT_LIMITS, type ContactFormValues } from '@/validation/contact.schema';

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: yupResolver(contactSchema),
    defaultValues: { fullName: '', email: '', phone: '', subject: '', message: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    const res = await submitContactMessage(values);
    if (res.ok) {
      setSubmitted(true);
      reset();
    } else {
      setFormError(res.error);
    }
  });

  return (
    <Box
      sx={{
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        boxShadow: (t) => t.shadows[3],
        p: { xs: 3, sm: 4.5 },
      }}
    >
      <Stack direction="row" spacing={1.75} sx={{ alignItems: 'center', mb: 0.5 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            flexShrink: 0,
            display: 'grid',
            placeItems: 'center',
            borderRadius: '50%',
            bgcolor: (t) => alpha(t.palette.secondary.main, 0.16),
            color: 'secondary.dark',
          }}
        >
          <ForumRoundedIcon fontSize="small" />
        </Box>
        <Typography component="h2" variant="h4">
          Send us a message
        </Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3.5, ml: { sm: 6.75 } }}>
        For general questions, feedback or partnership enquiries. Looking to book?
        Use Reserve a Table or Plan an Event instead — they reach the team faster.
      </Typography>

      {submitted ? (
        <Alert severity="success" onClose={() => setSubmitted(false)}>
          Thank you! Your message has been sent — we&apos;ll get back to you soon.
        </Alert>
      ) : (
        <form onSubmit={onSubmit} noValidate>
          <Stack spacing={3}>
            {formError && <Alert severity="error">{formError}</Alert>}

            <Box
              sx={{
                display: 'grid',
                gap: 2.5,
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              }}
            >
              <TextField
                label="Full name"
                fullWidth
                required
                error={Boolean(errors.fullName)}
                helperText={errors.fullName?.message}
                {...register('fullName')}
              />
              <TextField
                label="Email"
                type="email"
                fullWidth
                required
                error={Boolean(errors.email)}
                helperText={errors.email?.message}
                {...register('email')}
              />
            </Box>

            <Box
              sx={{
                display: 'grid',
                gap: 2.5,
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              }}
            >
              <TextField
                label="Phone (optional)"
                fullWidth
                error={Boolean(errors.phone)}
                helperText={errors.phone?.message}
                {...register('phone')}
              />
              <TextField
                label="Subject (optional)"
                fullWidth
                error={Boolean(errors.subject)}
                helperText={errors.subject?.message}
                {...register('subject')}
              />
            </Box>

            <TextField
              label="Message"
              fullWidth
              required
              multiline
              minRows={4}
              slotProps={{ htmlInput: { maxLength: CONTACT_LIMITS.message } }}
              error={Boolean(errors.message)}
              helperText={errors.message?.message}
              {...register('message')}
            />

            <Box>
              <Button
                type="submit"
                variant="contained"
                size="large"
                endIcon={<SendRoundedIcon />}
                disabled={isSubmitting}
                sx={{ px: 4 }}
              >
                {isSubmitting ? 'Sending…' : 'Send message'}
              </Button>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
                By submitting, you agree to be contacted about your enquiry. We
                never share your details.
              </Typography>
            </Box>
          </Stack>
        </form>
      )}
    </Box>
  );
}
