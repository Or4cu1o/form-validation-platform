import { Body, Controller, Param, Patch } from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { AuthenticatedUser } from '../auth/types/authenticated-user.interface';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UpdateIndicatorResponseDto } from './dto/update-indicator-response.dto';
import { IndicatorResponsesService } from './indicator-responses.service';

@Controller('indicator-responses')
export class IndicatorResponsesController {
  constructor(private readonly indicatorResponsesService: IndicatorResponsesService) {}

  @Roles(RoleName.ELABORADOR, RoleName.REVISOR)
  @Patch(':id')
  updateValues(
    @Param('id') id: string,
    @Body() dto: UpdateIndicatorResponseDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.indicatorResponsesService.updateValues(id, user, dto);
  }
}
