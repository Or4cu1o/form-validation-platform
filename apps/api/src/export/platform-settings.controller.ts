import { Body, Controller, Get, Patch } from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { UpdatePlatformSettingsDto } from './dto/update-platform-settings.dto';
import { PlatformSettingsService } from './platform-settings.service';

@Roles(RoleName.ADMINISTRADOR)
@Controller('admin/platform-settings')
export class PlatformSettingsController {
  constructor(private readonly platformSettingsService: PlatformSettingsService) {}

  @Get()
  get() {
    return this.platformSettingsService.getSettings();
  }

  @Patch()
  update(@Body() dto: UpdatePlatformSettingsDto) {
    return this.platformSettingsService.updateSettings(dto);
  }
}
