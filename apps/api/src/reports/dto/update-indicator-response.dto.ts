import { IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateIndicatorResponseDto {
  // Chaves e tipos validados dinamicamente no service contra as
  // snapshotVariableKeys do indicador (nao da para tipar estaticamente
  // um DTO cujas chaves variam por indicador).
  @IsObject()
  variableValues!: Record<string, number>;

  @IsOptional()
  @IsString()
  criticalAnalysis?: string;

  @IsOptional()
  @IsString()
  actionPlan?: string;
}
