import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { LifecycleCronService } from './lifecycle-cron.service';
import { ReportLifecycleService } from './report-lifecycle.service';

@Module({
  imports: [NotificationsModule],
  providers: [ReportLifecycleService, LifecycleCronService],
  exports: [ReportLifecycleService],
})
export class LifecycleModule {}
