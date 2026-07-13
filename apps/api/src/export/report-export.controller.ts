import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user.interface';
import { ExportReportQueryDto } from './dto/export-report-query.dto';
import { ReportExportService } from './report-export.service';

@Controller('report-instances')
export class ReportExportController {
  constructor(private readonly reportExportService: ReportExportService) {}

  @Get(':id/export')
  async export(
    @Param('id') id: string,
    @Query() query: ExportReportQueryDto,
    @CurrentUser() user: AuthenticatedUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const file = await this.reportExportService.export(id, query.format, user);
    const asciiFallback = file.filename.replace(/[^\x20-\x7e]/g, '_');
    res.set({
      'Content-Type': file.contentType,
      'Content-Disposition': `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encodeURIComponent(file.filename)}`,
    });
    return file.body;
  }
}
