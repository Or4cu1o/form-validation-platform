import { BadRequestException } from '@nestjs/common';
import { EVIDENCE_MIME_TYPE_FILTER } from './evidence-upload.constants';

describe('EVIDENCE_MIME_TYPE_FILTER', () => {
  function buildFile(mimetype: string): Express.Multer.File {
    return { mimetype } as Express.Multer.File;
  }

  test.each(['application/pdf', 'image/png', 'image/jpeg', 'image/webp'])(
    'accepts %s',
    (mimetype) => {
      const callback = jest.fn();

      EVIDENCE_MIME_TYPE_FILTER({}, buildFile(mimetype), callback);

      expect(callback).toHaveBeenCalledWith(null, true);
    },
  );

  test.each(['application/x-msdownload', 'text/html', 'image/svg+xml', 'application/javascript'])(
    'rejects %s with a BadRequestException',
    (mimetype) => {
      const callback = jest.fn();

      EVIDENCE_MIME_TYPE_FILTER({}, buildFile(mimetype), callback);

      expect(callback).toHaveBeenCalledWith(expect.any(BadRequestException), false);
    },
  );
});
