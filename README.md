# GMP+ Data Quality app (DQ app)

The central app for the GMP+ International Data Quality Project. One place to
capture use cases, score them on business impact and IT / Data difficulty, and
see them on a quadrant so MT, SMEs, and Certification Bodies can align on
what to act on next.

The app replaces a patchwork of Word documents, Excel sheets, PowerPoint decks,
and scattered Jira tickets with a single source of truth. Everything lives in
`localStorage`; export and restore through JSON backups.

## Live URL

https://rvd-gmpplus.github.io/dq-app/

## Screens

- **Dashboard**: four KPIs, a mini quadrant, quadrant distribution, current
  phase deliverables, budget burn, and recent activity.
- **Use cases**: sortable filterable list with URL-synced filters, bulk
  status change, new-use-case sheet, inline-edit detail across three tabs
  (Overview, Scoring with live radar, History and comments).
- **Quadrant**: custom interactive SVG. Hover, click, drag to rescore.
  PNG and PDF export. Colour-blind pattern fallback. BCG-label and
  group-by-pillar toggles.
- **Strategic pillars**: three priority-ordered tiles with editable
  ambition, OGSM targets, and the Data Vision legacy mapping.
- **Phases**: custom SVG Gantt with planned versus actual bars, a NOW
  marker, and per-phase accordion for deliverables and blockers.
- **Data governance**: interactive RACI matrix (R, A, C, I, blank per
  cell) plus Data Governance Group roster.
- **Risks**: 5 × 5 heatmap and editable register. Scores recompute as
  likelihood × impact on save.
- **Stakeholders**: filterable card grid with initials avatars.
- **Exports and backup**: full JSON backup and restore, CSV export for
  Excel, and the five-page A4 landscape Status Report PDF.
- **Settings**: current user (from stakeholder list or free text), project
  budget, scoring weights with reset, theme, colour-blind mode, BCG labels,
  and a danger-zone reset.

## Tech stack

- Vite 5 + React 18 + TypeScript 5 (strict).
- Zustand for state with a schema-versioned localStorage persistence wrapper.
- Zod for runtime validation (types, store slices, import payloads).
- Tailwind CSS 3 with GMP+ brand tokens (`#6859A7`, `#38B769`, `#EA8004`) and
  Segoe UI at 11pt base.
- React Router 6 in hash-routing mode (GitHub Pages cannot rewrite unknown
  paths, so hashes are the portable choice).
- Recharts for the dashboard donut and the radar on the scoring tab.
- Pure SVG for the quadrant, phases Gantt, and risk heatmap. Custom
  pointer-event drag on the quadrant, no `@dnd-kit` overlay.
- `@react-pdf/renderer` for the Status Report PDF, dynamic-imported so it
  stays out of the initial bundle.
- `html2canvas` + `jsPDF` for the quadrant PNG and PDF export, also dynamic-
  imported.
- Vitest + React Testing Library.

## Stack deviations (justified)

The build prompt specified a specific stack and asks that any deviation is
justified. Four deviations stand against the prompt:

### shadcn/ui is not installed

**Prompt:** "Styling: Tailwind CSS + shadcn/ui".

**What we shipped:** hand-rolled Tailwind primitives (custom `Dialog`,
`Sheet`, `Popover`, `Tabs`, `ConfirmTypedDialog`, `EmptyState`, `KPITile`,
badges, filter chips). Every primitive lives in `src/components/common/`
or next to its feature.

**Why:** the dialog and sheet count in v1 is small (five modals total).
Hand-rolling them with a shared `useFocusTrap` hook stays under 500 lines,
ships zero extra dependency weight, and keeps focus behaviour under our
direct control. Installing shadcn would add the Radix UI dependency graph
and a copy of every primitive into `src/components/ui/`. Net-zero user-
visible difference for v1.

**When to revisit:** if we add more than a handful of new modal or form
surfaces in v1.1, swap to shadcn for long-term maintainability (Radix has
audited accessibility, upgrades are one `npx shadcn add ...` away). The
migration is mechanical: ~2-3 hours to swap each custom primitive for its
shadcn equivalent and delete `useFocusTrap`.

### react-hook-form is not used

**Prompt:** "Forms: react-hook-form + zod for validation".

**What we shipped:** plain React state in `UseCaseForm` (five fields) and
in `OverviewTab` (per-field inline edit with blur-to-commit). Validation
happens at the store boundary with the Zod schemas in `src/types/`.

**Why:** `OverviewTab` is inline-edit-per-field, not "submit one big form",
so react-hook-form adds indirection rather than subtracting it.
`UseCaseForm` is small enough that `useState` plus a submit handler reads
cleaner than wiring up `useForm` and `register`. Runtime validation still
runs through Zod via the types / store layer, so the validation contract
the prompt cares about is intact.

**When to revisit:** if we add richer forms (stakeholder add/edit,
per-pillar edit, OGSM target editor), introduce react-hook-form at that
moment. Leaving the dependency installed under `package.json` so the
introduction is a simple `import` in the file that needs it.

### @dnd-kit is not wired to the quadrant drag

**Prompt:** "Drag-and-drop: @dnd-kit/core for the quadrant".

**What we shipped:** native SVG pointer events on the bubble `<circle>`
elements in `QuadrantChart.tsx`. `onPointerDown` captures the pointer,
`onPointerMove` tracks the cumulative delta, `onPointerUp` converts back
to chart coordinates and dispatches the drop event that opens the
`RescorePopover`. Works on mouse, pen, and touch.

**Why:** @dnd-kit is designed to drag DOM elements between drop zones.
Our use case is a single-element free drag inside a fixed plot area,
expressed directly as pointer math on the SVG. The native-event version
is around 60 lines and has no library overhead. It also avoids the
common SVG-with-dnd-kit pattern of rendering an HTML overlay above the
SVG with absolutely-positioned drag handles, which duplicates the bubble
render tree and complicates the DOM.

**When to revisit:** if WCAG keyboard-drag support becomes a requirement
(rescore via arrow keys), swap to @dnd-kit's `KeyboardSensor`. The
current interaction is mouse-and-touch only. The dependency remains
installed so the swap is isolated to one component.

### Recharts is used only partially

**Prompt:** "Charts: Recharts (quadrant scatter, heatmap, donut, radar)".

**What we shipped:**
- **Recharts** for the dashboard donut (`QuadrantDonut`) and the scoring-
  tab radar (`ImpactRadar`).
- **Pure SVG** for the quadrant (`QuadrantChart`), the phases Gantt
  (`PhaseTimeline`), and the risk heatmap (`RiskHeatmap`).

**Why:** Recharts excels at standard cartesian and polar charts driven
from a data array. It fights us on three of our four visualisations:

- The quadrant needs custom bubble rendering (pattern fallback for
  colour-blind mode, pillar-coloured rings, native drag) that Recharts
  exposes only via `<Scatter shape={...}>` with awkward ref forwarding.
- The phases view needs a Gantt layout with planned-vs-actual sub-bars
  and a "NOW" reference line. Recharts has no Gantt primitive; faking
  one with a horizontal stacked `BarChart` is less readable than the
  75-line SVG we have.
- The risk heatmap is a 5 x 5 grid of tinted cells with a variable
  number of risk bubbles per cell. Recharts would model this with a
  matrix of `ReferenceArea` plus a nested `ScatterChart`; the direct
  SVG version is clearer.

Using the right tool per view keeps the bundle reasonable (Recharts is
a 348 KB chunk that only loads on pages that import it) and gives us
pixel-level control where we need it.

**When to revisit:** if a future contributor needs a new chart type that
Recharts handles well (trend line, stacked bar, area chart), use
Recharts. The current mix is intentional, not accidental.

## Local development

```bash
npm install
npm run dev        # http://localhost:5173
npm run lint       # tsc --noEmit
npm test           # vitest
npm run build      # vite production build
npm run preview    # serve the built dist/ locally
```

## Repository layout

```
src/
├── types/           zod schemas + inferred types for every domain entity
├── stores/          zustand stores (one per domain) with persistence
├── lib/             pure functions: scoring, persistence, exporters, etc.
├── components/      UI, one folder per feature area
├── pages/           route roots; compose components, read stores
├── seed/            first-run seed data for every store
└── hooks/           small react hooks (useFirstRun, useUrlFilters, ...)

scripts/
├── extract_use_cases.py  reads USE-CASES/*.pptx into a local draft JSON
└── prep_logos.py         processes public/originals/*.png transparency
```

## Data model

The core entity is `UseCase`. Each use case carries scoring sub-scores
(integer 1 to 5) on two axes, plus pillar tags, description fields from
TRIMM's template, linkages (data objects, Jira keys, phases, attachments),
and an audit trail (history with field-level diffs, plus comments).

Supporting entities: `Phase` × 5, `Risk`, `Stakeholder`, `DataObject`,
`RaciAssignment`, `PillarMetadata`, `Settings`. See `src/types/` for the
full Zod schemas.

## Backup and restore

Everything lives in your browser. Export a JSON backup on a schedule that
matches your risk tolerance (weekly is reasonable). The Exports and backup
screen has three buttons:

- **JSON backup**: every store, losslessly.
- **CSV**: flat table of every use case for Excel work.
- **Status Report PDF**: five-page branded report for MT updates.

Restore via the same screen by choosing a JSON file. The app asks you to
type REPLACE in a confirmation dialog before overwriting local state.

## Deployment

GitHub Pages is enabled on `rvd-gmpplus/dq-app`. Every push to `v1` runs
the deploy workflow, which lints, tests, builds, and publishes the `dist/`
folder to Pages. Pushes to `main` run CI only (no deploy), so `main` stays
frozen at the v1.0 release commit as a release baseline.

## Known limitations

- **Desktop-first (≥1024px).** Mobile is explicitly not a v1 target; below
  1024px the app renders a graceful full-screen notice rather than a cramped
  layout.
- **Single user.** No authentication, no concurrent editing. Changes live
  in one browser profile. Supabase multi-user is on the v1.1+ list.
- **Hash routing.** URLs look like `/dq-app/#/quadrant` because GitHub Pages
  cannot server-rewrite to `index.html`. Internal links still behave as
  expected.
- **PDF fonts.** Microsoft's Segoe UI cannot be embedded in a distributed
  PDF for licensing reasons, so the Status Report PDF renders in **Open
  Sans**, bundled under `public/fonts/` as the closest open-source metric
  analogue. The app UI still uses Segoe UI on Windows (via the CSS font
  stack).

## Roadmap (v1.1 and beyond)

- Figma MCP integration for live design tokens.
- Supabase auth and realtime collaboration.
- Jira live status via the Atlassian Rovo MCP.
- Microsoft Fabric / Power BI embeds on the Dashboard.
- Canva MCP onboarding decks generated from current state.
- Import from the existing `20260317_DataQualP_Use_case_Accounts_draft.xlsx`
  and `Actionlist_data_quality_project.xlsx` workbooks.
- An in-app AI assistant answering questions across the Data Strategy and
  every use case via RAG.

## Contact

Rick van Dijk (IT Lead), project owner.
