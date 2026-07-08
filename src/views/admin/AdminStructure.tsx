import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHead, Tabs } from '@/components';
import { ADMIN_DIVISIONS, ADMIN_SUBDIVISIONS, ADMIN_REGIONS, addTag, updateTag, removeTag } from '@/data/admin/company';
import { TagList } from './TagList';

type StructureTab = 'divisions' | 'subdivisions' | 'regions';
const VALID_TABS: StructureTab[] = ['divisions', 'subdivisions', 'regions'];

/** Divisions, subdivisions and regions used to live as tabs on Company —
 * split out once Subdivisions (a division's second level, aka "business
 * unit") made that page cover two unrelated concerns: company identity vs.
 * org hierarchy. */
export function AdminStructure() {
  const [params, setParams] = useSearchParams();
  const tabParam = params.get('tab');
  const tab = (VALID_TABS as string[]).includes(tabParam || '') ? (tabParam as StructureTab) : 'divisions';
  const setTab = (k: string) => setParams(k === 'divisions' ? {} : { tab: k });

  // Force a re-render after a TagList mutation — these are plain mutable
  // arrays, not React state (same reasoning as INSIGHTS elsewhere).
  const [, bump] = useState(0);
  const refresh = () => bump((n) => n + 1);

  const divisionOptions = ADMIN_DIVISIONS.map((d) => ({ value: d.id, label: d.name }));

  return (
    <div>
      <PageHead title="Structure" sub="Divisions, subdivisions and regions used to organise the company." />
      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { k: 'divisions', label: 'Divisions', n: ADMIN_DIVISIONS.length },
          { k: 'subdivisions', label: 'Subdivisions', n: ADMIN_SUBDIVISIONS.length },
          { k: 'regions', label: 'Regions', n: ADMIN_REGIONS.length },
        ]}
      />
      <div style={{ marginTop: 20 }}>
        {tab === 'divisions' && (
          <TagList
            noun="division"
            items={ADMIN_DIVISIONS}
            onAdd={(name, description) => { addTag(ADMIN_DIVISIONS, 'div', name, description); refresh(); }}
            onUpdate={(id, name, description) => { updateTag(ADMIN_DIVISIONS, id, name, description); refresh(); }}
            onDelete={(id) => { removeTag(ADMIN_DIVISIONS, id); refresh(); }}
          />
        )}
        {tab === 'subdivisions' && (
          <TagList
            noun="subdivision"
            items={ADMIN_SUBDIVISIONS}
            parent={{ noun: 'division', options: divisionOptions }}
            onAdd={(name, description, parentId) => { addTag(ADMIN_SUBDIVISIONS, 'sub', name, description, parentId); refresh(); }}
            onUpdate={(id, name, description, parentId) => { updateTag(ADMIN_SUBDIVISIONS, id, name, description, parentId); refresh(); }}
            onDelete={(id) => { removeTag(ADMIN_SUBDIVISIONS, id); refresh(); }}
          />
        )}
        {tab === 'regions' && (
          <TagList
            noun="region"
            items={ADMIN_REGIONS}
            onAdd={(name, description) => { addTag(ADMIN_REGIONS, 'reg', name, description); refresh(); }}
            onUpdate={(id, name, description) => { updateTag(ADMIN_REGIONS, id, name, description); refresh(); }}
            onDelete={(id) => { removeTag(ADMIN_REGIONS, id); refresh(); }}
          />
        )}
      </div>
    </div>
  );
}
