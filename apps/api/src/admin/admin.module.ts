import { Module } from '@nestjs/common';
import { UnitsAdminController } from './units-admin.controller';
import { UnitsAdminService } from './units-admin.service';
import { UsersAdminController } from './users-admin.controller';
import { UsersAdminService } from './users-admin.service';

@Module({
  controllers: [UsersAdminController, UnitsAdminController],
  providers: [UsersAdminService, UnitsAdminService],
})
export class AdminModule {}
