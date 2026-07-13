import { IsIn } from 'class-validator';

export class ExportReportQueryDto {
  @IsIn(['csv', 'json'])
  format!: 'csv' | 'json';
}
