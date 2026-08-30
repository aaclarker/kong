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

  // A service is created with its first version.
  @IsDefined()
  @ValidateNested()
  @Type(() => CreateVersionDto)
  version: CreateVersionDto;
}
