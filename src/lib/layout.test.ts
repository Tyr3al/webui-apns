/*
 * SPDX-FileCopyrightText: 2020 Stalwart Labs LLC <hello@stalw.art>
 *
 * SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-SEL
 */

import { describe, expect, it, vi } from 'vitest';
import { isLinkVisible } from './layout';
import type { Schema } from '@/types/schema';

const schema: Schema = {
  objects: {},
  schemas: {},
  fields: {},
  forms: {},
  lists: {},
  enums: {},
  dashboards: [],
  layouts: [],
};

describe('XAPS custom-component visibility', () => {
  it('shows the administrative devices page only with account read permission', () => {
    const canGet = vi.fn((prefix: string) => prefix === 'sysAccount');

    expect(isLinkVisible(schema, 'CustomComponent/XapsDevices', 'community', canGet)).toBe(true);
    expect(canGet).toHaveBeenCalledWith('sysAccount');
  });

  it('hides the administrative devices page without account read permission', () => {
    expect(isLinkVisible(schema, 'CustomComponent/XapsDevices', 'community', () => false)).toBe(false);
  });

  it('keeps the self-service devices page visible without administrative permissions', () => {
    expect(isLinkVisible(schema, 'CustomComponent/XapsMyDevices', 'community', () => false)).toBe(true);
  });
});

describe('XAPS settings visibility', () => {
  const xapsSchema: Schema = {
    ...schema,
    objects: {
      'x:Xaps': {
        type: 'singleton',
        description: 'Apple Push settings',
        permissionPrefix: 'sysXaps',
      },
    },
  };

  it('shows XAPS settings with XAPS read permission', () => {
    expect(isLinkVisible(xapsSchema, 'x:Xaps', 'community', (prefix) => prefix === 'sysXaps')).toBe(true);
  });

  it('hides XAPS settings without XAPS read permission', () => {
    expect(isLinkVisible(xapsSchema, 'x:Xaps', 'community', () => false)).toBe(false);
  });
});
