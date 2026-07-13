import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateExportSettingsDto {
  @IsString()
  @IsNotEmpty()
  exportNamingPattern!: string;
}
