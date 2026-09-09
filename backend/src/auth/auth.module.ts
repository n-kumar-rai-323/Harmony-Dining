import { Global, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PasswordService } from './password.service';
import { PermissionsService } from './permissions.service';
import { SessionService } from './session.service';
import { SessionAuthGuard } from './guards/session-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';

@Global()
@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    PasswordService,
    SessionService,
    PermissionsService,
    SessionAuthGuard,
    PermissionsGuard,
  ],
  exports: [
    PasswordService,
    SessionService,
    PermissionsService,
    SessionAuthGuard,
    PermissionsGuard,
  ],
})
export class AuthModule {}
