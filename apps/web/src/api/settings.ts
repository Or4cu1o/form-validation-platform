import { apiGet, apiSend } from '../lib/api-client';
import type { SystemSetting, UpdatePlatformSettingsInput } from '../types/api';

export function getPlatformSettings(): Promise<SystemSetting> {
  return apiGet<SystemSetting>('/admin/platform-settings');
}

export function updatePlatformSettings(input: UpdatePlatformSettingsInput): Promise<SystemSetting> {
  return apiSend<SystemSetting>('PATCH', '/admin/platform-settings', input);
}
