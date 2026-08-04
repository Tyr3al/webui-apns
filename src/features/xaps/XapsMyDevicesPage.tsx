/*
 * SPDX-FileCopyrightText: 2020 Stalwart Labs LLC <hello@stalw.art>
 *
 * SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-SEL
 */

import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, RefreshCw, Smartphone, Trash2 } from 'lucide-react';
import { apiFetch } from '@/services/api';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/authStore';

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

export function XapsMyDevicesPage() {
  const { t } = useTranslation();
  const accountId = useAuthStore((s) => s.activeAccountId);
  const [account, setAccount] = useState<XapsAccount | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

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
        await apiFetch(`/api/xaps/registrations/${encodeURIComponent(accountId ?? '')}/${encodeURIComponent(apsAccountId)}`, {
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
    [accountId, load, t],
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
                <tr key={reg.apsAccountId} className="border-b align-top">
                  <td className="px-3 py-2 font-mono text-xs">{reg.apsAccountId}</td>
                  <td className="px-3 py-2 font-mono text-xs">{reg.deviceToken}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {reg.mailboxes.map((mbox) => (
                        <Badge key={mbox} variant="secondary" className="text-xs">
                          {mbox}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">
                    {new Date(reg.registeredAt * 1000).toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={deleting === reg.apsAccountId}
                      title={t('xaps.remove', 'Remove device')}
                      onClick={() => void removeDevice(reg.apsAccountId)}
                    >
                      {deleting === reg.apsAccountId ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}
