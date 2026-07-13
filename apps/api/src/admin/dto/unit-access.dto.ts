import { IsUUID } from 'class-validator';

export class UnitAccessDto {
  @IsUUID()
  unitId!: string;
}
