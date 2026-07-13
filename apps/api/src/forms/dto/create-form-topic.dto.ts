import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateFormTopicDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;
}
