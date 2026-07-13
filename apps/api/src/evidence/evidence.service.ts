import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthenticatedUser } from '../auth/types/authenticated-user.interface';
import { assertCanEditReportData } from '../common/report-edit-access.util';
import { UnitAccessService } from '../common/services/unit-access.service';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../storage/s3.service';

@Injectable()
export class EvidenceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
    private readonly unitAccessService: UnitAccessService,
  ) {}

  async uploadForIndicatorResponse(
    indicatorResponseId: string,
    user: AuthenticatedUser,
    file: Express.Multer.File,
  ) {
    const response = await this.prisma.indicatorResponse.findUnique({
      where: { id: indicatorResponseId },
      include: { reportInstance: true },
    });
    if (!response) {
      throw new NotFoundException('Resposta de indicador nao encontrada');
    }
    assertCanEditReportData(response.reportInstance, user);

    const fileKey = await this.s3Service.upload(file.buffer, file.originalname, file.mimetype);

    return this.prisma.runWithAuditActor(user.id, (tx) =>
      tx.evidenceFile.create({
        data: {
          indicatorResponseId,
          fileKey,
          fileName: file.originalname,
          mimeType: file.mimetype,
          sizeBytes: file.size,
          uploadedByUserId: user.id,
        },
      }),
    );
  }

  async getDownloadUrl(evidenceFileId: string, user: AuthenticatedUser) {
    const evidence = await this.prisma.evidenceFile.findUnique({
      where: { id: evidenceFileId },
      include: { indicatorResponse: { include: { reportInstance: true } } },
    });
    if (!evidence || !evidence.isActive || !evidence.indicatorResponse) {
      throw new NotFoundException('Evidencia nao encontrada');
    }
    await this.unitAccessService.assertReadAccess(evidence.indicatorResponse.reportInstance.unitId, user);

    return { url: await this.s3Service.getPresignedDownloadUrl(evidence.fileKey) };
  }
}
