import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHead, Tabs } from '@/components';
import { WORKSITE_TYPES, HIGH_RISK_WORK, SAFETY_PRACTICES } from '@/data/admin/taxonomies';
import { addTag, updateTag, removeTag } from '@/data/admin/company';
import { TagList } from './TagList';
import type { TagRecord } from '@/types';

type TaxonomyTab = 'worksiteType' | 'highRiskWork' | 'safetyPractice';
const VALID_TABS: TaxonomyTab[] = ['worksiteType', 'highRiskWork', 'safetyPractice'];

const LISTS: Record<TaxonomyTab, { list: TagRecord[]; idPrefix: string; noun: string }> = {
  worksiteType: { list: WORKSITE_TYPES, idPrefix: 'wt', noun: 'worksite type' },
  highRiskWork: { list: HIGH_RISK_WORK, idPrefix: 'hrw', noun: 'high-risk work type' },
  safetyPractice: { list: SAFETY_PRACTICES, idPrefix: 'sp', noun: 'safety practice' },
};

/** Just tags used to help classify/direct things elsewhere — not wired into
 * any live filtering logic, so this list can be freely edited without
 * side effects (same reasoning as Company's Divisions/Regions). */
export function AdminTaxonomies() {
  const [params, setParams] = useSearchParams();
  const tabParam = params.get('tab');
  const tab = (VALID_TABS as string[]).includes(tabParam || '') ? (tabParam as TaxonomyTab) : 'worksiteType';
  const setTab = (k: string) => setParams(k === 'worksiteType' ? {} : { tab: k });

  const [, bump] = useState(0);
  const refresh = () => bump((n) => n + 1);

  const { list, idPrefix, noun } = LISTS[tab];

  return (
    <div>
      <PageHead title="Taxonomies" sub="Tags used to classify worksites, work types and safety practices across the app." />
      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { k: 'worksiteType', label: 'Worksite type', n: WORKSITE_TYPES.length },
          { k: 'highRiskWork', label: 'High-risk work', n: HIGH_RISK_WORK.length },
          { k: 'safetyPractice', label: 'Safety Practice', n: SAFETY_PRACTICES.length },
        ]}
      />
      <div style={{ marginTop: 20 }}>
        <TagList
          noun={noun}
          items={list}
          onAdd={(name, description) => { addTag(list, idPrefix, name, description); refresh(); }}
          onUpdate={(id, name, description) => { updateTag(list, id, name, description); refresh(); }}
          onDelete={(id) => { removeTag(list, id); refresh(); }}
        />
      </div>
    </div>
  );
}
