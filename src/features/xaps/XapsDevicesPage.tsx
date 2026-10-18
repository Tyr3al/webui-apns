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
import { useAccountStore } from '@/stores/accountStore';
import { sendTestPush } from './testPush';
import { DeviceActions, DeviceCard, MailboxBadges, RegisteredAt, type XapsAccount } from './DeviceParts';

interface XapsAccountsResponse {
  accounts: XapsAccount[];
}

export function XapsDevicesPage() {
  const { t } = useTranslation();
  const hasObjectPermission = useAccountStore((s) => s.hasObjectPermission);
  const [accounts, setAccounts] = useState<XapsAccount[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);

  const canView = hasObjectPermission('sysAccount', 'Get');
  const canDelete = hasObjectPermission('sysAccount', 'Update');

  const load = useCallback(async () => {
    try {
      const response = await apiFetch('/api/xaps/registrations');
      const data = (await response.json()) as XapsAccountsResponse;
      setAccounts(data.accounts);
      setError(null);
    } catch (err) {
      console.error('Failed to load XAPS registrations:', err);
      setError(err instanceof Error ? err.message : t('xaps.loadFailed', 'Failed to load push devices.'));
    }
  }, [t]);

  useEffect(() => {
    if (canView) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void load();
    }
  }, [canView, load]);

  const removeDevice = useCallback(
    async (accountId: number, apsAccountId: string) => {
      if (!window.confirm(t('xaps.confirmRemove', 'Remove this device?'))) return;
      setDeleting(apsAccountId);
      try {
        await apiFetch(`/api/xaps/registrations/${accountId}/${encodeURIComponent(apsAccountId)}`, {
          method: 'DELETE',
        });
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
    [load, t],
  );

  const removeAllDevices = useCallback(
    async (accountId: number, accountName: string) => {
      if (!window.confirm(t('xaps.confirmRemoveAll', 'Remove all devices of {{name}}?', { name: accountName }))) return;
      setDeleting(`all-${accountId}`);
      try {
        await apiFetch(`/api/xaps/registrations/${accountId}`, { method: 'DELETE' });
        toast({ title: t('xaps.removedAll', 'All devices removed.'), variant: 'success' });
        await load();
      } catch (err) {
        console.error('Failed to remove devices:', err);
        toast({
          title: t('xaps.removeFailed', 'Failed to remove devices.'),
          variant: 'destructive',
        });
      } finally {
        setDeleting(null);
      }
    },
    [load, t],
  );

  const testDevice = useCallback(
    async (accountId: number, apsAccountId: string) => {
      setTesting(apsAccountId);
      const reload = await sendTestPush(String(accountId), apsAccountId, t);
      setTesting(null);
      if (reload) {
        await load();
      }
    },
    [load, t],
  );

  const deviceActions = (account: XapsAccount, reg: XapsAccount['registrations'][number]) =>
    canDelete ? (
      <DeviceActions
        testing={testing === reg.apsAccountId}
        deleting={deleting === reg.apsAccountId}
        onTest={() => void testDevice(account.accountId, reg.apsAccountId)}
        onRemove={() => void removeDevice(account.accountId, reg.apsAccountId)}
      />
    ) : undefined;

  const removeAllButton = (account: XapsAccount) =>
    account.registrations.length > 1 && canDelete ? (
      <Button
        variant="outline"
        size="sm"
        disabled={deleting === `all-${account.accountId}`}
        onClick={() => void removeAllDevices(account.accountId, account.accountName)}
      >
        {t('xaps.removeAll', 'Remove all')}
      </Button>
    ) : null;

  if (!canView) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('xaps.title', 'Push Devices')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t('xaps.noPermission', 'You do not have permission to view push devices.')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          {t('xaps.title', 'Push Devices')}
        </CardTitle>
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={!accounts}>
          <RefreshCw className="h-4 w-4" />
          {t('xaps.refresh', 'Refresh')}
        </Button>
      </CardHeader>
      <CardContent>
        {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
        {!accounts ? (
          <div className="flex items-center justify-center p-8 text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('common.loading', 'Loading...')}
          </div>
        ) : accounts.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            {t('xaps.empty', 'No devices registered yet.')}
          </p>
        ) : (
          <>
            {/* Narrow screens: one card per account, one block per device. */}
            <div className="space-y-4 md:hidden">
              {accounts.map((account) => (
                <div key={account.accountId} className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate font-medium">{account.accountName}</div>
                      <div className="text-xs text-muted-foreground">#{account.accountId}</div>
                    </div>
                    {removeAllButton(account)}
                  </div>
                  {account.registrations.map((reg) => (
                    <DeviceCard key={reg.apsAccountId} registration={reg} actions={deviceActions(account, reg)} />
                  ))}
                </div>
              ))}
            </div>

            {/* Wide screens: one table row per device, the account cell spans its devices. */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted">
                    <th className="px-3 py-3 text-left font-medium text-muted-foreground">
                      {t('xaps.account', 'Account')}
                    </th>
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
                {accounts.map((account) => (
                  <tbody key={account.accountId} className="border-b">
                    {account.registrations.map((reg, index) => (
                      <tr key={reg.apsAccountId} className="align-middle">
                        {index === 0 && (
                          <td rowSpan={account.registrations.length} className="px-3 py-2 align-top">
                            <div className="font-medium">{account.accountName}</div>
                            <div className="text-xs text-muted-foreground">#{account.accountId}</div>
                            {account.registrations.length > 1 && canDelete && (
                              <div className="pt-2">{removeAllButton(account)}</div>
                            )}
                          </td>
                        )}
                        <td className="px-3 py-1 font-mono text-xs">{reg.apsAccountId}</td>
                        <td className="px-3 py-1 font-mono text-xs">{reg.deviceToken}</td>
                        <td className="px-3 py-1">
                          <MailboxBadges mailboxes={reg.mailboxes} />
                        </td>
                        <td className="whitespace-nowrap px-3 py-1 text-xs text-muted-foreground">
                          <RegisteredAt registeredAt={reg.registeredAt} />
                        </td>
                        <td className="px-3 py-1">{deviceActions(account, reg)}</td>
                      </tr>
                    ))}
                  </tbody>
                ))}
              </table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
