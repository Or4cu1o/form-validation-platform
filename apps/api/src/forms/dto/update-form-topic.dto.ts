import { PartialType } from '@nestjs/mapped-types';
import { CreateFormTopicDto } from './create-form-topic.dto';

export class UpdateFormTopicDto extends PartialType(CreateFormTopicDto) {}
