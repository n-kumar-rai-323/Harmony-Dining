import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ReservationStatus } from '@prisma/client';
import type { Request } from 'express';

import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types';
import { auditContext } from '../common/request-context';
import { ReservationsService } from './reservations.service';
import {
  DisabledDateDto,
  ReservationQueryDto,
  ReservationStatusDto,
  UpdateReservationSettingsDto,
} from './dto';

// Maps the workflow verb the admin UI calls to the target status.
const ACTIONS: Record<string, ReservationStatus> = {
  confirm: 'CONFIRMED',
  reject: 'REJECTED',
  cancel: 'CANCELLED',
  complete: 'COMPLETED',
};

@Controller('admin/reservations')
export class ReservationsAdminController {
  constructor(private readonly reservations: ReservationsService) {}

  // ----- settings -----

  @RequirePermissions('reservations.read')
  @Get('settings')
  getSettings() {
    return this.reservations.getSettings();
  }

  @RequirePermissions('reservations.update')
  @Patch('settings')
  updateSettings(
    @Body() dto: UpdateReservationSettingsDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.reservations.updateSettings(dto, auditContext(req, actor));
  }

  // ----- disabled dates -----

  @RequirePermissions('reservations.read')
  @Get('disabled-dates')
  listDisabledDates() {
    return this.reservations.listDisabledDates();
  }

  @RequirePermissions('reservations.update')
  @Post('disabled-dates')
  addDisabledDate(
    @Body() dto: DisabledDateDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.reservations.addDisabledDate(dto, auditContext(req, actor));
  }

  @RequirePermissions('reservations.update')
  @Delete('disabled-dates/:date')
  @HttpCode(200)
  async removeDisabledDate(
    @Param('date') date: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    await this.reservations.removeDisabledDate(date, auditContext(req, actor));
    return { ok: true };
  }

  // ----- reservations -----

  @RequirePermissions('reservations.read')
  @Get()
  list(@Query() query: ReservationQueryDto) {
    return this.reservations.list(query);
  }

  @RequirePermissions('reservations.read')
  @Get(':id')
  get(@Param('id') id: string) {
    return this.reservations.get(id);
  }

  @RequirePermissions('reservations.update')
  @Post(':id/:action')
  @HttpCode(200)
  transition(
    @Param('id') id: string,
    @Param('action') action: string,
    @Body() dto: ReservationStatusDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const target = ACTIONS[action];
    if (!target) {
      throw new BadRequestException(
        `Unknown action. Use one of: ${Object.keys(ACTIONS).join(', ')}`,
      );
    }
    return this.reservations.transition(
      id,
      target,
      dto.note,
      auditContext(req, actor),
    );
  }
}
