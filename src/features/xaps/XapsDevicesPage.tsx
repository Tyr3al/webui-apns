/*
 * SPDX-FileCopyrightText: 2020 Stalwart Labs LLC <hello@stalw.art>
 *
 * SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-SEL
 */

import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, RefreshCw, Send, Smartphone, Trash2 } from 'lucide-react';
import { apiFetch } from '@/services/api';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAccountStore } from '@/stores/accountStore';
import { sendTestPush } from './testPush';

interface XapsRegistration {
  apsAccountId: string;
  deviceToken: string;
  mailboxes: string[];
  registeredAt: number;
}

interface XapsAccount {
  accountId: number;
  accountName: string;
  registrations: XapsRegistration[];
}

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
          <div className="overflow-x-auto">
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
              <tbody>
                {accounts.map((account) => (
                  <tr key={account.accountId} className="border-b align-top">
                    <td className="px-3 py-2">
                      <div className="font-medium">{account.accountName}</div>
                      <div className="text-xs text-muted-foreground">#{account.accountId}</div>
                    </td>
                    <td className="px-3 py-2">
                      {account.registrations.map((reg) => (
                        <div key={reg.apsAccountId} className="py-0.5 font-mono text-xs">
                          {reg.apsAccountId}
                        </div>
                      ))}
                    </td>
                    <td className="px-3 py-2">
                      {account.registrations.map((reg) => (
                        <div key={reg.apsAccountId} className="py-0.5 font-mono text-xs">
                          {reg.deviceToken}
                        </div>
                      ))}
                    </td>
                    <td className="px-3 py-2">
                      {account.registrations.map((reg) => (
                        <div key={reg.apsAccountId} className="flex flex-wrap gap-1 py-0.5">
                          {reg.mailboxes.map((mbox) => (
                            <Badge key={mbox} variant="secondary" className="text-xs">
                              {mbox}
                            </Badge>
                          ))}
                        </div>
                      ))}
                    </td>
                    <td className="px-3 py-2">
                      {account.registrations.map((reg) => (
                        <div key={reg.apsAccountId} className="py-0.5 text-xs text-muted-foreground">
                          {new Date(reg.registeredAt * 1000).toLocaleString()}
                        </div>
                      ))}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {account.registrations.map((reg) => (
                        <div key={reg.apsAccountId} className="flex items-center justify-end gap-1 py-0.5">
                          {canDelete && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={testing === reg.apsAccountId}
                                title={t('xaps.test', 'Send test push')}
                                onClick={() => void testDevice(account.accountId, reg.apsAccountId)}
                              >
                                {testing === reg.apsAccountId ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Send className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={deleting === reg.apsAccountId}
                                title={t('xaps.remove', 'Remove device')}
                                onClick={() => void removeDevice(account.accountId, reg.apsAccountId)}
                              >
                                {deleting === reg.apsAccountId ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </>
                          )}
                        </div>
                      ))}
                      {account.registrations.length > 1 && canDelete && (
                        <div className="pt-1">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={deleting === `all-${account.accountId}`}
                            onClick={() => void removeAllDevices(account.accountId, account.accountName)}
                          >
                            {t('xaps.removeAll', 'Remove all')}
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
