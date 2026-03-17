import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateBankTransferDto {
  @IsString()
  @IsNotEmpty()
  orderId!: string;

  @IsOptional()
  @IsString()
  bankTransRef?: string;

  @IsOptional()
  @IsString()
  receiptImage?: string;
}
