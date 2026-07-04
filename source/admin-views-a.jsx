// admin-views-a.jsx — Dashboard, Visits, Sites, Site detail.
// Each view is a component taking { go, params }. `go(view, params)` navigates.

const VIZ_TONE = { high: C.green, moderate: C.amber, low: C.red };

function atrophyTone(a) { return a >= 55 ? C.red : a >= 38 ? C.amber : C.green; }

// Small horizontal meter (atrophy / progress).
function Meter({ value, tone, width = 96 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width, height: 6, borderRadius: 99, background: C.ruleSoft, overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', background: tone, borderRadius: 99 }} />
      </div>
      <span style={{ ...mono, fontSize: 11.5, fontWeight: 700, color: tone }}>{value}</span>
    </div>
  );
}

// Signal mix pips (pos / weak / barrier).
function SignalMix({ s }) {
  if (!s) return <span style={{ color: C.inkMuted, ...mono, fontSize: 12 }}>—</span>;
  const parts = [[s.pos, C.green], [s.weak, C.amber], [s.barrier, C.red]];
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
      {parts.map(([n, hue], i) => (
        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, ...mono, fontSize: 12, fontWeight: 700, color: n ? hue : C.inkMuted }}>
          <Dot tone={n ? hue : C.rule} size={7} />{n}
        </span>
      ))}
    </div>
  );
}

function LiveVisitCard({ v, go }) {
  return (
    <div style={{ background: C.ink, borderRadius: R.xl, padding: 20, color: '#fff', boxShadow: SH.card }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Dot tone={C.green} size={8} pulse />
        <span style={{ ...mono, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: C.green }}>Live on site</span>
        <span style={{ ...mono, fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.55)', marginLeft: 'auto' }}>{v.elapsed}</span>
      </div>
      <div style={{ ...sans, fontSize: 20, fontWeight: 700, letterSpacing: -0.4 }}>{v.site}</div>
      <div style={{ ...sans, fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 3, fontWeight: 500 }}>{v.visitor} · {v.region}</div>
      <div style={{ display: 'flex', gap: 26, marginTop: 18, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div><div style={{ ...sans, fontSize: 22, fontWeight: 700 }}>{v.obs}</div><div style={{ ...mono, fontSize: 9.5, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginTop: 3 }}>Observations</div></div>
        <div style={{ flex: 1 }}><div style={{ marginTop: 2 }}><SignalMix s={v.signals} /></div><div style={{ ...mono, fontSize: 9.5, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginTop: 7 }}>Signal mix</div></div>
        <button onClick={() => go('visits')} className="a-btn" style={{ ...sans, alignSelf: 'center', height: 38, padding: '0 16px', borderRadius: R.md, background: C.hi, color: C.hiInk, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>Open visit <Ico name="arrow_forward" size={16} /></button>
      </div>
    </div>
  );
}

// Compact attention row used on the dashboard.
function AttnRow({ icon, hue, title, meta, onClick, last }) {
  return (
    <div className="a-row" onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 0', borderBottom: last ? 'none' : `1px solid ${C.ruleSoft}`, cursor: 'pointer' }}>
      <div style={{ width: 34, height: 34, borderRadius: R.md, background: softTone(hue), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Ico name={icon} size={17} color={hue} /></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ ...sans, fontSize: 13.5, fontWeight: 600, color: C.ink, lineHeight: 1.35 }}>{title}</div>
        <div style={{ ...sans, fontSize: 12, color: C.inkSoft, marginTop: 2, fontWeight: 500 }}>{meta}</div>
      </div>
      <Ico name="chevron_right" size={18} color={C.inkMuted} />
    </div>
  );
}

// ══ DASHBOARD ═════════════════════════════════════════════════
function Dashboard({ go }) {
  const live = VISITS.find((v) => v.state === 'live');
  const upcoming = VISITS.filter((v) => v.state === 'upcoming').slice(0, 3);
  const review = INSIGHTS.filter((i) => i.status === 'review');
  const recentObs = OBSERVATIONS.slice(0, 5);
  return (
    <div>
      <PageHead title={`Good morning, ${CURRENT_USER.name.split(' ')[0]}`} sub="Pilbara region · 7 worksites · 1 visit live now. Here’s what needs you today." />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <Stat label="Visits this week" value="4" sub="1 live · 3 planned" icon="event" />
        <Stat label="Open insights" value="12" sub="4 awaiting your support" icon="auto_awesome" accent />
        <Stat label="Observations · 7d" value="47" delta="+18%" icon="visibility" />
        <Stat label="Sites at risk" value="2" unit="of 7" sub="Coolinga · Jewell" icon="warning" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: 16, marginBottom: 16 }}>
        <Card pad={20}>
          <Eyebrow right={<button onClick={() => go('insights')} className="a-link" style={{ ...mono, fontSize: 11, fontWeight: 700, color: C.inkSoft, background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 0.6 }}>View all</button>}>Needs your attention</Eyebrow>
          <AttnRow icon="auto_awesome" hue={C.hiInk} title="Hiviz routed a heat-plan pattern to your pipeline" meta="4 observations · 3 sites · 18m ago" onClick={() => go('insights')} />
          {review.map((i, idx) => (
            <AttnRow key={i.id} icon="flag" hue={C.amber} title={i.title} meta={`${i.obs} observations · ${i.sites.length} site${i.sites.length > 1 ? 's' : ''} · ${i.updated}`} onClick={() => go('insights', { id: i.id })} />
          ))}
          <AttnRow icon="warning" hue={C.red} title="IM-118 corrective action overdue at Northgate" meta="Unassigned at site level · 3 weeks" onClick={() => go('site', { id: 's1' })} last />
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {live && <LiveVisitCard v={live} go={go} />}
          <Card pad={18}>
            <Eyebrow>Upcoming visits</Eyebrow>
            {upcoming.map((v, i) => (
              <div key={v.id} className="a-row" onClick={() => go('visits')} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: i === upcoming.length - 1 ? 'none' : `1px solid ${C.ruleSoft}`, cursor: 'pointer' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ ...sans, fontSize: 13.5, fontWeight: 600 }}>{v.site}</div>
                  <div style={{ ...sans, fontSize: 12, color: C.inkSoft, marginTop: 2, fontWeight: 500 }}>{v.when}</div>
                </div>
                {v.briefing === 'ready' ? <SChip hue={C.green}>Briefed</SChip> : <SChip hue={C.amber}>Pending</SChip>}
              </div>
            ))}
          </Card>
        </div>
      </div>

      <Eyebrow right={<button onClick={() => go('observations')} className="a-link" style={{ ...mono, fontSize: 11, fontWeight: 700, color: C.inkSoft, background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 0.6 }}>All observations</button>}>Latest field observations</Eyebrow>
      <ObsTable rows={recentObs} go={go} />
    </div>
  );
}

// Shared observations table (also used on the Observations page).
function ObsTable({ rows, go }) {
  const cols = [
    { key: 'when', label: 'When', w: 110, mono: true, render: (r) => <span style={{ color: C.inkSoft }}>{r.when}</span> },
    { key: 'site', label: 'Site', w: 180, render: (r) => <span style={{ fontWeight: 600 }}>{r.site}</span> },
    { key: 'summary', label: 'Observation', render: (r) => <span style={{ display: 'block', maxWidth: 460, color: C.ink, fontWeight: 500, lineHeight: 1.4 }}>{r.summary}</span> },
    { key: 'observer', label: 'Observer', w: 130, render: (r) => <span style={{ color: C.inkSoft }}>{r.observer}</span> },
    { key: 'signal', label: 'Signal', w: 120, render: (r) => { const s = OBS_SIGNAL[r.signal]; return <SChip hue={s.hue}>{s.label}</SChip>; } },
  ];
  return <DataTable columns={cols} rows={rows} onRow={(r) => go('observations', { id: r.id })} />;
}

// ══ VISITS ════════════════════════════════════════════════════
function Visits({ go }) {
  const [tab, setTab] = React.useState('active');
  const counts = { active: VISITS.filter((v) => v.state === 'live').length, upcoming: VISITS.filter((v) => v.state === 'upcoming').length, past: VISITS.filter((v) => v.state === 'past').length };
  const live = VISITS.find((v) => v.state === 'live');
  const upcoming = VISITS.filter((v) => v.state === 'upcoming');
  const past = VISITS.filter((v) => v.state === 'past');

  const upcomingCols = [
    { key: 'site', label: 'Site', render: (r) => <span style={{ fontWeight: 600 }}>{r.site}</span> },
    { key: 'region', label: 'Region', w: 150, render: (r) => <span style={{ color: C.inkSoft }}>{r.region}</span> },
    { key: 'visitor', label: 'Visitor', w: 160, render: (r) => <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Avatar name={r.visitor} size={24} /> {r.visitor}</span> },
    { key: 'when', label: 'When', w: 180, mono: true, render: (r) => <span style={{ color: C.inkSoft }}>{r.when}</span> },
    { key: 'briefing', label: 'Briefing', w: 120, render: (r) => r.briefing === 'ready' ? <SChip hue={C.green} icon="check">Ready</SChip> : <SChip hue={C.amber}>Pending</SChip> },
  ];
  const pastCols = [
    { key: 'site', label: 'Site', render: (r) => <span style={{ fontWeight: 600 }}>{r.site}</span> },
    { key: 'visitor', label: 'Visitor', w: 160, render: (r) => <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Avatar name={r.visitor} size={24} /> {r.visitor}</span> },
    { key: 'when', label: 'When', w: 130, mono: true, render: (r) => <span style={{ color: C.inkSoft }}>{r.when}</span> },
    { key: 'obs', label: 'Obs', w: 70, align: 'left', mono: true, render: (r) => <span style={{ fontWeight: 700 }}>{r.obs}</span> },
    { key: 'signals', label: 'Signal mix', w: 150, render: (r) => <SignalMix s={r.signals} /> },
    { key: 'outcome', label: '', w: 150, render: (r) => r.ledToInsight ? <SChip hue={C.hiInk} icon="auto_awesome">Led to insight</SChip> : null },
  ];

  return (
    <div>
      <PageHead title="Visits" sub="Plan, brief and review site visits across the region." actions={<><Btn variant="ghost" icon="download">Export</Btn><Btn variant="accent" icon="add">Plan a visit</Btn></>} />
      <Tabs value={tab} onChange={setTab} items={[{ k: 'active', label: 'Active', n: counts.active }, { k: 'upcoming', label: 'Upcoming', n: counts.upcoming }, { k: 'past', label: 'Past', n: 24 }]} />

      {tab === 'active' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {live && <LiveVisitCard v={live} go={go} />}
          <Card pad={20} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Eyebrow>Next up</Eyebrow>
            <div style={{ ...sans, fontSize: 17, fontWeight: 700 }}>{upcoming[0].site}</div>
            <div style={{ ...sans, fontSize: 13, color: C.inkSoft, marginTop: 3, fontWeight: 500 }}>{upcoming[0].when} · {upcoming[0].region}</div>
            <div style={{ marginTop: 14 }}><Btn variant="ghost" size="sm" iconRight="arrow_forward">Review briefing</Btn></div>
          </Card>
        </div>
      )}
      {tab === 'upcoming' && <DataTable columns={upcomingCols} rows={upcoming} onRow={() => {}} />}
      {tab === 'past' && <DataTable columns={pastCols} rows={past} onRow={() => {}} />}
    </div>
  );
}

// ══ SITES ═════════════════════════════════════════════════════
function Sites({ go }) {
  const [filter, setFilter] = React.useState('all');
  const filtered = SITES.filter((s) => filter === 'all' || (filter === 'risk' && s.risk) || (filter === 'visit' && s.needsVisit) || (filter === 'live' && s.live));
  const cols = [
    { key: 'name', label: 'Site', render: (r) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        {r.live && <Dot tone={C.green} size={8} pulse />}
        <div><div style={{ fontWeight: 700, fontSize: 14 }}>{r.name}</div><div style={{ ...sans, fontSize: 12, color: C.inkSoft, marginTop: 1 }}>{r.region} · {r.type}</div></div>
      </div>
    ) },
    { key: 'viz', label: 'Visibility', w: 150, render: (r) => <SChip hue={VIZ_TONE[r.viz]}>{r.vizLabel}</SChip> },
    { key: 'lastVisit', label: 'Last visit', w: 120, mono: true, render: (r) => <span style={{ color: r.lastVisitDays > 20 ? C.red : C.inkSoft }}>{r.lastVisit}</span> },
    { key: 'insights', label: 'Open insights', w: 120, align: 'left', mono: true, render: (r) => <span style={{ fontWeight: 700 }}>{r.insights}</span> },
    { key: 'atrophy', label: 'Atrophy', w: 150, render: (r) => <Meter value={r.atrophy} tone={atrophyTone(r.atrophy)} /> },
    { key: 'go', label: '', w: 44, align: 'right', render: () => <Ico name="chevron_right" size={18} color={C.inkMuted} /> },
  ];
  return (
    <div>
      <PageHead title="Sites" sub="Every worksite in the region, with its current visibility and open work." actions={<Btn variant="ghost" icon="map">Map view</Btn>} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 16 }}>
        <Pills value={filter} onChange={setFilter} items={[{ k: 'all', label: 'All', n: SITES.length }, { k: 'live', label: 'On site now', n: 1 }, { k: 'risk', label: 'At risk', n: 2 }, { k: 'visit', label: 'Needs a visit', n: 2 }]} />
        <Search placeholder="Search sites" width={240} />
      </div>
      <DataTable columns={cols} rows={filtered} onRow={(r) => go('site', { id: r.id })} />
    </div>
  );
}

// ══ SITE DETAIL ═══════════════════════════════════════════════
function SiteDetail({ go, params }) {
  const s = SITES.find((x) => x.id === (params && params.id)) || SITES[0];
  const open = INSIGHTS.filter((i) => i.sites.includes(s.name)).slice(0, 3);
  const history = VISITS.filter((v) => v.site === s.name);
  const contacts = [
    { name: s.supervisor, role: 'Site supervisor', badge: 'Primary' },
    { name: 'K. Lee', role: 'Crew lead · day shift' },
    { name: 'P. Singh', role: 'HSE lead' },
  ];
  return (
    <div>
      <button onClick={() => go('sites')} className="a-link" style={{ ...mono, fontSize: 12, fontWeight: 700, color: C.inkSoft, background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.6 }}><Ico name="arrow_back" size={16} /> All sites</button>
      <PageHead title={s.name} sub={`${s.region} · ${s.type} · ${s.crew} crew`} actions={<><Btn variant="ghost" icon="tune">Configure</Btn><Btn variant="accent" icon="add">Plan a visit</Btn></>} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <Stat label="Visibility" value={s.vizLabel.split(' ')[0]} sub={s.live ? 'On site now' : s.lastVisit} icon="visibility" />
        <Stat label="Observations" value={s.observations} sub="All time" icon="forum" />
        <Stat label="Open insights" value={s.insights} sub="Across this site" icon="auto_awesome" />
        <Stat label="Atrophy" value={s.atrophy} unit="/ 100" sub={s.atrophy >= 55 ? 'Climbing — needs a visit' : 'Within range'} icon="trending_up" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {s.risk && <AINote>Atrophy is climbing at {s.name} and the last visit was {s.lastVisit.toLowerCase()}. {open.length} open insight{open.length > 1 ? 's' : ''} reference this site — worth pointing your next visit here.</AINote>}
          <Card pad={20}>
            <Eyebrow>Open insights · {open.length}</Eyebrow>
            {open.map((i, idx) => (
              <AttnRow key={i.id} icon="auto_awesome" hue={i.status === 'action' ? C.hiInk : C.amber} title={i.title} meta={`${i.id} · ${i.obs} observations · ${i.updated}`} onClick={() => go('insights', { id: i.id })} last={idx === open.length - 1} />
            ))}
          </Card>
          <Card pad={20}>
            <Eyebrow>Visit history · {history.length}</Eyebrow>
            {history.map((v, i) => (
              <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: i === history.length - 1 ? 'none' : `1px solid ${C.ruleSoft}` }}>
                <Avatar name={v.visitor} size={28} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ ...sans, fontSize: 13.5, fontWeight: 600 }}>{v.visitor}</div>
                  <div style={{ ...sans, fontSize: 12, color: C.inkSoft, marginTop: 1, fontWeight: 500 }}>{v.when}</div>
                </div>
                {v.state === 'live' ? <SChip hue={C.green} icon="circle">Live</SChip> : <span style={{ ...mono, fontSize: 12, fontWeight: 700, color: C.inkSoft }}>{v.obs} obs</span>}
              </div>
            ))}
          </Card>
        </div>

        <Card pad={20} style={{ alignSelf: 'flex-start' }}>
          <Eyebrow>Site contacts</Eyebrow>
          {contacts.map((c, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: i === contacts.length - 1 ? 'none' : `1px solid ${C.ruleSoft}` }}>
              <Avatar name={c.name} size={34} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ ...sans, fontSize: 13.5, fontWeight: 700 }}>{c.name}</div>
                <div style={{ ...sans, fontSize: 12, color: C.inkSoft, marginTop: 1, fontWeight: 500 }}>{c.role}</div>
              </div>
              {c.badge && <Badge tone="hi">{c.badge}</Badge>}
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

Object.assign(window, { Dashboard, Visits, Sites, SiteDetail, ObsTable, SignalMix, Meter, VIZ_TONE });
