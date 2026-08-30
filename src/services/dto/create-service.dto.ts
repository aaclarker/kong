import { Type } from 'class-transformer';
import {
  IsDefined,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { CreateVersionDto } from '../../versions/dto/create-version.dto';

export class CreateServiceDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @MinLength(1)
  description: string;

  // Required: a service must be created with its first version (ADR 0001).
  @IsDefined()
  @ValidateNested()
  @Type(() => CreateVersionDto)
  version: CreateVersionDto;
}
