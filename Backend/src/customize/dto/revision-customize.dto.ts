import { IsString, IsNotEmpty } from 'class-validator';

export class RevisionCustomizeDto {
  @IsString()
  @IsNotEmpty()
  content!: string;
}
