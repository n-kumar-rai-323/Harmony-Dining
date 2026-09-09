import type { Metadata } from 'next';

import LegalDocument, {
  type LegalSection,
} from '@/components/legal/legal-document';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'The terms that apply when you use the Harmony Dining & Event Center website and submit reservation or event requests.',
  alternates: {
    canonical: '/terms',
  },
  robots: {
    index: true,
    follow: true,
  },
};

const sections: LegalSection[] = [
  {
    heading: 'Using this website',
    paragraphs: [
      'This website is provided for information and to let you send reservation and event requests to Harmony Dining & Event Center. By using it, you agree to use it lawfully and not to disrupt or misuse the service.',
    ],
  },
  {
    heading: 'Reservations and enquiries',
    paragraphs: [
      'Submitting a reservation request or event enquiry does not create a confirmed booking. A booking is only confirmed once our team contacts you and agrees the details with you.',
      'We aim to honour requested dates and times but cannot guarantee availability. We may need to adjust or decline a request based on capacity, timing or other operational reasons.',
    ],
  },
  {
    heading: 'Menu, pricing and information',
    paragraphs: [
      'Menu items, images, availability and prices shown on this site may change without notice and are provided for guidance. Final details are confirmed by our team.',
    ],
  },
  {
    heading: 'Intellectual property',
    paragraphs: [
      'The content on this site, including text, images and branding, belongs to Harmony Dining & Event Center or its licensors and may not be reused without permission.',
    ],
  },
  {
    heading: 'Liability',
    paragraphs: [
      'The site is provided "as is". To the extent permitted by law, Harmony Dining & Event Center is not liable for any loss arising from reliance on information on this site or from its temporary unavailability.',
    ],
  },
  {
    heading: 'Contact',
    paragraphs: [
      'Questions about these terms can be sent through our Contact page.',
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalDocument
      eyebrow="Legal"
      title="Terms of Service"
      lastUpdated="To be confirmed"
      intro="These terms apply when you use the Harmony Dining & Event Center website, including when you send a reservation or event request."
      sections={sections}
    />
  );
}
