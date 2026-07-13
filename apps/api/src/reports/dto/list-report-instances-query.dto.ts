import { IsDateString, IsEnum, IsIn, IsOptional, IsString, IsUUID } from 'class-validator';
import { ReportStatus } from '@prisma/client';

export class ListReportInstancesQueryDto {
  @IsUUID()
  @IsOptional()
  unitId?: string;

  @IsEnum(ReportStatus)
  @IsOptional()
  status?: ReportStatus;

  @IsDateString()
  @IsOptional()
  referenceMonthFrom?: string;

  @IsDateString()
  @IsOptional()
  referenceMonthTo?: string;

  @IsString()
  @IsOptional()
  search?: string;

  @IsIn(['referenceMonth', 'status'])
  @IsOptional()
  sortBy?: 'referenceMonth' | 'status';

  @IsIn(['asc', 'desc'])
  @IsOptional()
  sortOrder?: 'asc' | 'desc';
}
