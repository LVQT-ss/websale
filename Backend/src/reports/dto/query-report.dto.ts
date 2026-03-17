import { IsOptional, IsDateString } from 'class-validator';

export class QueryReportDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
