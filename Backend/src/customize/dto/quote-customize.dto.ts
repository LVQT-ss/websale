import { IsNumber, IsInt, Min } from 'class-validator';

export class QuoteCustomizeDto {
  @IsNumber()
  @Min(0)
  quotedPrice!: number;

  @IsInt()
  @Min(1)
  quotedDays!: number;
}
