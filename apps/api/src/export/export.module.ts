import { Module } from '@nestjs/common';
import { PlatformSettingsController } from './platform-settings.controller';
import { PlatformSettingsService } from './platform-settings.service';
import { ReportExportController } from './report-export.controller';
import { ReportExportService } from './report-export.service';

@Module({
  controllers: [PlatformSettingsController, ReportExportController],
  providers: [PlatformSettingsService, ReportExportService],
  exports: [PlatformSettingsService],
})
export class ExportModule {}
