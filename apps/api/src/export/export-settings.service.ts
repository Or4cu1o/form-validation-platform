import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateExportSettingsDto } from './dto/update-export-settings.dto';

@Injectable()
export class ExportSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings() {
    const existing = await this.prisma.systemSetting.findFirst();
    if (existing) {
      return existing;
    }
    return this.prisma.systemSetting.create({ data: {} });
  }

  async updateSettings(dto: UpdateExportSettingsDto) {
    const settings = await this.getSettings();
    return this.prisma.systemSetting.update({ where: { id: settings.id }, data: dto });
  }
}
