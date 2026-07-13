import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateFormTemplateDto } from './dto/create-form-template.dto';
import { UpdateFormTemplateDto } from './dto/update-form-template.dto';
import { FormTemplatesService } from './form-templates.service';

@Controller('form-templates')
export class FormTemplatesController {
  constructor(private readonly formTemplatesService: FormTemplatesService) {}

  @Get()
  findAll(@Query('includeInactive') includeInactive?: string) {
    return this.formTemplatesService.findAll(includeInactive === 'true');
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query('includeInactive') includeInactive?: string) {
    return this.formTemplatesService.findOneWithStructure(id, includeInactive === 'true');
  }

  @Roles(RoleName.ADMINISTRADOR)
  @Post()
  create(@Body() dto: CreateFormTemplateDto) {
    return this.formTemplatesService.create(dto);
  }

  @Roles(RoleName.ADMINISTRADOR)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFormTemplateDto) {
    return this.formTemplatesService.update(id, dto);
  }

  @Roles(RoleName.ADMINISTRADOR)
  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.formTemplatesService.setActive(id, false);
  }

  @Roles(RoleName.ADMINISTRADOR)
  @Patch(':id/activate')
  activate(@Param('id') id: string) {
    return this.formTemplatesService.setActive(id, true);
  }
}
