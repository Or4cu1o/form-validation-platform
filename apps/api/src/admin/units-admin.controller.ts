import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { UnitsAdminService } from './units-admin.service';

@Roles(RoleName.ADMINISTRADOR)
@Controller('admin/units')
export class UnitsAdminController {
  constructor(private readonly unitsAdminService: UnitsAdminService) {}

  @Get()
  findAll(@Query('includeInactive') includeInactive?: string) {
    return this.unitsAdminService.findAll(includeInactive === 'true');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.unitsAdminService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateUnitDto) {
    return this.unitsAdminService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUnitDto) {
    return this.unitsAdminService.update(id, dto);
  }

  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.unitsAdminService.setActive(id, false);
  }

  @Patch(':id/activate')
  activate(@Param('id') id: string) {
    return this.unitsAdminService.setActive(id, true);
  }
}
