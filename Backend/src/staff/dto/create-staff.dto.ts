import {
  IsEmail,
  IsString,
  MinLength,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class CreateStaffDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
