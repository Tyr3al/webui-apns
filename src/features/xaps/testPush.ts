/*
 * SPDX-FileCopyrightText: 2020 Stalwart Labs LLC <hello@stalw.art>
 *
 * SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-SEL
 */

import type { TFunction } from 'i18next';
import { apiFetch } from '@/services/api';
import { toast } from '@/hooks/use-toast';

interface TestResult {
  status: 'ok' | 'not-configured' | 'device-inactive' | 'error';
}

/**
 * Sends a test push to a device via the management API and reports the result
 * to the user. Returns true when the device list should be refreshed (a push
 * was sent or the registration was removed).
 */
export async function sendTestPush(accountId: string, apsAccountId: string, t: TFunction): Promise<boolean> {
  try {
    const response = await apiFetch(
      `/api/xaps/test/${encodeURIComponent(accountId)}/${encodeURIComponent(apsAccountId)}`,
      { method: 'POST' },
    );
    const data = (await response.json()) as TestResult;
    switch (data.status) {
      case 'ok':
        toast({
          title: t('xaps.testSent', 'Test push accepted. Mail will refresh silently.'),
          variant: 'success',
        });
        return true;
      case 'not-configured':
        toast({
          title: t('xaps.testNotConfigured', 'Push is not configured or the configuration is broken.'),
          variant: 'destructive',
        });
        return false;
      case 'device-inactive':
        toast({
          title: t('xaps.testDeviceInactive', 'The device token is no longer valid, the device was removed.'),
          variant: 'warning',
        });
        return true;
      default:
        toast({ title: t('xaps.testFailed', 'Test push failed.'), variant: 'destructive' });
        return false;
    }
  } catch (err) {
    console.error('Failed to send test push:', err);
    toast({ title: t('xaps.testFailed', 'Test push failed.'), variant: 'destructive' });
    return false;
  }
}
