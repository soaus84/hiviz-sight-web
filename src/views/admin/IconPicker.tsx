import { useState } from 'react';
import { colors } from '@/tokens';
import { Icon } from '@/components';

// Three separate curated sets rather than one shared pool — Safety
// practices is process/people vocabulary (audits, coaching, workshops),
// High-risk work is physical hazards/equipment/environment (drilling,
// heights, energised systems), and mixing them into one list makes every
// picker show a bunch of icons that don't fit that category. Drawn from the
// actual practice/high-risk-work lists provided, not exhaustively — one
// icon can obviously cover several similarly-themed entries.

export const WORKSITE_TYPE_ICONS: string[] = [
  'terrain', 'landscape', 'factory', 'warehouse', 'domain', 'foundation', 'local_shipping', 'conveyor_belt',
];

// 48 each, not ~28 — with 32 high-risk-work and 27 safety-practice items to
// cover, a set close to the item count leaves almost no room to pick a
// genuinely distinct icon per entry (see the seeded data in
// data/admin/taxonomies.ts, and the reuse it forced the first time this set
// was sized at 28).
export const HIGH_RISK_WORK_ICONS: string[] = [
  'height', 'stairs', 'construction', 'foundation', 'directions_car', 'local_shipping', 'precision_manufacturing',
  'bolt', 'electrical_services', 'propane_tank', 'local_fire_department', 'whatshot', 'explosion',
  'device_thermostat', 'air', 'coronavirus', 'masks', 'hearing', 'vibration', 'science',
  'water', 'traffic', 'warehouse', 'terrain', 'settings_remote', 'inventory_2', 'moving', 'conveyor_belt',
  'warning', 'dangerous', 'power', 'cable', 'gas_meter', 'co2', 'cyclone', 'landslide',
  'volcano', 'flood', 'water_damage', 'thunderstorm', 'ac_unit', 'speed', 'car_crash',
  'radar', 'satellite_alt', 'factory', 'oil_barrel', 'tsunami', 'domain',
];

export const SAFETY_PRACTICE_ICONS: string[] = [
  'fact_check', 'manage_search', 'groups', 'diversity_3', 'handshake', 'school', 'support_agent',
  'campaign', 'assignment_turned_in', 'rule', 'published_with_changes', 'emergency', 'account_tree',
  'link', 'bedtime', 'biotech', 'monitor_heart', 'design_services', 'psychology', 'payments',
  'forum', 'hub', 'description', 'bar_chart', 'shield_person', 'visibility', 'fence',
  'warning', 'report', 'checklist', 'task', 'verified', 'badge', 'workspace_premium',
  'record_voice_over', 'mic', 'event', 'calendar_month', 'timeline', 'insights', 'query_stats',
  'gavel', 'balance', 'favorite', 'self_improvement', 'diversity_1', 'supervisor_account', 'task_alt', 'rate_review',
];

export interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
  options: string[];
  /** icon name -> name of the other record already using it. Marked with a
   * dot rather than disabled — with 32 high-risk-work entries against 28
   * icons, some reuse is unavoidable, so blocking it outright would leave a
   * few entries unable to pick anything at all. */
  usedBy?: Record<string, string>;
}

export function IconPicker({ value, onChange, options, usedBy }: IconPickerProps) {
  const [search, setSearch] = useState('');
  const filtered = options.filter((name) => name.replace(/_/g, ' ').includes(search.toLowerCase()));

  return (
    <div>
      <input
        className="a-input"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search icons"
        style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: `1px solid ${colors.rule}`, fontFamily: 'var(--font-sans)', fontSize: 13.5, outline: 'none', marginBottom: 10 }}
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
        {filtered.map((name) => {
          const on = name === value;
          const usedByName = usedBy?.[name];
          const label = name.replace(/_/g, ' ');
          return (
            <button
              key={name}
              type="button"
              title={usedByName ? `${label} — already used by ${usedByName}` : label}
              onClick={() => onChange(on ? '' : name)}
              style={{ position: 'relative', width: 40, height: 40, borderRadius: 'var(--radius-md)', background: on ? colors.hi : colors.fill, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Icon name={name} size={19} color={on ? colors.hiInk : colors.inkSoft} />
              {usedByName && !on && (
                <span style={{ position: 'absolute', top: 3, right: 3, width: 7, height: 7, borderRadius: '50%', background: colors.amber, border: `1.5px solid ${colors.fill}` }} />
              )}
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1 / -1', fontFamily: 'var(--font-sans)', fontSize: 12.5, color: colors.inkMuted, padding: '8px 2px' }}>
            No icons match “{search}”.
          </div>
        )}
      </div>
    </div>
  );
}
