/*
 * SPDX-FileCopyrightText: 2020 Stalwart Labs LLC <hello@stalw.art>
 *
 * SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-SEL
 */

import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, RefreshCw, Smartphone } from 'lucide-react';
import { apiFetch } from '@/services/api';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores/authStore';
import { sendTestPush } from './testPush';
import { DeviceActions, DeviceCard, MailboxBadges, RegisteredAt, type XapsAccount } from './DeviceParts';

export function XapsMyDevicesPage() {
  const { t } = useTranslation();
  const accountId = useAuthStore((s) => s.activeAccountId);
  const [account, setAccount] = useState<XapsAccount | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!accountId) return;
    setError(null);
    try {
      const response = await apiFetch(`/api/xaps/registrations/${encodeURIComponent(accountId)}`);
      const data = (await response.json()) as XapsAccount;
      setAccount(data);
    } catch (err) {
      console.error('Failed to load XAPS registrations:', err);
      setError(err instanceof Error ? err.message : t('xaps.loadFailed', 'Failed to load push devices.'));
    }
  }, [accountId, t]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const removeDevice = useCallback(
    async (apsAccountId: string) => {
      if (!window.confirm(t('xaps.confirmRemove', 'Remove this device?'))) return;
      setDeleting(apsAccountId);
      try {
        await apiFetch(
          `/api/xaps/registrations/${encodeURIComponent(accountId ?? '')}/${encodeURIComponent(apsAccountId)}`,
          {
            method: 'DELETE',
          },
        );
        toast({ title: t('xaps.removed', 'Device removed.'), variant: 'success' });
        await load();
      } catch (err) {
        console.error('Failed to remove device:', err);
        toast({
          title: t('xaps.removeFailed', 'Failed to remove device.'),
          variant: 'destructive',
        });
      } finally {
        setDeleting(null);
      }
    },
    [accountId, load, t],
  );

  const testDevice = useCallback(
    async (apsAccountId: string) => {
      if (!accountId) return;
      setTesting(apsAccountId);
      const reload = await sendTestPush(accountId, apsAccountId, t);
      setTesting(null);
      if (reload) {
        await load();
      }
    },
    [accountId, load, t],
  );

  const deviceActions = (apsAccountId: string) => (
    <DeviceActions
      testing={testing === apsAccountId}
      deleting={deleting === apsAccountId}
      onTest={() => void testDevice(apsAccountId)}
      onRemove={() => void removeDevice(apsAccountId)}
    />
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          {t('xaps.myDevicesTitle', 'My Devices')}
        </CardTitle>
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={!account}>
          <RefreshCw className="h-4 w-4" />
          {t('xaps.refresh', 'Refresh')}
        </Button>
      </CardHeader>
      <CardContent>
        {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
        {!account ? (
          <div className="flex items-center justify-center p-8 text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('common.loading', 'Loading...')}
          </div>
        ) : account.registrations.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            {t('xaps.myDevicesEmpty', 'You have no registered devices.')}
          </p>
        ) : (
          <>
            {/* Narrow screens: one block per device. */}
            <div className="space-y-2 md:hidden">
              {account.registrations.map((reg) => (
                <DeviceCard key={reg.apsAccountId} registration={reg} actions={deviceActions(reg.apsAccountId)} />
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted">
                    <th className="px-3 py-3 text-left font-medium text-muted-foreground">
                      {t('xaps.deviceId', 'Device ID')}
                    </th>
                    <th className="px-3 py-3 text-left font-medium text-muted-foreground">
                      {t('xaps.deviceToken', 'Device Token')}
                    </th>
                    <th className="px-3 py-3 text-left font-medium text-muted-foreground">
                      {t('xaps.mailboxes', 'Mailboxes')}
                    </th>
                    <th className="px-3 py-3 text-left font-medium text-muted-foreground">
                      {t('xaps.registered', 'Registered')}
                    </th>
                    <th className="w-12 px-3 py-3 text-right font-medium text-muted-foreground">
                      {t('list.actions', 'Actions')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {account.registrations.map((reg) => (
                    <tr key={reg.apsAccountId} className="border-b align-middle">
                      <td className="px-3 py-1 font-mono text-xs">{reg.apsAccountId}</td>
                      <td className="px-3 py-1 font-mono text-xs">{reg.deviceToken}</td>
                      <td className="px-3 py-1">
                        <MailboxBadges mailboxes={reg.mailboxes} />
                      </td>
                      <td className="whitespace-nowrap px-3 py-1 text-xs text-muted-foreground">
                        <RegisteredAt registeredAt={reg.registeredAt} />
                      </td>
                      <td className="px-3 py-1">{deviceActions(reg.apsAccountId)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
