import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdatePlatformSettingsDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  exportNamingPattern?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(28)
  slaElaborationBusinessDay?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(28)
  slaReviewBusinessDay?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(28)
  slaApprovalBusinessDay?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(30)
  slaReprovalExtensionDays?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  slaDeflatorScore?: number;
}
