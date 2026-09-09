'use client';

import { useEffect } from 'react';

type GlobalErrorProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

/**
 * Renders only when the root layout itself fails, so it cannot
 * rely on the theme provider or MUI. Keep it dependency-free.
 */
export default function GlobalError({
  error,
  retry,
}: GlobalErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily:
            'Inter, Arial, Helvetica, sans-serif',
          background: '#FAF8F3',
          color: '#17211D',
        }}
      >
        <title>Something went wrong</title>

        <main style={{ maxWidth: 460, textAlign: 'center' }}>
          <p
            style={{
              margin: 0,
              fontSize: '0.76rem',
              fontWeight: 800,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#967536',
            }}
          >
            Something went wrong
          </p>

          <h1
            style={{
              margin: '12px 0 0',
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: '2.4rem',
              lineHeight: 1.1,
              fontWeight: 600,
            }}
          >
            The site ran into a problem.
          </h1>

          <p
            style={{
              margin: '16px 0 0',
              fontSize: '1rem',
              lineHeight: 1.7,
              color: '#5D6862',
            }}
          >
            Please reload the page. If it keeps happening, try
            again in a few minutes.
          </p>

          <button
            type="button"
            onClick={() => retry()}
            style={{
              marginTop: 28,
              minHeight: 48,
              padding: '0 28px',
              border: 'none',
              borderRadius: 6,
              background: '#0B3D2E',
              color: '#FFFFFF',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Reload
          </button>
        </main>
      </body>
    </html>
  );
}
