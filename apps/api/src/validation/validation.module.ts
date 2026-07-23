import { Module } from '@nestjs/common';
import { ExportModule } from '../export/export.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { StorageModule } from '../storage/storage.module';
import { ValidationController } from './validation.controller';
import { ValidationService } from './validation.service';

@Module({
  imports: [StorageModule, NotificationsModule, ExportModule],
  controllers: [ValidationController],
  providers: [ValidationService],
})
export class ValidationModule {}
