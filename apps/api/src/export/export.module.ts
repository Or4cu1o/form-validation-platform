import { Module } from '@nestjs/common';
import { ExportSettingsController } from './export-settings.controller';
import { ExportSettingsService } from './export-settings.service';
import { ReportExportController } from './report-export.controller';
import { ReportExportService } from './report-export.service';

@Module({
  controllers: [ExportSettingsController, ReportExportController],
  providers: [ExportSettingsService, ReportExportService],
})
export class ExportModule {}
