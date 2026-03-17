import { IsString, IsNotEmpty } from 'class-validator';

export class CreateMomoPaymentDto {
  @IsString()
  @IsNotEmpty()
  orderId!: string;
}
