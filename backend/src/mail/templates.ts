/**
 * Minimal server-rendered email templates. Kept as plain functions (no engine)
 * — enough for transactional acknowledgements. `context` values are
 * HTML-escaped before interpolation.
 */

export type MailTemplate =
  | 'reservation_received'
  | 'enquiry_received'
  | 'review_received'
  | 'generic';

type Ctx = Record<string, string | number | null | undefined>;

function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function shell(title: string, body: string): string {
  return [
    `<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#1a1a1a;line-height:1.55">`,
    `<h2 style="margin:0 0 12px">${esc(title)}</h2>`,
    body,
    `<hr style="border:none;border-top:1px solid #e5e5e5;margin:20px 0"/>`,
    `<p style="font-size:12px;color:#777;margin:0">Harmony Dining &amp; Event Center</p>`,
    `</div>`,
  ].join('');
}

const RENDERERS: Record<MailTemplate, (c: Ctx) => { subject: string; html: string }> = {
  reservation_received: (c) => ({
    subject: `We received your reservation request (${c.reference ?? ''})`.trim(),
    html: shell('Reservation request received', [
      `<p>Hi ${esc(c.name)},</p>`,
      `<p>Thanks for your request. Our team will confirm it shortly.</p>`,
      `<p><strong>Reference:</strong> ${esc(c.reference)}<br/>`,
      `<strong>Date:</strong> ${esc(c.date)} at ${esc(c.time)}<br/>`,
      `<strong>Guests:</strong> ${esc(c.guests)}</p>`,
    ].join('')),
  }),
  enquiry_received: (c) => ({
    subject: 'We received your event enquiry',
    html: shell('Event enquiry received', [
      `<p>Hi ${esc(c.name)},</p>`,
      `<p>Thanks for telling us about your ${esc(c.eventType)} on ${esc(c.date)}. `,
      `Our events team will be in touch soon.</p>`,
    ].join('')),
  }),
  review_received: (c) => ({
    subject: 'Thanks for your review',
    html: shell('Thanks for sharing your experience', [
      `<p>Hi ${esc(c.name)},</p>`,
      `<p>Your review has been received and will appear once approved.</p>`,
    ].join('')),
  }),
  generic: (c) => ({
    subject: String(c.subject ?? 'A message from Harmony'),
    html: shell(String(c.subject ?? 'Harmony'), `<p>${esc(c.body)}</p>`),
  }),
};

export function renderTemplate(
  template: MailTemplate,
  context: Ctx = {},
): { subject: string; html: string } {
  const renderer = RENDERERS[template] ?? RENDERERS.generic;
  return renderer(context);
}
