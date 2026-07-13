import {
  Controller,
  Get,
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
import { EvidenceService } from './evidence.service';

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

@Controller()
export class EvidenceController {
  constructor(private readonly evidenceService: EvidenceService) {}

  @Roles(RoleName.ELABORADOR, RoleName.REVISOR)
  @Post('indicator-responses/:id/evidence')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_UPLOAD_BYTES } }))
  upload(
    @Param('id') indicatorResponseId: string,
    @UploadedFile(
      new ParseFilePipeBuilder().build({ fileIsRequired: true }),
    )
    file: Express.Multer.File,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.evidenceService.uploadForIndicatorResponse(indicatorResponseId, user, file);
  }

  @Get('evidence-files/:id/download-url')
  getDownloadUrl(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.evidenceService.getDownloadUrl(id, user);
  }
}
