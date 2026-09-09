import { IsString, MaxLength, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  currentPassword!: string;

  @IsString()
  @MinLength(10, { message: 'New password must be at least 10 characters' })
  @MaxLength(200)
  newPassword!: string;
}
