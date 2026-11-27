const { databaseUrl } = require('../../database-url.cjs') as {
  databaseUrl: (env: Record<string, string>) => string;
};

describe('database connection URL', () => {
  const env = { PGHOST: 'postgres', PGUSER: 'harmony_app', PGPASSWORD: 'p@ss:/?#%$word', PGDATABASE: 'harmony' };
  it('encodes special password characters without changing the destination', () => {
    const parsed = new URL(databaseUrl(env));
    expect(decodeURIComponent(parsed.password)).toBe(env.PGPASSWORD);
    expect(parsed.hostname).toBe('postgres');
    expect(parsed.pathname).toBe('/harmony');
  });
  it('rejects missing credentials and invalid ports or hosts', () => {
    expect(() => databaseUrl({ ...env, PGPASSWORD: '' })).toThrow();
    expect(() => databaseUrl({ ...env, PGPORT: 'abc' })).toThrow();
    expect(() => databaseUrl({ ...env, PGHOST: 'postgres/other' })).toThrow();
  });
  it('rejects short and placeholder production database passwords', () => {
    expect(() => databaseUrl({ ...env, NODE_ENV: 'production' })).toThrow();
    expect(() => databaseUrl({ ...env, NODE_ENV: 'production',
      PGPASSWORD: 'replace-with-another-long-random-password' })).toThrow();
  });
});
