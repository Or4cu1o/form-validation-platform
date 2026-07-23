import { ConfigService } from '@nestjs/config';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Service } from './s3.service';

const sendMock = jest.fn();

jest.mock('@aws-sdk/client-s3', () => {
  const actual = jest.requireActual('@aws-sdk/client-s3');
  return {
    ...actual,
    S3Client: jest.fn().mockImplementation(() => ({ send: sendMock })),
  };
});

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn().mockResolvedValue('https://minio.local/signed-url'),
}));

describe('S3Service', () => {
  let service: S3Service;

  function buildConfigService(): ConfigService {
    const values: Record<string, string> = {
      S3_BUCKET: 'formops-evidencias',
      S3_ENDPOINT: 'http://localhost:9000',
      S3_ACCESS_KEY: 'minioadmin',
      S3_SECRET_KEY: 'minioadmin',
    };
    return {
      getOrThrow: jest.fn((key: string) => values[key]),
      get: jest.fn((key: string, fallback?: string) => values[key] ?? fallback),
    } as unknown as ConfigService;
  }

  beforeEach(() => {
    sendMock.mockReset();
    jest.mocked(getSignedUrl).mockClear();
    service = new S3Service(buildConfigService());
  });

  describe('onModuleInit', () => {
    test('does not create the bucket when the HeadBucketCommand succeeds', async () => {
      sendMock.mockResolvedValueOnce({});

      await service.onModuleInit();

      expect(sendMock).toHaveBeenCalledTimes(1);
    });

    test('creates the bucket when it does not exist yet', async () => {
      sendMock.mockRejectedValueOnce(new Error('NotFound')).mockResolvedValueOnce({});

      await service.onModuleInit();

      expect(sendMock).toHaveBeenCalledTimes(2);
    });
  });

  describe('upload', () => {
    test('uploads the buffer under a randomized key and returns it', async () => {
      sendMock.mockResolvedValue({});

      const key = await service.upload(Buffer.from('conteudo'), 'evidencia.pdf', 'application/pdf');

      expect(key).toMatch(/^[0-9a-f-]{36}-evidencia\.pdf$/);
      expect(sendMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('getPresignedDownloadUrl', () => {
    test('returns a time-limited presigned URL for the given key', async () => {
      const url = await service.getPresignedDownloadUrl('evidences/some-key.pdf');

      expect(url).toBe('https://minio.local/signed-url');
      expect(getSignedUrl).toHaveBeenCalledWith(expect.anything(), expect.anything(), { expiresIn: 300 });
    });
  });
});
