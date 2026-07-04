// admin-app.jsx — shell (sidebar + topbar + notifications), routing, mount.

const NAV = [
  { k: 'dashboard', label: 'Dashboard', icon: 'grid_view' },
  { k: 'visits', label: 'Visits', icon: 'event' },
  { k: 'sites', label: 'Sites', icon: 'location_on' },
  { k: 'observations', label: 'Observations', icon: 'visibility' },
  { k: 'insights', label: 'Insights', icon: 'auto_awesome' },
  { k: 'communities', label: 'Communities', icon: 'groups' },
];
const VIEW_CMP = { dashboard: Dashboard, visits: Visits, sites: Sites, site: SiteDetail, observations: Observations, insights: Insights, communities: Communities, settings: Settings };
const ACTIVE_FOR = { site: 'sites' };

function Sidebar({ view, go }) {
  const activeKey = ACTIVE_FOR[view] || view;
  return (
    <div style={{ width: 244, flexShrink: 0, background: C.side, color: C.sideText, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '22px 20px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 26, height: 26, borderRadius: 7, background: C.hi, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span style={{ width: 11, height: 11, background: C.hiInk, borderRadius: 2 }} /></div>
        <div>
          <div style={{ ...sans, fontSize: 15, fontWeight: 700, letterSpacing: -0.3, color: '#fff' }}>Hiviz Sight</div>
          <div style={{ ...mono, fontSize: 9.5, fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase', color: C.sideMuted, marginTop: 1 }}>Web Console</div>
        </div>
      </div>

      <div style={{ padding: '6px 12px', flex: 1, overflowY: 'auto' }}>
        <div style={{ ...mono, fontSize: 9.5, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: C.sideMuted, padding: '12px 12px 8px' }}>Workspace</div>
        {NAV.map((n) => {
          const on = n.k === activeKey;
          return (
            <button key={n.k} className="a-nav" onClick={() => go(n.k)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', marginBottom: 2, borderRadius: R.md, border: 'none', cursor: 'pointer', textAlign: 'left', background: on ? 'rgba(255,255,255,0.08)' : 'transparent', color: on ? '#fff' : C.sideMuted, position: 'relative' }}>
              {on && <span style={{ position: 'absolute', left: -12, top: 8, bottom: 8, width: 3, borderRadius: 99, background: C.hi }} />}
              <Ico name={n.icon} size={20} weight={on ? 600 : 400} color={on ? C.hi : C.sideMuted} fill={on ? 1 : 0} />
              <span style={{ ...sans, fontSize: 14, fontWeight: on ? 700 : 600 }}>{n.label}</span>
            </button>
          );
        })}
      </div>

      <div style={{ padding: 12, borderTop: `1px solid ${C.sideRule}` }}>
        <button className="a-nav" onClick={() => go('settings')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '9px 12px', marginBottom: 4, borderRadius: R.md, border: 'none', cursor: 'pointer', textAlign: 'left', background: view === 'settings' ? 'rgba(255,255,255,0.08)' : 'transparent', color: view === 'settings' ? '#fff' : C.sideMuted }}>
          <Ico name="settings" size={20} color={view === 'settings' ? C.hi : C.sideMuted} fill={view === 'settings' ? 1 : 0} />
          <span style={{ ...sans, fontSize: 14, fontWeight: 600 }}>Settings</span>
        </button>
        <button className="a-nav" onClick={() => go('settings')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 11, padding: '8px 10px', borderRadius: R.md, border: 'none', cursor: 'pointer', textAlign: 'left', background: 'transparent' }}>
          <Avatar name={CURRENT_USER.name} size={34} tone={C.hi} />
          <div style={{ minWidth: 0 }}>
            <div style={{ ...sans, fontSize: 13, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{CURRENT_USER.name}</div>
            <div style={{ ...sans, fontSize: 11.5, color: C.sideMuted, marginTop: 1 }}>{CURRENT_USER.role}</div>
          </div>
        </button>
      </div>
    </div>
  );
}

function NotifMenu({ go, onClose }) {
  const open = (n) => { onClose(); go(n.to); };
  const Row = ({ n, last }) => (
    <div className="a-row" onClick={() => open(n)} style={{ display: 'flex', gap: 11, alignItems: 'flex-start', padding: '12px 16px', borderBottom: last ? 'none' : `1px solid ${C.ruleSoft}`, cursor: 'pointer' }}>
      <div style={{ width: 32, height: 32, borderRadius: 99, flexShrink: 0, background: n.chip === 'hi' ? C.hi : softTone(n.tone), display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ico name={n.icon} size={16} color={n.chip === 'hi' ? C.hiInk : n.tone} /></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ ...sans, fontSize: 13, lineHeight: 1.4, fontWeight: 500 }}><span style={{ fontWeight: 700 }}>{n.subject}</span> {n.verb}</div>
        <div style={{ ...sans, fontSize: 12, color: C.inkSoft, marginTop: 2, lineHeight: 1.4, fontWeight: 500 }}>{n.detail}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, flexShrink: 0 }}>
        <span style={{ ...mono, fontSize: 10, color: C.inkMuted, fontWeight: 600 }}>{n.when}</span>
        {n.unread && <Dot tone={C.hi} size={8} />}
      </div>
    </div>
  );
  return (
    <div className="a-pop" style={{ position: 'absolute', top: 48, right: 0, width: 380, background: C.panel, borderRadius: R.lg, boxShadow: SH.pop, zIndex: 70, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: `1px solid ${C.rule}` }}>
        <span style={{ ...sans, fontSize: 15, fontWeight: 700 }}>Notifications</span>
        <button className="a-link" style={{ ...mono, fontSize: 10.5, fontWeight: 700, color: C.inkSoft, background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 0.5 }}>Mark all read</button>
      </div>
      <div style={{ maxHeight: 460, overflowY: 'auto' }} className="a-scroll">
        <div style={{ ...mono, fontSize: 9.5, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: C.inkMuted, padding: '11px 16px 5px' }}>Today</div>
        {NOTIFS.today.map((n, i) => <Row key={n.id} n={n} last={i === NOTIFS.today.length - 1} />)}
        <div style={{ ...mono, fontSize: 9.5, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: C.inkMuted, padding: '11px 16px 5px', borderTop: `1px solid ${C.ruleSoft}` }}>Earlier this week</div>
        {NOTIFS.earlier.map((n, i) => <Row key={n.id} n={n} last={i === NOTIFS.earlier.length - 1} />)}
      </div>
    </div>
  );
}

function Topbar({ go }) {
  const [notifOpen, setNotifOpen] = React.useState(false);
  return (
    <div style={{ height: 64, flexShrink: 0, background: C.panel, borderBottom: `1px solid ${C.rule}`, display: 'flex', alignItems: 'center', gap: 16, padding: '0 28px', position: 'sticky', top: 0, zIndex: 40 }}>
      <button className="a-ws" style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px 8px', borderRadius: R.md }}>
        <Ico name="public" size={18} color={C.inkSoft} />
        <span style={{ ...sans, fontSize: 14, fontWeight: 700, color: C.ink }}>Pilbara region</span>
        <Ico name="expand_more" size={18} color={C.inkMuted} />
      </button>
      <div style={{ flex: 1 }} />
      <Search placeholder="Search sites, observations, people…" width={340} />
      <div style={{ position: 'relative' }}>
        <IconBtn name="notifications" badge={NOTIF_UNREAD} active={notifOpen} onClick={() => setNotifOpen((v) => !v)} />
        {notifOpen && (
          <>
            <div onClick={() => setNotifOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 60 }} />
            <NotifMenu go={go} onClose={() => setNotifOpen(false)} />
          </>
        )}
      </div>
      <button onClick={() => go('settings')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}><Avatar name={CURRENT_USER.name} size={38} tone={C.hi} /></button>
    </div>
  );
}

function App() {
  const [route, setRoute] = React.useState({ view: 'dashboard', params: null });
  const scrollRef = React.useRef(null);
  const go = React.useCallback((view, params = null) => {
    setRoute({ view, params });
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, []);
  const Cmp = VIEW_CMP[route.view] || Dashboard;
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden', background: C.bg }}>
      <Sidebar view={route.view} go={go} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100%' }}>
        <Topbar go={go} />
        <div ref={scrollRef} className="a-scroll" style={{ flex: 1, overflowY: 'auto', padding: '28px 32px 56px' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <Cmp go={go} params={route.params} />
          </div>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
