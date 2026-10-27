/*
 * SPDX-FileCopyrightText: 2020 Stalwart Labs LLC <hello@stalw.art>
 *
 * SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-SEL
 */

import { describe, expect, it } from 'vitest';
import type { Schema } from '@/types/schema';
import { isLinkVisible } from '@/lib/layout';
import { createPermissionCheckers, isCreateOnly } from '@/lib/permissions';

const permission = (name: string) => ({ name, label: name });

const schema = {
  objects: {
    'x:Action': { type: 'object', description: '', permissionPrefix: 'sysAction' },
    'x:Domain': { type: 'object', description: '', permissionPrefix: 'sysDomain' },
    'x:Legacy': { type: 'object', description: '', permissionPrefix: 'sysLegacy' },
    'x:DomainView': { type: 'view', objectName: 'x:Domain' },
  },
  schemas: {},
  fields: {},
  forms: {},
  lists: {},
  enums: {
    Permission: ['sysActionCreate', 'sysDomainGet', 'sysDomainCreate'].map(permission),
  },
  dashboards: [],
  layouts: [],
} as unknown as Schema;

function visible(viewName: string, granted: string[]): boolean {
  const { canGet, hasPermission } = createPermissionCheckers(granted);
  return isLinkVisible(schema, viewName, canGet, hasPermission);
}

describe('isCreateOnly', () => {
  it('detects objects whose only defined permission is Create', () => {
    expect(isCreateOnly(schema, 'sysAction')).toBe(true);
    expect(isCreateOnly(schema, 'sysDomain')).toBe(false);
    expect(isCreateOnly(schema, 'sysLegacy')).toBe(false);
  });
});

describe('isLinkVisible', () => {
  it('shows create-only objects to users holding the Create permission', () => {
    expect(visible('x:Action', ['sysActionCreate'])).toBe(true);
    expect(visible('x:Action', [])).toBe(false);
  });

  it('requires Get for objects that define it', () => {
    expect(visible('x:Domain', ['sysDomainGet'])).toBe(true);
    expect(visible('x:DomainView', ['sysDomainGet'])).toBe(true);
    expect(visible('x:Domain', ['sysDomainCreate'])).toBe(false);
  });

  it('falls back to Get for objects missing from the permission enum', () => {
    expect(visible('x:Legacy', ['sysLegacyGet'])).toBe(true);
    expect(visible('x:Legacy', ['sysLegacyCreate'])).toBe(false);
  });
});
