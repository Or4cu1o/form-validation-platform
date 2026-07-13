import { PartialType } from '@nestjs/mapped-types';
import { CreateFormIndicatorDto } from './create-form-indicator.dto';

export class UpdateFormIndicatorDto extends PartialType(CreateFormIndicatorDto) {}
