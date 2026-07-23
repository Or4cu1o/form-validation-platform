import { PlatformSettingsController } from './platform-settings.controller';
import { PlatformSettingsService } from './platform-settings.service';

describe('PlatformSettingsController', () => {
  let controller: PlatformSettingsController;
  let getSettingsMock: jest.Mock;
  let updateSettingsMock: jest.Mock;

  beforeEach(() => {
    getSettingsMock = jest.fn().mockResolvedValue({ id: 'settings-1', exportNamingPattern: '{SIGLA_UNIDADE}' });
    updateSettingsMock = jest.fn().mockResolvedValue({ id: 'settings-1', exportNamingPattern: 'novo' });
    const platformSettingsService = {
      getSettings: getSettingsMock,
      updateSettings: updateSettingsMock,
    } as unknown as PlatformSettingsService;
    controller = new PlatformSettingsController(platformSettingsService);
  });

  test('get delegates to PlatformSettingsService.getSettings', async () => {
    const result = await controller.get();

    expect(getSettingsMock).toHaveBeenCalled();
    expect(result).toEqual({ id: 'settings-1', exportNamingPattern: '{SIGLA_UNIDADE}' });
  });

  test('update delegates to PlatformSettingsService.updateSettings with the dto', async () => {
    const dto = { exportNamingPattern: 'novo' };

    const result = await controller.update(dto);

    expect(updateSettingsMock).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ id: 'settings-1', exportNamingPattern: 'novo' });
  });
});
