import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { StorageModule } from '../storage/storage.module';
import { ValidationController } from './validation.controller';
import { ValidationService } from './validation.service';

@Module({
  imports: [StorageModule, NotificationsModule],
  controllers: [ValidationController],
  providers: [ValidationService],
})
export class ValidationModule {}
