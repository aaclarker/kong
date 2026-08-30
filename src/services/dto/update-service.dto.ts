import { IsOptional, IsString, MinLength } from 'class-validator';

// Only service fields are patchable here. Versions are managed through the
// version endpoints, so `version` is intentionally not accepted.
export class UpdateServiceDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  description?: string;
}
