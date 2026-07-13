import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { UnitLevel } from '@prisma/client';

export class CreateUnitDto {
  @IsString()
  @IsNotEmpty()
  sigla!: string;

  @IsString()
  @IsNotEmpty()
  nome!: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsEnum(UnitLevel)
  level!: UnitLevel;

  @IsUUID()
  @IsOptional()
  formTemplateId?: string;
}
