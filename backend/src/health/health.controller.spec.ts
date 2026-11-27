import { HealthCheckError, HealthCheckService, MemoryHealthIndicator } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { PrismaService } from '../prisma/prisma.service';

describe('database readiness', () => {
  it('rejects a failed database probe instead of returning a successful check', async () => {
    const health = {
      check: async (checks: Array<() => Promise<unknown>>) => checks[0](),
    };
    const prisma = { ping: jest.fn().mockRejectedValue(new Error('offline')) };
    const controller = new HealthController(
      health as unknown as HealthCheckService,
      {} as MemoryHealthIndicator,
      prisma as unknown as PrismaService,
    );
    await expect(controller.ready()).rejects.toBeInstanceOf(HealthCheckError);
  });
});
