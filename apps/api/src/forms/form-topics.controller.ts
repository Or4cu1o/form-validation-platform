import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateFormTopicDto } from './dto/create-form-topic.dto';
import { UpdateFormTopicDto } from './dto/update-form-topic.dto';
import { FormTopicsService } from './form-topics.service';

@Roles(RoleName.ADMINISTRADOR)
@Controller()
export class FormTopicsController {
  constructor(private readonly formTopicsService: FormTopicsService) {}

  @Post('form-templates/:templateId/topics')
  create(@Param('templateId') templateId: string, @Body() dto: CreateFormTopicDto) {
    return this.formTopicsService.create(templateId, dto);
  }

  @Patch('form-topics/:id')
  update(@Param('id') id: string, @Body() dto: UpdateFormTopicDto) {
    return this.formTopicsService.update(id, dto);
  }

  @Patch('form-topics/:id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.formTopicsService.setActive(id, false);
  }

  @Patch('form-topics/:id/activate')
  activate(@Param('id') id: string) {
    return this.formTopicsService.setActive(id, true);
  }
}
