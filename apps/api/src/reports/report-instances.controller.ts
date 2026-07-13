import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthenticatedUser } from '../auth/types/authenticated-user.interface';
import { ListReportInstancesQueryDto } from './dto/list-report-instances-query.dto';
import { ReportInstancesService } from './report-instances.service';

@Controller('report-instances')
export class ReportInstancesController {
  constructor(private readonly reportInstancesService: ReportInstancesService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser, @Query() query: ListReportInstancesQueryDto) {
    return this.reportInstancesService.findAllForUser(user, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.reportInstancesService.findOneForUser(id, user);
  }

  @Roles(RoleName.ELABORADOR)
  @Post(':id/submit-for-review')
  submitForReview(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.reportInstancesService.submitForReview(id, user);
  }

  @Roles(RoleName.REVISOR)
  @Post(':id/submit-for-approval')
  submitForApproval(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.reportInstancesService.submitForApproval(id, user);
  }
}
