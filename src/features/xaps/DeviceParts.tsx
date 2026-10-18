/*
 * SPDX-FileCopyrightText: 2020 Stalwart Labs LLC <hello@stalw.art>
 *
 * SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-SEL
 */

import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Send, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface XapsRegistration {
  apsAccountId: string;
  deviceToken: string;
  mailboxes: string[];
  registeredAt: number;
}

export interface XapsAccount {
  accountId: number;
  accountName: string;
  registrations: XapsRegistration[];
}

export function RegisteredAt({ registeredAt }: { registeredAt: number }) {
  return <>{new Date(registeredAt * 1000).toLocaleString()}</>;
}

export function MailboxBadges({ mailboxes }: { mailboxes: string[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {mailboxes.map((mbox) => (
        <Badge key={mbox} variant="secondary" className="text-xs">
          {mbox}
        </Badge>
      ))}
    </div>
  );
}

interface DeviceActionsProps {
  testing: boolean;
  deleting: boolean;
  onTest: () => void;
  onRemove: () => void;
}

export function DeviceActions({ testing, deleting, onTest, onRemove }: DeviceActionsProps) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-end gap-1">
      <Button variant="ghost" size="icon" disabled={testing} title={t('xaps.test', 'Send test push')} onClick={onTest}>
        {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        disabled={deleting}
        title={t('xaps.remove', 'Remove device')}
        onClick={onRemove}
      >
        {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </Button>
    </div>
  );
}

interface DeviceCardProps {
  registration: XapsRegistration;
  actions?: ReactNode;
}

/** Stacked layout of a single registration, used instead of the table on narrow screens. */
export function DeviceCard({ registration, actions }: DeviceCardProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-2 rounded-md border p-3 text-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground">{t('xaps.deviceId', 'Device ID')}</div>
          <div className="break-all font-mono text-xs">{registration.apsAccountId}</div>
        </div>
        {actions && <div className="-mr-2 -mt-2 shrink-0">{actions}</div>}
      </div>
      <div>
        <div className="mb-1 text-xs text-muted-foreground">{t('xaps.mailboxes', 'Mailboxes')}</div>
        <MailboxBadges mailboxes={registration.mailboxes} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="text-xs text-muted-foreground">{t('xaps.deviceToken', 'Device Token')}</div>
          <div className="break-all font-mono text-xs">{registration.deviceToken}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{t('xaps.registered', 'Registered')}</div>
          <div className="text-xs">
            <RegisteredAt registeredAt={registration.registeredAt} />
          </div>
        </div>
      </div>
    </div>
  );
}
