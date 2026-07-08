import type { TagRecord } from '@/types';

// Tags used to help classify/direct things elsewhere in the product (site
// type, work type, practice references) — not wired into any live
// filtering logic here. Freely editable without side effects.

export const WORKSITE_TYPES: TagRecord[] = [
  { id: 'wt1', name: 'Open cut', description: 'Surface mining operations.' },
  { id: 'wt2', name: 'Underground', description: 'Underground mining operations.' },
  { id: 'wt3', name: 'Processing', description: 'Ore/mineral processing plants.' },
  { id: 'wt4', name: 'Logistics', description: 'Stockyards, haulage and transport.' },
];

export const HIGH_RISK_WORK: TagRecord[] = [
  { id: 'hrw1', name: 'Working at heights', description: 'Any task performed above 1.8m with a fall risk.' },
  { id: 'hrw2', name: 'Confined space entry', description: 'Entry into a space not designed for continuous occupancy.' },
  { id: 'hrw3', name: 'Hot work', description: 'Welding, cutting, grinding or other ignition-source work.' },
  { id: 'hrw4', name: 'Excavation', description: 'Ground-disturbance work below natural surface level.' },
  { id: 'hrw5', name: 'Mobile plant interaction', description: 'Work in proximity to moving mobile plant or vehicles.' },
];

export const SAFETY_PRACTICES: TagRecord[] = [
  { id: 'sp1', name: 'Stop-work authority', description: "Any worker's authority to halt work they judge unsafe." },
  { id: 'sp2', name: 'Pre-start inspection', description: 'Checks completed before starting a task or shift.' },
  { id: 'sp3', name: 'Exclusion zone control', description: 'Maintaining and respecting marked exclusion boundaries.' },
  { id: 'sp4', name: 'Toolbox talk', description: 'Short pre-shift safety briefing delivered to a crew.' },
];
