import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsEnum } from 'class-validator';
import { UserStatus } from '@prisma/client';
import { CreateStaffDto } from './create-staff.dto.js';

export class UpdateStaffDto extends PartialType(CreateStaffDto) {
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}
