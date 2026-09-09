import type { Metadata } from 'next';

import LegalDocument, {
  type LegalSection,
} from '@/components/legal/legal-document';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How Harmony Dining & Event Center collects, uses and protects the personal information you share with us.',
  alternates: {
    canonical: '/privacy',
  },
  robots: {
    index: true,
    follow: true,
  },
};

const sections: LegalSection[] = [
  {
    heading: 'Information we collect',
    paragraphs: [
      'When you submit a reservation request or an event enquiry, we collect the details you provide in the form — typically your name, phone number, email address, preferred dates and times, party size and any notes you add.',
      'We may also collect basic technical information automatically, such as your device type, browser and pages visited, to keep the site secure and working well.',
    ],
  },
  {
    heading: 'How we use your information',
    paragraphs: [
      'We use your details to respond to your reservation or event request, confirm availability, arrange your visit and contact you about your booking.',
      'We do not sell your personal information. We only share it with service providers who help us operate the site and our bookings, and only to the extent needed to provide those services.',
    ],
  },
  {
    heading: 'Data retention',
    paragraphs: [
      'We keep booking and enquiry information for as long as needed to manage your request and for a reasonable period afterwards for our records, unless a longer period is required by law.',
    ],
  },
  {
    heading: 'Your choices',
    paragraphs: [
      'You may ask us to access, correct or delete the personal information we hold about you, or to stop contacting you, by getting in touch through our Contact page.',
    ],
  },
  {
    heading: 'Contact',
    paragraphs: [
      'If you have any questions about this policy or how your information is handled, please reach out via the Contact page.',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalDocument
      eyebrow="Legal"
      title="Privacy Policy"
      lastUpdated="To be confirmed"
      intro="This policy explains what personal information Harmony Dining & Event Center collects through this website, how we use it and the choices you have."
      sections={sections}
    />
  );
}
