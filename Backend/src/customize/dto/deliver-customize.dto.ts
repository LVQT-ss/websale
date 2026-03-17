import { IsUrl, IsOptional, IsString } from 'class-validator';

export class DeliverCustomizeDto {
  @IsUrl()
  deliveryUrl!: string;

  @IsOptional()
  @IsString()
  deliveryNote?: string;
}
