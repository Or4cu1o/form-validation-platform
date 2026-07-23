import { PrismaService } from '../prisma/prisma.service';
import { ExportSettingsService } from './export-settings.service';

describe('ExportSettingsService', () => {
  let service: ExportSettingsService;
  let findFirstMock: jest.Mock;
  let createMock: jest.Mock;
  let updateMock: jest.Mock;

  beforeEach(() => {
    findFirstMock = jest.fn();
    createMock = jest.fn();
    updateMock = jest.fn();
    const prisma = {
      systemSetting: { findFirst: findFirstMock, create: createMock, update: updateMock },
    } as unknown as PrismaService;
    service = new ExportSettingsService(prisma);
  });

  describe('getSettings', () => {
    test('returns the existing settings row when one already exists', async () => {
      const existing = { id: 'settings-1', exportNamingPattern: '{SIGLA_UNIDADE}_{DATA_ISO}' };
      findFirstMock.mockResolvedValue(existing);

      const result = await service.getSettings();

      expect(result).toBe(existing);
      expect(createMock).not.toHaveBeenCalled();
    });

    test('creates default settings when none exist yet', async () => {
      findFirstMock.mockResolvedValue(null);
      const created = { id: 'settings-1', exportNamingPattern: 'default' };
      createMock.mockResolvedValue(created);

      const result = await service.getSettings();

      expect(createMock).toHaveBeenCalledWith({ data: {} });
      expect(result).toBe(created);
    });
  });

  describe('updateSettings', () => {
    test('updates the existing (or freshly created) settings row', async () => {
      findFirstMock.mockResolvedValue({ id: 'settings-1' });
      updateMock.mockResolvedValue({ id: 'settings-1', exportNamingPattern: 'novo-padrao' });

      await service.updateSettings({ exportNamingPattern: 'novo-padrao' });

      expect(updateMock).toHaveBeenCalledWith({
        where: { id: 'settings-1' },
        data: { exportNamingPattern: 'novo-padrao' },
      });
    });
  });
});
