import {
  Body,
  Controller,
  Param,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RoleName } from '@prisma/client';
import { AuthenticatedUser } from '../auth/types/authenticated-user.interface';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { ValidateIndicatorDto } from './dto/validate-indicator.dto';
import { ValidationService } from './validation.service';

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

@Roles(RoleName.APROVADOR)
@Controller()
export class ValidationController {
  constructor(private readonly validationService: ValidationService) {}

  @Post('indicator-responses/:id/validate')
  validateIndicator(
    @Param('id') id: string,
    @Body() dto: ValidateIndicatorDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.validationService.validateIndicator(id, user, dto);
  }

  @Post('validation-records/:id/evidence')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_UPLOAD_BYTES } }))
  uploadEvidence(
    @Param('id') id: string,
    @UploadedFile(new ParseFilePipeBuilder().build({ fileIsRequired: true }))
    file: Express.Multer.File,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.validationService.uploadValidationEvidence(id, user, file);
  }

  @Post('report-instances/:id/finalize')
  finalize(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.validationService.finalizeReport(id, user);
  }
}
