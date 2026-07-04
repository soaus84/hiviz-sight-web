// admin-views-b.jsx — Observations, Insights, Communities, Settings (+ users).

// ── Slide-in drawer ───────────────────────────────────────────
function Drawer({ open, onClose, children, width = 460 }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(10,10,10,0.34)', zIndex: 60, display: 'flex', justifyContent: 'flex-end' }}>
      <div onClick={(e) => e.stopPropagation()} className="a-drawer" style={{ width, maxWidth: '92vw', height: '100%', background: C.panel, boxShadow: SH.pop, display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  );
}

function Fact({ k, v, last }) {
  return (
    <div style={{ display: 'flex', gap: 14, padding: '11px 0', borderBottom: last ? 'none' : `1px solid ${C.ruleSoft}` }}>
      <div style={{ ...mono, fontSize: 10, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: C.inkMuted, width: 110, flexShrink: 0, paddingTop: 1 }}>{k}</div>
      <div style={{ ...sans, flex: 1, fontSize: 13.5, fontWeight: 600, lineHeight: 1.4, color: C.ink }}>{v}</div>
    </div>
  );
}

// ══ OBSERVATIONS ══════════════════════════════════════════════
function Observations({ go, params }) {
  const [site, setSite] = React.useState('all');
  const [signal, setSignal] = React.useState('all');
  const [sel, setSel] = React.useState(null);
  React.useEffect(() => { if (params && params.id) { const o = OBSERVATIONS.find((x) => x.id === params.id); if (o) setSel(o); } }, [params]);
  const siteNames = ['all', ...Array.from(new Set(OBSERVATIONS.map((o) => o.site)))];
  const rows = OBSERVATIONS.filter((o) => (site === 'all' || o.site === site) && (signal === 'all' || o.signal === signal));

  const STATUS_LABEL = { enriched: ['Enriched', C.hiInk], classified: ['Classified', C.green], linked: ['Linked to insight', C.blue] };
  const cols = [
    { key: 'id', label: 'ID', w: 96, mono: true, render: (r) => <span style={{ color: C.inkSoft, fontWeight: 700 }}>{r.id}</span> },
    { key: 'when', label: 'When', w: 104, mono: true, render: (r) => <span style={{ color: C.inkSoft }}>{r.when}</span> },
    { key: 'site', label: 'Site', w: 170, render: (r) => <span style={{ fontWeight: 600 }}>{r.site}</span> },
    { key: 'summary', label: 'Observation', render: (r) => <span style={{ display: 'block', maxWidth: 420, lineHeight: 1.4, fontWeight: 500 }}>{r.summary}</span> },
    { key: 'signal', label: 'Signal', w: 116, render: (r) => { const s = OBS_SIGNAL[r.signal]; return <SChip hue={s.hue}>{s.label}</SChip>; } },
    { key: 'energy', label: 'Energy', w: 110, mono: true, render: (r) => <span style={{ color: C.inkSoft, fontSize: 12 }}>{r.energy}</span> },
    { key: 'status', label: 'Status', w: 150, render: (r) => { const [l, h] = STATUS_LABEL[r.status]; return <SChip hue={h}>{l}</SChip>; } },
  ];

  return (
    <div>
      <PageHead title="Observations" sub="The full stream of field captures across every site. Filter, review and follow the ones that connect into a pattern." actions={<Btn variant="ghost" icon="download">Export CSV</Btn>} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <Pills value={signal} onChange={setSignal} items={[{ k: 'all', label: 'All signals' }, { k: 'barrier', label: 'Barriers' }, { k: 'weak', label: 'Weak' }, { k: 'positive', label: 'Positive' }]} />
        </div>
        <Search placeholder="Search observations" width={260} />
      </div>
      <DataTable columns={cols} rows={rows} onRow={(r) => setSel(r)} empty="No observations match these filters." />

      <Drawer open={!!sel} onClose={() => setSel(null)}>
        {sel && <ObsDetail o={sel} onClose={() => setSel(null)} go={go} />}
      </Drawer>
    </div>
  );
}

function ObsDetail({ o, onClose, go }) {
  const s = OBS_SIGNAL[o.signal];
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 22px', borderBottom: `1px solid ${C.rule}` }}>
        <SChip hue={s.hue}>{s.label}</SChip>
        <span style={{ ...mono, fontSize: 12, fontWeight: 700, color: C.inkSoft }}>{o.id}</span>
        <button onClick={onClose} className="a-iconbtn" style={{ marginLeft: 'auto', width: 34, height: 34, borderRadius: R.md, border: 'none', background: C.fill, color: C.inkSoft, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ico name="close" size={18} /></button>
      </div>
      <div className="a-scroll" style={{ flex: 1, overflowY: 'auto', padding: 22 }}>
        <div style={{ ...sans, fontSize: 19, fontWeight: 700, letterSpacing: -0.3, lineHeight: 1.3 }}>{o.summary}</div>
        <div style={{ ...sans, fontSize: 13, color: C.inkSoft, marginTop: 8, fontWeight: 500 }}>{o.site} · {o.when}</div>

        <div style={{ marginTop: 18 }}>
          <AINote title="Hiviz classification">
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 9 }}>
              <SChip hue={C.ink}>{o.energy}</SChip>
              {o.signal === 'barrier' && <SChip hue={C.red}>barrier_absent</SChip>}
              {o.signal === 'weak' && <SChip hue={C.amber}>barrier_degraded</SChip>}
              {o.signal === 'positive' && <SChip hue={C.green}>control_working</SChip>}
            </div>
            {o.signal === 'barrier' ? 'A live barrier failure — high confidence. This is checked against other sites the moment it’s submitted.' : o.signal === 'positive' ? 'A control working as designed — captured as a positive to reinforce.' : 'An early signal worth watching — flagged for pattern matching across the region.'}
          </AINote>
        </div>

        <div style={{ ...mono, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: C.inkSoft, margin: '22px 0 8px' }}>Detail</div>
        <Card pad={16}>
          <Fact k="Reported by" v={o.observer} />
          <Fact k="Site" v={o.site} />
          <Fact k="When" v={o.when} />
          <Fact k="Energy" v={o.energy} />
          <Fact k="Status" v={o.status === 'linked' ? 'Linked to an active insight' : o.status === 'enriched' ? 'Enriched by Hiviz' : 'Classified'} last />
        </Card>

        {o.status === 'linked' && (
          <div style={{ marginTop: 16 }}>
            <Btn variant="ghost" full iconRight="arrow_forward" onClick={() => { onClose(); go('insights'); }}>View the linked insight</Btn>
          </div>
        )}
      </div>
    </>
  );
}

// ══ INSIGHTS (master-detail) ══════════════════════════════════
function Insights({ go, params }) {
  const [tab, setTab] = React.useState('review');
  const counts = { review: INSIGHTS.filter((i) => i.status === 'review').length, action: INSIGHTS.filter((i) => i.status === 'action').length, closed: INSIGHTS.filter((i) => i.status === 'closed').length };
  const list = INSIGHTS.filter((i) => i.status === tab);
  const initial = (params && params.id && INSIGHTS.find((i) => i.id === params.id)) || list[0];
  const [selId, setSelId] = React.useState(initial ? initial.id : null);
  React.useEffect(() => { if (params && params.id) { const m = INSIGHTS.find((i) => i.id === params.id); if (m) { setTab(m.status); setSelId(m.id); } } }, [params]);
  React.useEffect(() => { if (!list.find((i) => i.id === selId)) setSelId(list[0] ? list[0].id : null); }, [tab]);
  const sel = INSIGHTS.find((i) => i.id === selId);

  const STATUS = { review: ['Awaiting support', C.amber], action: ['In action', C.hiInk], closed: ['Closed', C.green] };

  return (
    <div>
      <PageHead title="Insights" sub="Cross-site patterns Hiviz has surfaced from the field. Review, support and route them to action." actions={<Btn variant="ghost" icon="download">Report</Btn>} />
      <Tabs value={tab} onChange={setTab} items={[{ k: 'review', label: 'For review', n: counts.review }, { k: 'action', label: 'In action', n: counts.action }, { k: 'closed', label: 'Closed', n: counts.closed }]} />

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 16, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {list.map((i) => {
            const on = i.id === selId; const [sl, sh] = STATUS[i.status];
            return (
              <div key={i.id} onClick={() => setSelId(i.id)} className="a-card-int" style={{ background: C.panel, border: `1px solid ${on ? C.ink : C.rule}`, borderRadius: R.lg, padding: 15, cursor: 'pointer', boxShadow: on ? SH.rail : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}>
                  <SChip hue={sh}>{sl}</SChip>
                  <span style={{ ...mono, fontSize: 10, fontWeight: 700, color: C.inkMuted, marginLeft: 'auto', textTransform: 'uppercase', letterSpacing: 0.5 }}>{i.theme}</span>
                </div>
                <div style={{ ...sans, fontSize: 14.5, fontWeight: 700, letterSpacing: -0.2, lineHeight: 1.3 }}>{i.title}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 11 }}>
                  <div style={{ display: 'flex' }}>{i.supporters.slice(0, 3).map((sp, k) => <div key={k} style={{ marginLeft: k ? -7 : 0 }}><Avatar name={sp} size={22} ring /></div>)}</div>
                  <span style={{ ...mono, fontSize: 11, color: C.inkSoft, fontWeight: 600 }}>{i.obs} obs · {i.sites.length} site{i.sites.length > 1 ? 's' : ''}</span>
                  {i.routed && <span style={{ marginLeft: 'auto' }}><Ico name="auto_awesome" size={15} color={C.hiInk} fill={1} /></span>}
                </div>
              </div>
            );
          })}
        </div>

        {sel && <InsightDetail i={sel} go={go} />}
      </div>
    </div>
  );
}

function InsightDetail({ i, go }) {
  const full = i.id === 'INS-2204' ? INSIGHT_DETAIL : null;
  const srcObs = full ? full.sourceObs : OBSERVATIONS.filter((o) => i.sites.includes(o.site)).slice(0, 3).map((o) => ({ q: o.summary, site: o.site, ago: o.when }));
  const STATUS = { review: ['Awaiting support', C.amber], action: ['In action', C.hiInk], closed: ['Closed', C.green] };
  const [sl, sh] = STATUS[i.status];
  return (
    <Card pad={24}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <SChip hue={sh}>{sl}</SChip>
        <span style={{ ...mono, fontSize: 11.5, fontWeight: 700, color: C.inkSoft }}>{i.id}</span>
        <span style={{ ...mono, fontSize: 11, fontWeight: 700, color: C.inkMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>· {i.sites.length > 1 ? 'Cross-site pattern' : 'Site pattern'}</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {i.status === 'review' && <Btn variant="primary" size="sm" icon="check">Support for action</Btn>}
          {i.status === 'action' && <Btn variant="ghost" size="sm" icon="person_add">Assign owner</Btn>}
        </div>
      </div>
      <h2 style={{ ...sans, margin: 0, fontSize: 23, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1.2 }}>{i.title}</h2>
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 12 }}>
        {i.sites.map((s, k) => <SChip key={k} hue={C.inkSoft} icon="place">{s}</SChip>)}
      </div>

      {i.routed && <div style={{ marginTop: 18 }}><AINote title="Hiviz routed to pipeline">Routed automatically — {i.obs} unwanted energy events across {i.sites.length} sites in 14 days. Barrier assessment flagged degradation on most observations.</AINote></div>}

      <div style={{ ...mono, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: C.inkSoft, margin: '22px 0 10px' }}>Pattern summary</div>
      <Card pad={16} style={{ boxShadow: 'none', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}><Dot tone={C.hi} size={6} /><span style={{ ...mono, fontSize: 9.5, fontWeight: 700, letterSpacing: 0.9, textTransform: 'uppercase', color: C.inkSoft }}>AI has suggested</span></div>
        <div style={{ ...sans, fontSize: 14, lineHeight: 1.55, fontWeight: 500 }}>{full ? full.suggested : i.summary}</div>
        {full && <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.ruleSoft}`, ...sans, fontSize: 12.5, fontStyle: 'italic', color: C.inkSoft, lineHeight: 1.45 }}>{full.suggestedBasis}</div>}
      </Card>
      {i.cause && (
        <Card pad={16} style={{ boxShadow: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}><Dot tone={C.hi} size={6} /><span style={{ ...mono, fontSize: 9.5, fontWeight: 700, letterSpacing: 0.9, textTransform: 'uppercase', color: C.inkSoft }}>Likely systemic cause</span></div>
          <div style={{ ...sans, fontSize: 14, lineHeight: 1.55, fontWeight: 500 }}>{i.cause}</div>
          {full && <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.ruleSoft}`, ...sans, fontSize: 12.5, fontStyle: 'italic', color: C.inkSoft, lineHeight: 1.45 }}>{full.causeBasis}</div>}
        </Card>
      )}

      <div style={{ ...mono, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: C.inkSoft, margin: '22px 0 10px' }}>Energy classification</div>
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
        {i.energy.map((e, k) => <SChip key={k} hue={e.includes('_') ? C.red : C.amber}>{e}</SChip>)}
      </div>

      <div style={{ ...mono, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: C.inkSoft, margin: '22px 0 10px', display: 'flex', justifyContent: 'space-between' }}><span>Source observations</span><span style={{ color: C.inkMuted }}>{srcObs.length}</span></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {srcObs.map((o, k) => (
          <div key={k} style={{ border: `1px solid ${C.rule}`, borderRadius: R.lg, padding: '12px 14px' }}>
            <div style={{ ...sans, fontSize: 13.5, fontWeight: 600, lineHeight: 1.4 }}>“{o.q}”</div>
            <div style={{ ...mono, fontSize: 11, color: C.inkSoft, marginTop: 7, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>{o.site} · {o.ago}</div>
          </div>
        ))}
      </div>

      {full && (
        <>
          <div style={{ ...mono, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: C.inkSoft, margin: '22px 0 10px' }}>Forge Works Map® classification</div>
          {full.fwmap.map((f, k) => (
            <div key={k} style={{ border: `1px solid ${C.rule}`, borderRadius: R.lg, padding: '12px 14px', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ ...mono, fontSize: 12.5, fontWeight: 700 }}>{f.factor}</span>
                <span style={{ ...mono, fontSize: 11.5, fontWeight: 700, color: C.green, marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4 }}><Ico name="check" size={13} color={C.green} />{f.score}</span>
              </div>
              <div style={{ ...sans, fontSize: 12.5, fontStyle: 'italic', color: C.inkSoft, lineHeight: 1.45 }}>{f.note}</div>
            </div>
          ))}
        </>
      )}

      <div style={{ ...mono, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: C.inkSoft, margin: '22px 0 10px' }}>Support for action</div>
      <div style={{ border: `1px solid ${C.rule}`, borderRadius: R.lg, padding: '4px 14px' }}>
        {(full ? full.endorsements : i.supporters.map((s) => ({ name: s, note: 'Backing this for action.' }))).map((e, k, arr) => (
          <div key={k} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: k === arr.length - 1 ? 'none' : `1px solid ${C.ruleSoft}` }}>
            <Avatar name={e.name} size={32} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ ...sans, fontSize: 13.5, fontWeight: 700 }}>{e.name}</div>
              <div style={{ ...sans, fontSize: 12.5, color: C.inkSoft, marginTop: 2, lineHeight: 1.45, fontWeight: 500 }}>{e.note}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ══ COMMUNITIES ═══════════════════════════════════════════════
function Communities() {
  const [view, setView] = React.useState('feed'); // feed | thread
  if (view === 'thread') return <ThreadView onBack={() => setView('feed')} />;
  return (
    <div>
      <PageHead title="Communities of practice" sub="Share what works and learn across sites. Hiviz seeds approved insights here so the field can weigh in." actions={<Btn variant="accent" icon="add">New post</Btn>} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {POSTS.map((p) => <PostCard key={p.id} p={p} onOpen={() => setView('thread')} />)}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card pad={18}>
            <Eyebrow>My communities</Eyebrow>
            {COMMUNITIES.map((c, i) => (
              <div key={c.id} className="a-row" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: i === COMMUNITIES.length - 1 ? 'none' : `1px solid ${C.ruleSoft}`, cursor: 'pointer' }}>
                <div style={{ width: 34, height: 34, borderRadius: R.md, background: C.fill, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Ico name={c.icon} size={18} color={C.inkSoft} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ ...sans, fontSize: 13.5, fontWeight: 700 }}>{c.name}</div>
                  <div style={{ ...sans, fontSize: 12, color: C.inkSoft, marginTop: 1, fontWeight: 500 }}>{c.kind} · {c.members} members</div>
                </div>
                <Ico name="chevron_right" size={16} color={C.inkMuted} />
              </div>
            ))}
          </Card>
          <Card pad={18} style={{ background: C.ink, borderColor: C.ink }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}><Ico name="auto_awesome" size={16} color={C.hi} fill={1} /><span style={{ ...mono, fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: C.hi }}>From your insights</span></div>
            <div style={{ ...sans, fontSize: 13.5, color: '#fff', lineHeight: 1.5, fontWeight: 500 }}>2 of your supported insights have been shared to communities this month, reaching 240 members.</div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function PostCard({ p, onOpen }) {
  return (
    <Card pad={18} interactive onClick={onOpen}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 12 }}>
        <Avatar name={p.author} size={34} tone={p.generated ? C.hi : null} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ ...sans, fontSize: 13.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 7 }}>{p.author}{p.role && <span style={{ ...sans, fontSize: 12, fontWeight: 500, color: C.inkSoft }}>· {p.role}</span>}</div>
          <div style={{ ...mono, fontSize: 11, color: C.inkSoft, marginTop: 2, fontWeight: 600 }}>{p.community} · {p.when}</div>
        </div>
        {p.generated && <SChip hue={C.hiInk} icon="auto_awesome">From insight</SChip>}
        {p.digest && <SChip hue={C.blue}>Digest</SChip>}
      </div>
      <div style={{ ...sans, fontSize: 16, fontWeight: 700, letterSpacing: -0.3, lineHeight: 1.3 }}>{p.title}</div>
      <div style={{ ...sans, fontSize: 13.5, color: C.inkSoft, marginTop: 7, lineHeight: 1.55, fontWeight: 500 }}>{p.body}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 14, paddingTop: 13, borderTop: `1px solid ${C.ruleSoft}` }}>
        <span style={{ ...mono, fontSize: 12, fontWeight: 600, color: C.inkSoft, display: 'inline-flex', alignItems: 'center', gap: 6 }}><Ico name="chat_bubble" size={15} color={C.inkMuted} />{p.replies}</span>
        <span style={{ ...mono, fontSize: 12, fontWeight: 600, color: C.inkSoft, display: 'inline-flex', alignItems: 'center', gap: 6 }}><Ico name="thumb_up" size={15} color={C.inkMuted} />{p.likes}</span>
        {p.files && <span style={{ ...mono, fontSize: 12, fontWeight: 600, color: C.inkSoft, display: 'inline-flex', alignItems: 'center', gap: 6 }}><Ico name="attach_file" size={15} color={C.inkMuted} />{p.files}</span>}
      </div>
    </Card>
  );
}

function ThreadView({ onBack }) {
  const t = THREAD; const p = t.post;
  return (
    <div style={{ maxWidth: 760 }}>
      <button onClick={onBack} className="a-link" style={{ ...mono, fontSize: 12, fontWeight: 700, color: C.inkSoft, background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.6 }}><Ico name="arrow_back" size={16} /> {p.community}</button>
      <Card pad={24}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 14 }}>
          <Avatar name={p.author} size={38} tone={C.hi} />
          <div style={{ flex: 1 }}><div style={{ ...sans, fontSize: 14, fontWeight: 700 }}>{p.author}</div><div style={{ ...mono, fontSize: 11, color: C.inkSoft, marginTop: 2, fontWeight: 600 }}>Generated insight · {p.community} · {p.when}</div></div>
          <SChip hue={C.hiInk} icon="auto_awesome">From insight</SChip>
        </div>
        <h2 style={{ ...sans, margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: -0.4, lineHeight: 1.25 }}>{p.title}</h2>
        <div style={{ ...sans, fontSize: 14, color: C.inkSoft, marginTop: 10, lineHeight: 1.6, fontWeight: 500 }}>{p.body}</div>
        <div style={{ marginTop: 16 }}><AINote title="The question this raises">{t.question}</AINote></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16, padding: '11px 14px', border: `1px solid ${C.rule}`, borderRadius: R.lg }}>
          <Ico name="description" size={20} color={C.inkSoft} />
          <span style={{ ...sans, fontSize: 13.5, fontWeight: 600, flex: 1 }}>Spotter-handover-checklist-v2.pdf</span>
          <button className="a-link" style={{ ...mono, fontSize: 11, fontWeight: 700, color: C.ink, background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase' }}>View</button>
        </div>
      </Card>

      <div style={{ ...mono, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: C.inkSoft, margin: '24px 4px 12px' }}>{t.replies.length} replies</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {t.replies.map((r, k) => (
          <Card key={k} pad={16}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 9 }}>
              <Avatar name={r.name} size={32} />
              <div style={{ flex: 1 }}><div style={{ ...sans, fontSize: 13.5, fontWeight: 700 }}>{r.name}</div><div style={{ ...mono, fontSize: 11, color: C.inkSoft, marginTop: 1, fontWeight: 600 }}>{r.role} · {r.when}</div></div>
            </div>
            <div style={{ ...sans, fontSize: 13.5, color: C.ink, lineHeight: 1.55, fontWeight: 500 }}>{r.text}</div>
            <div style={{ marginTop: 10 }}><span style={{ ...mono, fontSize: 12, fontWeight: 600, color: C.inkSoft, display: 'inline-flex', alignItems: 'center', gap: 6 }}><Ico name="thumb_up" size={15} color={C.inkMuted} />{r.likes}</span></div>
          </Card>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 16, alignItems: 'center' }}>
        <Avatar name={CURRENT_USER.name} size={36} />
        <input className="a-input" placeholder="Add a reply…" style={{ ...sans, flex: 1, height: 44, padding: '0 16px', borderRadius: R.md, border: `1px solid ${C.rule}`, fontSize: 14, outline: 'none' }} />
        <Btn variant="primary" icon="send">Reply</Btn>
      </div>
    </div>
  );
}

// ══ SETTINGS (+ users & access) ═══════════════════════════════
function Settings() {
  const [tab, setTab] = React.useState('account');
  return (
    <div>
      <PageHead title="Settings" sub="Your account, notifications and the people with access to this region." />
      <Tabs value={tab} onChange={setTab} items={[{ k: 'account', label: 'Account' }, { k: 'notifications', label: 'Notifications' }, { k: 'access', label: 'Users & access', n: USERS.length }]} />

      {tab === 'account' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 880 }}>
          <Card pad={20}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <Avatar name={CURRENT_USER.name} size={56} tone={C.hi} />
              <div><div style={{ ...sans, fontSize: 18, fontWeight: 700 }}>{CURRENT_USER.name}</div><div style={{ ...sans, fontSize: 13, color: C.inkSoft, marginTop: 2, fontWeight: 500 }}>{CURRENT_USER.role} · {CURRENT_USER.region}</div></div>
            </div>
            <div style={{ marginTop: 18 }}><SettingRow label="Email" value={CURRENT_USER.email} /><SettingRow label="Role" value={CURRENT_USER.role} /><SettingRow label="Identity" value="Verified" valueTone={C.green} last /></div>
          </Card>
          <Card pad={20}>
            <Eyebrow>Sync &amp; storage</Eyebrow>
            <SettingRow label="Sync mode" value="Wi-Fi only · queues offline" toggle />
            <SettingRow label="Storage" value="2.4 GB of 5 GB used" />
            <SettingRow label="Auto-archive" value="Visits older than 90 days" toggle on last />
          </Card>
        </div>
      )}

      {tab === 'notifications' && (
        <Card pad={20} style={{ maxWidth: 560 }}>
          <Eyebrow>What you’re notified about</Eyebrow>
          <SettingRow label="Insights needing support" value="Email + in-app" toggle on />
          <SettingRow label="Visit reminders" value="In-app" toggle on />
          <SettingRow label="Overdue actions" value="Email + in-app" toggle on />
          <SettingRow label="Community replies" value="In-app" toggle on />
          <SettingRow label="Weekly region digest" value="Email · Monday 07:00" toggle last />
        </Card>
      )}

      {tab === 'access' && <UsersTable />}
    </div>
  );
}

function SettingRow({ label, value, valueTone, toggle, on, last }) {
  const [v, setV] = React.useState(!!on);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: last ? 'none' : `1px solid ${C.ruleSoft}` }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ ...sans, fontSize: 13.5, fontWeight: 700 }}>{label}</div>
        <div style={{ ...sans, fontSize: 12.5, color: C.inkSoft, marginTop: 2, fontWeight: 500 }}>{value}</div>
      </div>
      {valueTone && <Ico name="verified" size={18} color={valueTone} fill={1} />}
      {toggle && (
        <button onClick={() => setV(!v)} style={{ width: 42, height: 24, borderRadius: 99, border: 'none', background: v ? C.green : C.rule, position: 'relative', cursor: 'pointer', transition: 'background 0.15s', flexShrink: 0 }}>
          <span style={{ position: 'absolute', top: 2, left: v ? 20 : 2, width: 20, height: 20, borderRadius: 99, background: '#fff', transition: 'left 0.15s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
        </button>
      )}
    </div>
  );
}

function UsersTable() {
  const ACCESS_TONE = { Admin: C.ink, Manager: C.blue, Supervisor: C.green, Observer: C.inkSoft };
  const cols = [
    { key: 'name', label: 'Name', render: (r) => <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}><Avatar name={r.name} size={32} /><div><div style={{ fontWeight: 700, fontSize: 13.5 }}>{r.name}</div><div style={{ ...sans, fontSize: 12, color: C.inkSoft, marginTop: 1 }}>{r.role}</div></div></div> },
    { key: 'region', label: 'Region', w: 130, render: (r) => <span style={{ color: C.inkSoft }}>{r.region}</span> },
    { key: 'access', label: 'Access', w: 130, render: (r) => <SChip hue={ACCESS_TONE[r.access]}>{r.access}</SChip> },
    { key: 'sites', label: 'Sites', w: 80, mono: true, render: (r) => <span style={{ fontWeight: 700 }}>{r.sites}</span> },
    { key: 'lastActive', label: 'Last active', w: 130, render: (r) => <span style={{ ...mono, fontSize: 12, color: r.lastActive === 'Online now' ? C.green : C.inkSoft, fontWeight: 600 }}>{r.lastActive}</span> },
    { key: 'status', label: '', w: 110, render: (r) => r.status === 'invited' ? <SChip hue={C.amber}>Invited</SChip> : null },
  ];
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <Search placeholder="Search people" width={260} />
        <Btn variant="accent" icon="person_add">Invite user</Btn>
      </div>
      <DataTable columns={cols} rows={USERS} onRow={() => {}} />
    </div>
  );
}

Object.assign(window, { Observations, Insights, Communities, Settings, Drawer });
