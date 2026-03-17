import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class MessageDto {
  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsOptional()
  attachments?: unknown;
}
