# Handoff: Hiviz Sight — Web Admin Console (Responsive, Production Boilerplate)

## Overview
This is the desktop admin/web console for Hiviz Sight, a field-safety-observation product. It gives regional managers a browser view of the same data captured in the mobile field app: visits, sites, observations, AI-surfaced "insights," communities of practice, and account/user settings.

**Goal of this handoff:** turn this static HTML/React prototype into a real, production-grade web app with a proper component library — and, critically, make it **responsive**. The prototype as built is desktop-only (fixed 244px sidebar, fixed 4-column grids, fixed-width drawers/tables) and has zero media queries. Treat responsiveness as new work to design into the implementation, not something to extract from the source.

**Isolation note:** this package is scoped only to the admin console files listed below. It does not touch or depend on the team's native mobile app codebase — keep the new web project in its own repo/package so the two efforts stay decoupled. The prototype files may be deleted from the design project after this handoff; nothing else depends on them.

## About the Design Files
The files in `source/` are an HTML/React **design reference** — a clickable prototype built with in-browser Babel and global-scope script tags, not production code. Do not lift this code as-is into the new project. Recreate the same visual system and behavior using the target stack's real component architecture (proper build, TypeScript, a component library with real props/variants, routing, state management, data fetching) — see "Recommended stack" below.

## Fidelity
**High-fidelity** for visual design, layout, copy, and desktop interaction. Colors, type, spacing, and component states (hover/active/focus) shown here are final — recreate pixel-accurately at desktop widths using the design tokens below.

**Not yet designed:** responsive/mobile-web breakpoints, since the prototype only renders one fixed desktop layout. Use the "Responsive Requirements" section below as the spec to design against; it describes intended behavior per breakpoint, not pixel-exact mockups.

## Recommended Stack
No existing web frontend to match, so choose freely. Suggested: React + TypeScript, Vite, a headless component base (Radix UI or React Aria) styled with your own tokens, and a lightweight router (React Router or TanStack Router). Build a real component library (Button, Badge, Card, DataTable, Tabs, Pills, Drawer, Avatar, Stat, etc. — see "Components" below) as installable, documented, storybook-able units rather than one-off JSX.

## Screens / Views

### 1. Shell (Sidebar + Topbar)
- **Sidebar** (dark, `#0C0C0C`): fixed 244px wide, full height. Logo block, nav list (Dashboard, Visits, Sites, Observations, Insights, Communities), Settings + user account footer. Active nav item gets a 3px lime left-rail accent, bold white label, filled icon.
- **Topbar** (white, 64px tall, sticky): region switcher (left), search input (340px, center-right), notification bell with unread-count badge and dropdown panel, user avatar (opens Settings).
- **Content area**: scrollable, `28px 32px 56px` padding, content capped at `max-width: 1280px` and centered.

### 2. Dashboard
Personalized greeting header. 4-up KPI stat row (Visits this week, Open insights, Observations 7d, Sites at risk). Below: 2-column layout — "Needs your attention" list (left, wider) + live-visit card and upcoming-visits card (right). Footer: latest-observations data table (5 rows).

### 3. Visits
Header with Export/Plan-a-visit actions. Underline tabs: Active / Upcoming / Past (with counts). Active tab shows a live-visit hero card + "next up" card side by side. Upcoming/Past tabs show data tables.

### 4. Sites
Header with Map-view action. Filter pills (All / On site now / At risk / Needs a visit) + search. Data table: site name+region/type, visibility chip, last-visit date, open-insights count, atrophy meter (horizontal bar + number), chevron.

### 5. Site Detail
Back link → Sites. Header with site name, Configure/Plan-a-visit actions. 4-up stat row (Visibility, Observations, Open insights, Atrophy). 2-column body: open insights list + visit history (left); site contacts card (right). Conditional AI callout banner when the site is at risk.

### 6. Observations
Header with Export-CSV action. Signal filter pills (All / Barriers / Weak / Positive) + search. Full data table (id, when, site, summary, signal chip, energy, status chip). Row click opens a **right-side slide-in drawer** (460px, slides in from the right, dark scrim behind) with full observation detail, an AI-classification callout, a fact list, and a "view linked insight" action when applicable.

### 7. Insights (master–detail)
Header with Report action. Tabs: For review / In action / Closed (with counts). Master–detail layout: 360px-wide card list on the left (each card: status chip, theme label, title, supporter avatars stack, obs/site counts, AI-routed icon); detail panel on the right showing full insight — status/actions, title, site chips, AI-routed callout, AI-suggested summary + basis, systemic-cause block, energy classification chips, source-observation quote cards, (for the one enriched example) a "Forge Works Map® classification" section, and a support/endorsements list.

### 8. Communities
Header with New-post action. 2-column: post feed (left, cards with author avatar, AI-generated badge or role, title, body, reply/like/attachment counts) + sidebar (My Communities list, "from your insights" AI callout card) on the right. Clicking a post opens a **Thread view**: full post, an AI "question this raises" callout, an attached file row, and a threaded reply list with a reply composer at the bottom.

### 9. Settings
Tabs: Account / Notifications / Users & access (with count). Account: profile card + sync/storage card, 2-up. Notifications: single card of toggle rows. Users & access: search + Invite-user action, then a data table (name+avatar, region, access-level chip, sites count, last-active, invited-status chip).

## Components (build these as the library)
- **Button** (`Btn`): variants primary / accent (lime) / ghost / subtle / danger; sizes sm/md/lg; optional left/right icon.
- **IconBtn**: square icon-only button, active state, optional numeric badge (for notifications).
- **Badge / SChip**: small uppercase mono pill chips — solid (`Badge`, tone-filled) and soft-tinted (`SChip`, colored text on a wash of the same hue). Tones: red, amber, green, blue, ink, brand-yellow ("hi"), neutral.
- **Avatar**: circular initials avatar; optional brand-yellow tone fill; optional white ring (for stacked-avatar groups).
- **Card**: white panel, 1px border, soft shadow, 14px radius; optional `interactive` hover state (lift + border darken).
- **Eyebrow**: small uppercase mono section label with optional right-aligned action.
- **PageHead**: page title (28px bold) + optional subtitle + right-aligned action buttons.
- **Tabs**: underline tab bar with optional count badge per tab.
- **Pills**: rounded filter/segmented-control pills with optional count.
- **Search**: icon-prefixed text input.
- **DataTable**: generic column-driven table — sticky-styled header row (uppercase mono, tinted background), row hover state, optional row click, empty state.
- **Stat**: KPI card — label, big value (+ optional unit), optional delta indicator, optional icon, optional dark "accent" variant.
- **AINote**: pale-yellow callout block with a lime hairline border, used anywhere the AI is "speaking" (suggestions, classifications, routed patterns).
- **Drawer**: right-side slide-in panel with scrim, used for the observation detail view.
- **Meter**: small horizontal progress/atrophy bar with numeric readout.
- **SignalMix**: 3-pip inline indicator (positive/weak/barrier counts, dot + number, each in its status color).
- **Toggle switch**: pill switch used in Settings rows.

## Interactions & Behavior
- **Navigation**: single-page client-side routing; `go(view, params)` swaps the content view and resets scroll to top. No URL/history integration in the prototype — implement real routes (e.g. `/sites/:id`, `/insights/:id`) in production so links/back-button work.
- **Hover states**: nav items lighten against the dark sidebar; buttons darken slightly (`brightness(0.94)`) except ghost/subtle which get a light fill; cards lift with a stronger shadow and darker border; table rows get a subtle background tint plus a lime left-edge accent on the first cell; tabs/pills/links darken text/border on hover.
- **Active/pressed**: buttons nudge down 0.5px on click.
- **Notification bell**: click toggles a dropdown panel (380px) grouped by "Today" / "Earlier this week"; each row navigates to the relevant view on click and closes the panel; a full-viewport transparent scrim behind it closes on outside click.
- **Insights master-detail**: selecting a card in the left list swaps the right-hand detail panel; deep-linking via `params.id` selects the right tab + item automatically.
- **Observations drawer**: opens on row click, slides in from the right (`220ms cubic-bezier(.2,.7,.3,1)`) over a dark scrim; closes on scrim click or the X button.
- **Live-visit pulse**: a small green dot uses a 1.8s looping box-shadow pulse to indicate "live on site."
- **Popover entrance**: notification panel pops in with a subtle scale+translateY fade (`140ms ease-out`).
- **Filtering**: Sites/Observations pages filter client-side via pill/tab state; search inputs are visually present but not wired to filtering logic in the prototype — implement real search in production.
- **Community thread**: clicking a post card switches from feed to a full thread view (own screen state, not a route in the prototype — should be a real route in production, e.g. `/communities/thread/:id`).
- **Settings toggles**: local on/off state per row; wire to real persistence in production.

## State Management
Per the prototype, state needed per view:
- **Route state**: `{ view, params }` — replace with a real router.
- **Visits**: active sub-tab (active/upcoming/past).
- **Sites**: active filter pill, search query.
- **Observations**: site filter, signal filter, selected row (drives the drawer), search query.
- **Insights**: active status tab, selected insight id (drives the detail panel) — must support deep-linking by id.
- **Communities**: feed vs. thread view state (replace with routing).
- **Settings**: active tab; per-row toggle state; should persist to a real backend.
- **Global**: current user, unread-notification count, notification-panel open/closed.

All data in the prototype (`admin-data.jsx`) is static sample data — replace with real API/data-fetching (e.g. React Query) in production. It's useful as a reference for the shape of each entity (site, visit, insight, observation, community post, user).

## Design Tokens

### Colors
- Background: `#FAFAF7` (page), `#FFFFFF` (panels/cards)
- Ink (text): `#0A0A0A` (primary), `#525252` (soft/secondary), `#A3A3A3` (muted)
- Rules/borders: `#E5E5E2` (standard), `#F1F0EC` (soft), fill/wash `#F7F6F2`
- Brand accent (lime): `#FFFC36` background / `#1A1F00` ink-on-lime — the **one** brand color; used sparingly for AI/brand moments (active nav rail, accent buttons, AI callouts, badges)
- Status: red `#E63946`, amber `#D97706`, green `#22875A`, blue `#1E40AF`
- Dark sidebar: background `#0C0C0C`, panel `#161615`, text `#EDEDEA`, muted text `#85847E`, hairline `rgba(255,255,255,0.08)`
- Soft status tint formula: status hex + `1A` alpha suffix (≈10% opacity wash) for `SChip` backgrounds

### Typography
- Sans (UI text): `"GT Walsheim", "Hanken Grotesk", system-ui, -apple-system, sans-serif` — GT Walsheim is a licensed brand font; **Hanken Grotesk** (Google Fonts) is the safe fallback to build against if GT Walsheim isn't licensed for the new project.
- Mono (labels/data/eyebrows): `"Geist Mono", ui-monospace, monospace`
- Scale in use: 28px/700 (page titles), 22–23px/700 (detail headings), 19–20px/700 (card headlines), 14–16px/600–700 (body/labels), 13–13.5px/500–600 (body text), 12–12.5px (secondary), 10–11.5px/700 uppercase mono w/ 0.4–1px letter-spacing (eyebrows, table headers, chips)

### Radii
`sm` 5px · `md` 8px · `lg` 11px · `xl` 14px (cards) · `pill` 99px (pills/avatars/toggles)

### Shadows
- Card: `0 1px 2px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.03)`
- Popover: `0 12px 36px rgba(10,10,10,0.16), 0 0 0 1px rgba(0,0,0,0.05)`
- Rail (selected list item): `0 2px 12px rgba(10,10,10,0.06)`

### Icons
Material Symbols Outlined (variable font — FILL/weight/opsz axes), 16–24px depending on context. If moving off Material Symbols, pick one icon set and keep it consistent across the whole library.

## Responsive Requirements (new — design this in)
The prototype has no responsive behavior. Implement the following breakpoint strategy (adjust to the chosen component library's conventions, but keep the intent):

- **Desktop (≥1280px)**: as shown — fixed 244px sidebar, content capped at 1280px, full data tables, 4-column stat/grid layouts.
- **Tablet / narrow desktop (~840–1279px)**: collapse the sidebar to icon-only (or an overlay drawer triggered by a hamburger in the topbar); reduce stat grids from 4 columns to 2; keep data tables but allow horizontal scroll on wide ones (Observations, Insights source lists) rather than clipping; Insights master-detail can stack list-above-detail if 360px+content no longer fits comfortably.
- **Mobile web (<840px)**: sidebar becomes a slide-over drawer (reuse the existing `Drawer` pattern) opened from a topbar menu button; topbar search collapses to an icon that expands on tap; stat grids go to 1 column; all data tables convert to a stacked card layout per row (label/value pairs) instead of horizontal tables — this is the highest-effort item, prioritize it for Observations, Sites, and Users & access; the Observations detail drawer should go full-width/full-height on mobile; Insights master-detail becomes two full-screen steps (list → tap → detail, with a back action) rather than a side-by-side grid.
- Treat touch targets as ≥44px on any layout that can run on a touchscreen (tablet/mobile web).
- Test the Insights and Communities screens first — they have the deepest nested layouts (master-detail, 2-column feed+sidebar) and will surface the hardest responsive decisions.

## Assets
No external image/logo assets — the design uses only typography, flat color, and Material Symbols icon glyphs. Fonts are loaded from Google Fonts (Hanken Grotesk, Geist Mono, Material Symbols Outlined); GT Walsheim (primary brand sans) is referenced but not bundled — source it from the brand's licensed font if available, otherwise ship on the Hanken Grotesk fallback.

## Screenshots
`screenshots/` contains reference captures of each screen at desktop width: 01-dashboard, 02-visits, 03-sites, 04-observations, 05-observation-drawer, 06-insights, 07-communities, 08-settings.

## Files
All source is in `source/`:
- `Admin Console.html` — shell HTML, font links, global CSS (interaction states, scrollbar styling, keyframe animations), sequential module loader
- `admin-base.jsx` — design tokens (`C`, `R`, `SH`, `FONT`) + all shared primitives (Button, Card, Badge, DataTable, Stat, etc.)
- `admin-data.jsx` — sample data for every entity (sites, visits, insights, observations, communities, users, notifications)
- `admin-views-a.jsx` — Dashboard, Visits, Sites, Site Detail views
- `admin-views-b.jsx` — Observations, Insights, Communities, Settings views

Open `Admin Console.html` directly in a browser to click through the reference prototype.
