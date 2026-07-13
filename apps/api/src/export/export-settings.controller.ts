import { Body, Controller, Get, Patch } from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { UpdateExportSettingsDto } from './dto/update-export-settings.dto';
import { ExportSettingsService } from './export-settings.service';

@Roles(RoleName.ADMINISTRADOR)
@Controller('admin/export-settings')
export class ExportSettingsController {
  constructor(private readonly exportSettingsService: ExportSettingsService) {}

  @Get()
  get() {
    return this.exportSettingsService.getSettings();
  }

  @Patch()
  update(@Body() dto: UpdateExportSettingsDto) {
    return this.exportSettingsService.updateSettings(dto);
  }
}
