import { ConfigService } from '@nestjs/config';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { OriginGuard } from './origin.guard';
import type { AppConfig } from '../../config/configuration';

describe('OriginGuard', () => {
  const guard = new OriginGuard(new ConfigService<AppConfig, true>({
    env: 'production', corsOrigins: ['https://harmony.example'],
  }));
  const request = (method: string, headers: Record<string, string>) => ({
    switchToHttp: () => ({ getRequest: () => ({ method, headers }) }),
  }) as ExecutionContext;
  it('allows trusted browser writes', () => {
    expect(guard.canActivate(request('POST', { origin: 'https://harmony.example', cookie: 'session=token' }))).toBe(true);
  });
  it('rejects hostile origins even on public endpoints', () => {
    expect(() => guard.canActivate(request('POST', { origin: 'https://attacker.example' }))).toThrow(ForbiddenException);
  });
  it('rejects cookie writes without an origin in production', () => {
    expect(() => guard.canActivate(request('POST', { cookie: 'session=token' }))).toThrow(ForbiddenException);
  });
  it('allows read-only requests and anonymous non-browser clients', () => {
    expect(guard.canActivate(request('GET', {}))).toBe(true);
    expect(guard.canActivate(request('POST', {}))).toBe(true);
  });
});
