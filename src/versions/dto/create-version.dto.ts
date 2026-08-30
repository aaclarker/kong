import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateVersionDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  version: string;

  @IsString()
  @MinLength(1)
  changelog: string;

  @IsOptional()
  @IsString()
  description?: string;
}
