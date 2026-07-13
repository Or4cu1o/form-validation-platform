import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateFormIndicatorDto } from './dto/create-form-indicator.dto';
import { UpdateFormIndicatorDto } from './dto/update-form-indicator.dto';
import { FormIndicatorsService } from './form-indicators.service';

@Roles(RoleName.ADMINISTRADOR)
@Controller()
export class FormIndicatorsController {
  constructor(private readonly formIndicatorsService: FormIndicatorsService) {}

  @Post('form-topics/:topicId/indicators')
  create(@Param('topicId') topicId: string, @Body() dto: CreateFormIndicatorDto) {
    return this.formIndicatorsService.create(topicId, dto);
  }

  @Patch('form-indicators/:id')
  update(@Param('id') id: string, @Body() dto: UpdateFormIndicatorDto) {
    return this.formIndicatorsService.update(id, dto);
  }

  @Patch('form-indicators/:id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.formIndicatorsService.setActive(id, false);
  }

  @Patch('form-indicators/:id/activate')
  activate(@Param('id') id: string) {
    return this.formIndicatorsService.setActive(id, true);
  }
}
