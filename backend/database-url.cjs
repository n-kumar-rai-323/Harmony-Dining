// Build connection URLs without treating punctuation in credentials as URL syntax.
function databaseUrl(env) {
  for (const key of ['PGHOST', 'PGUSER', 'PGPASSWORD', 'PGDATABASE']) {
    if (!env[key]) throw new Error(`Missing ${key}`);
  }
  const host = env.PGHOST;
  if (env.NODE_ENV === 'production' &&
      (env.PGPASSWORD.length < 32 || /replace-with/i.test(env.PGPASSWORD))) {
    throw new Error('Production database passwords must be unique and at least 32 characters');
  }
  if (!/^[a-zA-Z0-9.-]+$/.test(host)) throw new Error('Invalid PGHOST');
  const port = Number(env.PGPORT || 5432);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid PGPORT');
  return `postgresql://${encodeURIComponent(env.PGUSER)}:${encodeURIComponent(env.PGPASSWORD)}@${host}:${port}/${encodeURIComponent(env.PGDATABASE)}?schema=public`;
}
module.exports = { databaseUrl };
if (require.main === module) process.stdout.write(databaseUrl(process.env));
