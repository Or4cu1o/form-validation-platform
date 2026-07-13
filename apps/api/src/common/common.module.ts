import { Global, Module } from '@nestjs/common';
import { UnitAccessService } from './services/unit-access.service';

@Global()
@Module({
  providers: [UnitAccessService],
  exports: [UnitAccessService],
})
export class CommonModule {}
