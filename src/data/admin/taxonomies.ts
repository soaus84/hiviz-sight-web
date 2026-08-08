import type { TagRecord } from '@/types';

// Tags used to help classify/direct things elsewhere in the product (site
// type, work type, practice references) — not wired into any live
// filtering logic here. Freely editable without side effects.
//
// HIGH_RISK_WORK and SAFETY_PRACTICES are the source of truth Communities'
// auto-generated HighRiskWork/SafetyPractice communities are built from —
// see data/communities.ts. Icons are assigned from IconPicker's curated
// sets (HIGH_RISK_WORK_ICONS / SAFETY_PRACTICE_ICONS, 48 each). Only the
// drilling entries (surface/RC/RAB-AC share `construction`, the two
// underground-drilling entries share `warehouse`) and the two surface-mining
// entries (`terrain`) reuse an icon — a deliberate, naturally-related
// clustering, not a scarcity workaround. Every other entry in both lists
// gets its own icon.

export const WORKSITE_TYPES: TagRecord[] = [
  { id: 'wt1', name: 'Open cut', description: 'Surface mining operations.' },
  { id: 'wt2', name: 'Underground', description: 'Underground mining operations.' },
  { id: 'wt3', name: 'Processing', description: 'Ore/mineral processing plants.' },
  { id: 'wt4', name: 'Logistics', description: 'Stockyards, haulage and transport.' },
];

export const HIGH_RISK_WORK: TagRecord[] = [
  { id: 'hrw1', name: 'Asbestos & respirable dust', description: 'Exposure to airborne asbestos fibres or fine particulate from cutting, crushing or drilling.', icon: 'masks' },
  { id: 'hrw2', name: 'Blast hole drilling', description: 'Drilling holes for explosive charge placement ahead of a blast.', icon: 'construction' },
  { id: 'hrw3', name: 'Confined spaces', description: 'Entry into a space not designed for continuous occupancy.', icon: 'inventory_2' },
  { id: 'hrw4', name: 'Critical lifts', description: "Lifts exceeding a crane's rated capacity threshold, or lifting over people or live plant.", icon: 'moving' },
  { id: 'hrw5', name: 'Diamond drilling — surface', description: 'Surface coring using a diamond-tipped rotary drill.', icon: 'construction' },
  { id: 'hrw6', name: 'Diamond drilling — underground', description: 'Underground coring using a diamond-tipped rotary drill.', icon: 'warehouse' },
  { id: 'hrw7', name: 'Driving heavy vehicles', description: 'Operating trucks, haul vehicles or other heavy road-registered plant.', icon: 'local_shipping' },
  { id: 'hrw8', name: 'Driving light vehicles', description: 'Operating cars, utes or other light vehicles on-site or between sites.', icon: 'directions_car' },
  { id: 'hrw9', name: 'Energised systems', description: 'Work on or near live electrical circuits or equipment.', icon: 'bolt' },
  { id: 'hrw10', name: 'Excavation', description: 'Ground-disturbance work below natural surface level.', icon: 'foundation' },
  { id: 'hrw11', name: 'Exploration drilling', description: 'Drilling to sample or define an ore body ahead of mining.', icon: 'landslide' },
  { id: 'hrw12', name: 'Explosives', description: 'Handling, transporting or detonating explosive charges.', icon: 'explosion' },
  { id: 'hrw13', name: 'Extremes of temperature', description: 'Work in conditions of significant heat or cold stress.', icon: 'device_thermostat' },
  { id: 'hrw14', name: 'Fixed plant', description: 'Work on or near stationary processing or production equipment.', icon: 'precision_manufacturing' },
  { id: 'hrw15', name: 'Flammable gas', description: 'Work involving or near gases that can ignite or explode.', icon: 'propane_tank' },
  { id: 'hrw16', name: 'Hazardous atmospheres', description: 'Atmospheres with insufficient oxygen or harmful airborne contaminants.', icon: 'air' },
  { id: 'hrw17', name: 'Hazardous noise & vibration', description: 'Exposure to noise or vibration levels above safe thresholds.', icon: 'hearing' },
  { id: 'hrw18', name: 'Hazardous substances', description: 'Handling chemicals or materials with a health or environmental risk.', icon: 'science' },
  { id: 'hrw19', name: 'Heavy vehicle maintenance', description: 'Servicing or repairing trucks and other heavy mobile plant.', icon: 'oil_barrel' },
  { id: 'hrw20', name: 'Hot work', description: 'Welding, cutting, grinding or other ignition-source work.', icon: 'local_fire_department' },
  { id: 'hrw21', name: 'In or near water', description: 'Work at risk of drowning or immersion, including over or beside water.', icon: 'water' },
  { id: 'hrw22', name: 'Lifting operations', description: 'Mechanical lifting using cranes, hoists or other lifting equipment.', icon: 'cable' },
  { id: 'hrw23', name: 'Live traffic', description: 'Work within or adjacent to an active traffic route.', icon: 'traffic' },
  { id: 'hrw24', name: 'Mobile plant', description: 'Work in proximity to moving mobile plant or vehicles.', icon: 'conveyor_belt' },
  { id: 'hrw25', name: 'Pressurised systems', description: 'Work on or near vessels or lines holding pressurised gas or liquid.', icon: 'gas_meter' },
  { id: 'hrw26', name: 'RAB / AC drilling — surface', description: 'Surface percussion drilling using rotary air blast or air-core methods.', icon: 'terrain' },
  { id: 'hrw27', name: 'RC drilling — surface', description: 'Surface reverse-circulation drilling.', icon: 'construction' },
  { id: 'hrw28', name: 'Surface mining', description: 'Extraction work at an open-cut or surface mining operation.', icon: 'terrain' },
  { id: 'hrw29', name: 'Teleremote operations', description: 'Operating plant or equipment remotely rather than from the cab.', icon: 'settings_remote' },
  { id: 'hrw30', name: 'Underground jumbo / long hole drilling', description: 'Underground drilling using a jumbo rig or long-hole methods.', icon: 'warehouse' },
  { id: 'hrw31', name: 'Underground mining', description: 'Extraction work at an underground mining operation.', icon: 'stairs' },
  { id: 'hrw32', name: 'Work at heights', description: 'Any task performed above 1.8m with a fall risk.', icon: 'height' },
];

export const SAFETY_PRACTICES: TagRecord[] = [
  { id: 'sp1', name: 'Auditing', description: 'Independent checks against a defined safety standard or procedure.', icon: 'fact_check' },
  { id: 'sp2', name: 'Incident investigation', description: 'Establishing the causes and contributing factors behind an incident.', icon: 'manage_search' },
  { id: 'sp3', name: 'Learning team facilitation', description: 'Facilitated group review of an event to surface systemic learnings.', icon: 'forum' },
  { id: 'sp4', name: 'Contractor management', description: 'Verifying and overseeing contractor safety performance and compliance.', icon: 'handshake' },
  { id: 'sp5', name: 'Workplace training & assessment', description: 'Delivering and assessing competency-based safety training.', icon: 'school' },
  { id: 'sp6', name: 'Coaching', description: "One-on-one guidance to build a person's safety capability or judgement.", icon: 'support_agent' },
  { id: 'sp7', name: 'Senior leadership engagement', description: 'Visible leadership involvement in frontline safety conversations.', icon: 'campaign' },
  { id: 'sp8', name: 'Permit to work', description: 'A formal authorisation process for higher-risk tasks.', icon: 'assignment_turned_in' },
  { id: 'sp9', name: 'Risk assessment', description: 'Identifying hazards and evaluating the risk of a task before it starts.', icon: 'rule' },
  { id: 'sp10', name: 'Management of change', description: 'Formal review of the safety impact of a planned change.', icon: 'published_with_changes' },
  { id: 'sp11', name: 'Emergency response', description: 'Planning and capability for responding to on-site emergencies.', icon: 'emergency' },
  { id: 'sp12', name: 'Management systems', description: 'The documented framework of policies and processes governing safety.', icon: 'account_tree' },
  { id: 'sp13', name: 'Chain of responsibility', description: 'Accountability for safety obligations across a supply or transport chain.', icon: 'link' },
  { id: 'sp14', name: 'Fatigue management', description: 'Controls to identify and manage worker fatigue risk.', icon: 'bedtime' },
  { id: 'sp15', name: 'Drug and alcohol testing', description: 'Testing programs to detect impairment from drugs or alcohol.', icon: 'biotech' },
  { id: 'sp16', name: 'Health surveillance', description: 'Ongoing monitoring of worker health for exposure-related risks.', icon: 'monitor_heart' },
  { id: 'sp17', name: 'Safety in design', description: 'Designing out hazards during the design phase of plant, equipment or work.', icon: 'design_services' },
  { id: 'sp18', name: 'Human factors', description: 'How human capability and limitation shape safe or unsafe outcomes.', icon: 'psychology' },
  { id: 'sp19', name: 'Psychosocial risk', description: 'Workplace factors that risk psychological harm, such as stress or bullying.', icon: 'groups' },
  { id: 'sp20', name: 'Workers compensation', description: 'Managing claims and support for workers injured on the job.', icon: 'payments' },
  { id: 'sp21', name: 'Workshop facilitation', description: 'Structured group sessions to work through a safety topic or problem.', icon: 'diversity_3' },
  { id: 'sp22', name: 'Risk bowtie development', description: 'Mapping the causes, controls and consequences of a risk on a bowtie diagram.', icon: 'hub' },
  { id: 'sp23', name: 'Work procedure development', description: 'Writing the documented steps for carrying out a task safely.', icon: 'description' },
  { id: 'sp24', name: 'Reporting and data analysis', description: 'Analysing safety data to identify trends and priorities.', icon: 'bar_chart' },
  { id: 'sp25', name: 'Critical risk control', description: "Verifying the controls in place for an organisation's critical risks.", icon: 'shield_person' },
  { id: 'sp26', name: 'Work observation', description: "Direct observation of work as it's being performed.", icon: 'visibility' },
  { id: 'sp27', name: 'Guarding and barricading', description: 'Physical guarding or barricades to prevent access to a hazard.', icon: 'fence' },
];
