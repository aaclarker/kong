import {
  ValidateIf,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

// ValidateIf instead of IsOptional so an explicit null is rejected rather
// than skipped and merged into a NOT NULL column.
export class UpdateVersionDto {
  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  version?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @MinLength(1)
  changelog?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
