import { Controller, Get, Param, Query } from '@nestjs/common';

import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { AuditService } from './audit.service';
import { AuditQueryDto } from './dto';

@Controller('admin/audit')
export class AuditAdminController {
  constructor(private readonly audit: AuditService) {}

  @RequirePermissions('audit.read')
  @Get()
  list(@Query() query: AuditQueryDto) {
    return this.audit.list(query);
  }

  @RequirePermissions('audit.read')
  @Get('facets')
  facets() {
    return this.audit.facets();
  }

  @RequirePermissions('audit.read')
  @Get(':id')
  get(@Param('id') id: string) {
    return this.audit.get(id);
  }
}
