// admin-base.jsx — LOCAL design tokens + primitives for the Hiviz Sight desktop
// console. Self-contained: this document does NOT depend on the shared
// component library — tokens are re-declared here so the file stands alone.
// All names are global (classic-script lexical scope) and consumed by the
// view files loaded after this one.

const FONT = {
  sans: '"GT Walsheim", "Hanken Grotesk", system-ui, -apple-system, sans-serif',
  mono: '"Geist Mono", ui-monospace, monospace',
};

// Warm-grey neutrals; colour reserved for status. Lime is the one brand accent.
const C = {
  bg:        '#FAFAF7',
  panel:     '#FFFFFF',
  ink:       '#0A0A0A',
  inkSoft:   '#525252',
  inkMuted:  '#A3A3A3',
  rule:      '#E5E5E2',
  ruleSoft:  '#F1F0EC',
  fill:      '#F7F6F2',
  hi:        '#FFFC36',
  hiInk:     '#1A1F00',
  red:       '#E63946',
  amber:     '#D97706',
  green:     '#22875A',
  blue:      '#1E40AF',
  // dark sidebar
  side:      '#0C0C0C',
  sidePanel: '#161615',
  sideText:  '#EDEDEA',
  sideMuted: '#85847E',
  sideRule:  'rgba(255,255,255,0.08)',
};
const R = { sm: 5, md: 8, lg: 11, xl: 14, pill: 99 };
const SH = {
  card: '0 1px 2px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.03)',
  pop:  '0 12px 36px rgba(10,10,10,0.16), 0 0 0 1px rgba(0,0,0,0.05)',
  rail: '0 2px 12px rgba(10,10,10,0.06)',
};
const mono = { fontFamily: FONT.mono, letterSpacing: 0 };
const sans = { fontFamily: FONT.sans };

// Tone → [bg, fg] for soft status chips.
const TONE = {
  red:    [C.red, '#FFFFFF'],
  amber:  [C.amber, '#FFFFFF'],
  green:  [C.green, '#FFFFFF'],
  blue:   [C.blue, '#FFFFFF'],
  ink:    [C.ink, '#FFFFFF'],
  hi:     [C.hi, C.hiInk],
  soft:   [C.fill, C.inkSoft],
};
const softTone = (hex) => `${hex}1A`;

// ── Icon (Material Symbols Outlined) ──────────────────────────
function Ico({ name, size = 20, weight = 400, fill = 0, color = 'currentColor', style }) {
  return (
    <span className="material-symbols-outlined" aria-hidden="true"
      style={{ fontSize: size, color, lineHeight: 1, fontVariationSettings: `'FILL' ${fill}, 'wght' ${weight}, 'opsz' ${size}`, ...style }}>
      {name}
    </span>
  );
}

// ── StatusDot ─────────────────────────────────────────────────
function Dot({ tone = C.inkMuted, size = 8, pulse }) {
  return <span style={{ width: size, height: size, borderRadius: 99, background: tone, flexShrink: 0, display: 'inline-block', boxShadow: pulse ? `0 0 0 0 ${tone}` : 'none', animation: pulse ? 'a-pulse 1.8s infinite' : 'none' }} />;
}

// ── Badge / Chip ──────────────────────────────────────────────
function Badge({ children, tone = 'soft', dot, outline }) {
  const [bg, fg] = TONE[tone] || TONE.soft;
  return (
    <span style={{ ...mono, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: R.sm, background: outline ? 'transparent' : bg, color: outline ? fg : fg, border: outline ? `1px solid ${bg}` : 'none', whiteSpace: 'nowrap' }}>
      {dot && <Dot tone={fg} size={6} />}{children}
    </span>
  );
}
// Soft-tinted status chip (coloured text on a wash of the same hue).
function SChip({ children, hue = C.inkSoft, icon }) {
  return (
    <span style={{ ...mono, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: R.sm, background: softTone(hue), color: hue, whiteSpace: 'nowrap' }}>
      {icon && <Ico name={icon} size={13} />}{children}
    </span>
  );
}

// ── Avatar ────────────────────────────────────────────────────
function Avatar({ name = '', size = 32, tone, ring }) {
  const initials = name.split(/[\s.]+/).filter(Boolean).map((p) => p[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div style={{ width: size, height: size, borderRadius: 99, flexShrink: 0, background: tone || C.fill, color: tone ? C.hiInk : C.inkSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT.sans, fontSize: size * 0.36, fontWeight: 700, border: ring ? `2px solid ${C.panel}` : 'none', boxShadow: ring ? `0 0 0 1px ${C.rule}` : 'none' }}>
      {initials}
    </div>
  );
}

// ── Button ────────────────────────────────────────────────────
function Btn({ children, variant = 'primary', size = 'md', icon, iconRight, onClick, full, type }) {
  const pad = size === 'sm' ? '0 12px' : size === 'lg' ? '0 20px' : '0 15px';
  const h = size === 'sm' ? 32 : size === 'lg' ? 46 : 38;
  const fs = size === 'sm' ? 12.5 : 13.5;
  const v = {
    primary: { background: C.ink, color: '#fff', border: '1px solid ' + C.ink },
    accent:  { background: C.hi, color: C.hiInk, border: '1px solid ' + C.hi },
    ghost:   { background: 'transparent', color: C.ink, border: `1px solid ${C.rule}` },
    subtle:  { background: C.fill, color: C.ink, border: '1px solid transparent' },
    danger:  { background: 'transparent', color: C.red, border: `1px solid ${C.red}33` },
  }[variant];
  return (
    <button className={`a-btn a-btn-${variant}`} type={type || 'button'} onClick={onClick}
      style={{ ...sans, height: h, padding: pad, borderRadius: R.md, fontSize: fs, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, cursor: 'pointer', whiteSpace: 'nowrap', width: full ? '100%' : 'auto', ...v }}>
      {icon && <Ico name={icon} size={17} weight={500} />}{children}{iconRight && <Ico name={iconRight} size={17} weight={500} />}
    </button>
  );
}
function IconBtn({ name, onClick, active, badge, size = 20 }) {
  return (
    <button className="a-iconbtn" onClick={onClick} style={{ position: 'relative', width: 38, height: 38, borderRadius: R.md, border: `1px solid ${active ? C.ink : C.rule}`, background: active ? C.ink : C.panel, color: active ? '#fff' : C.inkSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
      <Ico name={name} size={size} weight={500} />
      {badge ? <span style={{ position: 'absolute', top: -5, right: -5, minWidth: 17, height: 17, padding: '0 4px', borderRadius: 99, background: C.hi, color: C.hiInk, ...mono, fontSize: 9.5, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${C.panel}` }}>{badge}</span> : null}
    </button>
  );
}

// ── Card ──────────────────────────────────────────────────────
function Card({ children, pad = 18, style, interactive, onClick }) {
  return (
    <div className={interactive ? 'a-card a-card-int' : 'a-card'} onClick={onClick}
      style={{ background: C.panel, border: `1px solid ${C.rule}`, borderRadius: R.xl, boxShadow: SH.card, padding: pad, cursor: interactive ? 'pointer' : 'default', ...style }}>
      {children}
    </div>
  );
}

// Eyebrow / section label.
function Eyebrow({ children, right, style }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 0 12px', ...style }}>
      <span style={{ ...mono, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: C.inkSoft }}>{children}</span>
      {right}
    </div>
  );
}

// ── Page header (inside content area) ─────────────────────────
function PageHead({ title, sub, actions }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, marginBottom: 24 }}>
      <div>
        <h1 style={{ ...sans, margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: -0.7, color: C.ink, lineHeight: 1.1 }}>{title}</h1>
        {sub && <div style={{ ...sans, fontSize: 14, color: C.inkSoft, marginTop: 7, fontWeight: 500, maxWidth: 680, lineHeight: 1.5 }}>{sub}</div>}
      </div>
      {actions && <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>{actions}</div>}
    </div>
  );
}

// ── Underline tabs ────────────────────────────────────────────
function Tabs({ items, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 24, borderBottom: `1px solid ${C.rule}`, marginBottom: 22 }}>
      {items.map((it) => {
        const on = it.k === value;
        return (
          <button key={it.k} onClick={() => onChange(it.k)} className="a-tab"
            style={{ ...sans, background: 'transparent', border: 'none', borderBottom: `2px solid ${on ? C.ink : 'transparent'}`, padding: '0 0 12px', marginBottom: -1, fontSize: 14, fontWeight: on ? 700 : 600, color: on ? C.ink : C.inkMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            {it.label}
            {it.n != null && <span style={{ ...mono, fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: R.sm, background: on ? C.hi : C.fill, color: on ? C.hiInk : C.inkSoft }}>{it.n}</span>}
          </button>
        );
      })}
    </div>
  );
}

// ── Filter pills ──────────────────────────────────────────────
function Pills({ items, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {items.map((it) => {
        const on = it.k === value;
        return (
          <button key={it.k} onClick={() => onChange(it.k)} className="a-pill"
            style={{ ...sans, fontSize: 12.5, fontWeight: 600, padding: '6px 13px', borderRadius: R.pill, border: `1px solid ${on ? C.ink : C.rule}`, background: on ? C.ink : C.panel, color: on ? '#fff' : C.inkSoft, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            {it.label}{it.n != null && <span style={{ ...mono, fontSize: 10.5, fontWeight: 700, opacity: on ? 0.85 : 0.6 }}>{it.n}</span>}
          </button>
        );
      })}
    </div>
  );
}

// ── Search input ──────────────────────────────────────────────
function Search({ placeholder = 'Search', width = 280, value, onChange }) {
  return (
    <div style={{ position: 'relative', width }}>
      <Ico name="search" size={18} color={C.inkMuted} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
      <input className="a-input" value={value} onChange={onChange ? (e) => onChange(e.target.value) : undefined} placeholder={placeholder}
        style={{ ...sans, width: '100%', height: 38, padding: '0 12px 0 38px', borderRadius: R.md, border: `1px solid ${C.rule}`, background: C.panel, fontSize: 13.5, color: C.ink, outline: 'none' }} />
    </div>
  );
}

// ── DataTable ─────────────────────────────────────────────────
// columns: [{ key, label, w, align, render(row), mono }]
function DataTable({ columns, rows, onRow, rowKey = 'id', empty }) {
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.rule}`, borderRadius: R.xl, boxShadow: SH.card, overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', ...sans }}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} style={{ textAlign: c.align || 'left', ...mono, fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: C.inkMuted, padding: '13px 16px', borderBottom: `1px solid ${C.rule}`, width: c.w, whiteSpace: 'nowrap', background: C.fill }}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td colSpan={columns.length} style={{ padding: '36px 16px', textAlign: 'center', color: C.inkMuted, fontSize: 13.5, fontWeight: 500 }}>{empty || 'Nothing here yet.'}</td></tr>
          )}
          {rows.map((row, i) => (
            <tr key={row[rowKey] ?? i} className={onRow ? 'a-row' : ''} onClick={onRow ? () => onRow(row) : undefined}
              style={{ cursor: onRow ? 'pointer' : 'default', borderBottom: i === rows.length - 1 ? 'none' : `1px solid ${C.ruleSoft}` }}>
              {columns.map((c) => (
                <td key={c.key} style={{ textAlign: c.align || 'left', padding: '14px 16px', fontSize: 13.5, color: C.ink, fontWeight: 500, verticalAlign: 'middle', ...(c.mono ? mono : null) }}>
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── KPI stat card ─────────────────────────────────────────────
function Stat({ label, value, unit, delta, deltaTone, sub, icon, accent }) {
  return (
    <Card pad={18} style={accent ? { background: C.ink, borderColor: C.ink } : null}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ ...mono, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: accent ? 'rgba(255,255,255,0.6)' : C.inkMuted }}>{label}</span>
        {icon && <Ico name={icon} size={18} color={accent ? C.hi : C.inkMuted} />}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 14 }}>
        <span style={{ ...sans, fontSize: 34, fontWeight: 700, letterSpacing: -1, color: accent ? '#fff' : C.ink, lineHeight: 1 }}>{value}</span>
        {unit && <span style={{ ...sans, fontSize: 14, fontWeight: 600, color: accent ? 'rgba(255,255,255,0.6)' : C.inkMuted }}>{unit}</span>}
        {delta && <span style={{ ...mono, fontSize: 11.5, fontWeight: 700, color: deltaTone || C.green, marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 2 }}><Ico name={deltaTone === C.red ? 'trending_up' : 'trending_up'} size={14} color={deltaTone || C.green} />{delta}</span>}
      </div>
      {sub && <div style={{ ...sans, fontSize: 12.5, color: accent ? 'rgba(255,255,255,0.7)' : C.inkSoft, marginTop: 8, fontWeight: 500 }}>{sub}</div>}
    </Card>
  );
}

// AI voice block — lime hairline, used wherever Hiviz "speaks".
function AINote({ title = 'Hiviz', children, style }) {
  return (
    <div style={{ background: '#FFFEF0', border: `1px solid ${C.hi}`, borderRadius: R.lg, padding: '13px 15px', ...style }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}>
        <Ico name="auto_awesome" size={15} color={C.hiInk} fill={1} />
        <span style={{ ...mono, fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: C.hiInk }}>{title}</span>
      </div>
      <div style={{ ...sans, fontSize: 13.5, lineHeight: 1.55, color: C.ink, fontWeight: 500 }}>{children}</div>
    </div>
  );
}

Object.assign(window, { FONT, C, R, SH, mono, sans, TONE, softTone, Ico, Dot, Badge, SChip, Avatar, Btn, IconBtn, Card, Eyebrow, PageHead, Tabs, Pills, Search, DataTable, Stat, AINote });
