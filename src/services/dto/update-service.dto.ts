import { ValidateIf, IsString, MinLength } from 'class-validator';

// Only service fields patchable here, not version fields.
// ValidateIf instead of IsOptional so an explicit null is rejected rather
// than skipped and merged into a NOT NULL column.
export class UpdateServiceDto {
  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @MinLength(1)
  name?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @MinLength(1)
  description?: string;
}
