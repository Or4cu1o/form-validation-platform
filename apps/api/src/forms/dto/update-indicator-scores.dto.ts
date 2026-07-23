import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsNumber, IsString, Max, Min, ValidateNested } from 'class-validator';

export class IndicatorScoreEntryDto {
  @IsString()
  @IsNotEmpty()
  indicatorId!: string;

  @IsNumber()
  @Min(0)
  @Max(10)
  scoreWeight!: number;
}

export class UpdateIndicatorScoresDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => IndicatorScoreEntryDto)
  weights!: IndicatorScoreEntryDto[];
}
