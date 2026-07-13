import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { IndicatorResponsesController } from './indicator-responses.controller';
import { IndicatorResponsesService } from './indicator-responses.service';
import { ReportInstancesController } from './report-instances.controller';
import { ReportInstancesService } from './report-instances.service';

@Module({
  imports: [NotificationsModule],
  controllers: [ReportInstancesController, IndicatorResponsesController],
  providers: [ReportInstancesService, IndicatorResponsesService],
})
export class ReportsModule {}
