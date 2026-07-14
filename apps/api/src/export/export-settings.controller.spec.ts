import { ExportSettingsController } from './export-settings.controller';
import { ExportSettingsService } from './export-settings.service';

describe('ExportSettingsController', () => {
  let controller: ExportSettingsController;
  let getSettingsMock: jest.Mock;
  let updateSettingsMock: jest.Mock;

  beforeEach(() => {
    getSettingsMock = jest.fn().mockResolvedValue({ id: 'settings-1', exportNamingPattern: '{SIGLA_UNIDADE}' });
    updateSettingsMock = jest.fn().mockResolvedValue({ id: 'settings-1', exportNamingPattern: 'novo' });
    const exportSettingsService = {
      getSettings: getSettingsMock,
      updateSettings: updateSettingsMock,
    } as unknown as ExportSettingsService;
    controller = new ExportSettingsController(exportSettingsService);
  });

  test('get delegates to ExportSettingsService.getSettings', async () => {
    const result = await controller.get();

    expect(getSettingsMock).toHaveBeenCalled();
    expect(result).toEqual({ id: 'settings-1', exportNamingPattern: '{SIGLA_UNIDADE}' });
  });

  test('update delegates to ExportSettingsService.updateSettings with the dto', async () => {
    const dto = { exportNamingPattern: 'novo' };

    const result = await controller.update(dto);

    expect(updateSettingsMock).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ id: 'settings-1', exportNamingPattern: 'novo' });
  });
});
