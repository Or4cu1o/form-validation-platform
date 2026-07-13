import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UnitAccessDto } from './dto/unit-access.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersAdminService } from './users-admin.service';

@Roles(RoleName.ADMINISTRADOR)
@Controller('admin/users')
export class UsersAdminController {
  constructor(private readonly usersAdminService: UsersAdminService) {}

  @Get()
  findAll(@Query('includeInactive') includeInactive?: string) {
    return this.usersAdminService.findAll(includeInactive === 'true');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersAdminService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersAdminService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersAdminService.update(id, dto);
  }

  @Patch(':id/reset-password')
  resetPassword(@Param('id') id: string, @Body() dto: ResetPasswordDto) {
    return this.usersAdminService.resetPassword(id, dto.newPassword);
  }

  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.usersAdminService.setActive(id, false);
  }

  @Patch(':id/activate')
  activate(@Param('id') id: string) {
    return this.usersAdminService.setActive(id, true);
  }

  @Post(':id/unit-access')
  grantUnitAccess(@Param('id') id: string, @Body() dto: UnitAccessDto) {
    return this.usersAdminService.grantUnitAccess(id, dto.unitId);
  }

  @Post(':id/unit-access/revoke')
  revokeUnitAccess(@Param('id') id: string, @Body() dto: UnitAccessDto) {
    return this.usersAdminService.revokeUnitAccess(id, dto.unitId);
  }
}
