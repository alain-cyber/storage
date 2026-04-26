# CMO Dashboard — System State

Snapshot of every data source the dashboard reads, where it comes from, how
it lands in the spreadsheet, and the cadence the dashboard depends on. Update
this whenever a connector is added, retired, or re-configured.

> **Working agreement for any session that edits `cmo/index.html`:** before
> committing, also append an entry to the `APP_HISTORY` array (search for
> `const APP_HISTORY = [` near the bottom of the file). One entry per logical
> change with `date`, `title`, `tags` (`Feature` / `Polish` / `Fix` /
> `Foundation`), and 1–4 plain-English `bullets`. The "App History" sidebar
> page is the user-visible changelog — it is the only way they see what
> shipped, so commits that skip this leave them in the dark. Multiple commits
> on the same day get separate entries.

The whole dashboard is one HTML file (`cmo/index.html`) that runs in the
browser. There is no backend. Every source listed below is a Google Sheet
fetched directly via the Google Visualization API (gviz) when the page loads.

---

## How the dashboard reads sheets

`cmo/index.html` defines a `SHEETS` object (around line 1820) listing every
connector. For each entry the loader (`fetchSheet` → `loadChannel`) hits:

```
https://docs.google.com/spreadsheets/d/<id>/gviz/tq?tqx=out:json&sheet=<tab>&headers=<n>
```

- The sheet must be shared as **"Anyone with the link — Viewer"** for gviz to
  return data without auth.
- `headers: 2` is set for sheets that have a Coefficient banner row in row 1
  (Coefficient writes a "Last refreshed at …" cell when it pulls). `headers: 1`
  is for hand-managed sheets with no banner (Page Speed today).
- For brand-split sheets, `loadChannel` fetches both tabs in parallel, tags
  each row with `brand: 'via' | 'liq'`, and concatenates so a single in-memory
  table feeds the brand toggle.
- A failed/empty fetch falls back to deterministic mock data (`mockAds`,
  `mockGsc`, …) so the page still renders. The Data Sources page surfaces
  the actual `live` vs. `demo` state per connector.

The dashboard never *writes* to any sheet. It is a read-only view.

---

## Connectors

### 1. Google Ads (campaigns)

| Field | Value |
| --- | --- |
| Spreadsheet ID | `1oR4yEYbOYkzQcOyyMliKe__4KErtKFZyCnGDnjKI_JE` |
| Tabs | `raw_ads_via` (Viatrading), `raw_ads_lnow` (Liquidatenow) |
| Headers row | 2 (Coefficient banner on row 1) |
| Source system | Google Ads → **Coefficient** add-on |
| Refresh cadence | Configured inside Coefficient — TBD: confirm schedule (typical setup: daily at 6am PT). Verify in Coefficient → Schedules. |
| Brand mapping | One tab per brand |

### 2. Google Ads · Keywords

| Field | Value |
| --- | --- |
| Spreadsheet ID | `1YNnopbYftG4CVhcna3mBvfx4WuxrVqNvi_zfAiOkav0` |
| Tabs | `raw_ads_via_kw`, `raw_ads_lnow_kw` |
| Headers row | 2 (Coefficient banner) |
| Source system | Google Ads → Coefficient (keyword grain) |
| Why split from #1 | The combined campaign + keyword sheet hit Google's 10M-cell limit |
| Refresh cadence | Coefficient — TBD: confirm schedule |

### 3. Google Search Console

| Field | Value |
| --- | --- |
| Spreadsheet ID | `1UZ7fp46L83YdPEcjEp7Zdl4-8-taK5zMueZNd1pI7k8` |
| Tabs | `raw_gsc_via`, `raw_gsc_lnow` |
| Headers row | 2 (Coefficient banner) |
| Source system | Search Console → Coefficient |
| Refresh cadence | Coefficient — TBD: confirm schedule (GSC has a ~2-day data delay regardless of pull frequency) |

### 4. Google Analytics 4

| Field | Value |
| --- | --- |
| Spreadsheet ID | `1gZ_ahjqHMMSmqF2av0pOV2nkLj0oA5IVGqTHm6w7_nw` |
| Tabs | `raw_ga4_via`, `raw_ga4_lnow` |
| Headers row | 2 (Coefficient banner) |
| Source system | GA4 → Coefficient |
| Refresh cadence | Coefficient — TBD: confirm schedule |

### 5. Aircall (calls)

| Field | Value |
| --- | --- |
| Spreadsheet ID | `1CGuD9KSonB6wUX-EDJyJKnTdh1a9hQRsRYkLc6b8zc0` |
| Tabs | single source — brand inferred from Number Name + Teams Name |
| Headers row | 2 |
| Source system | Aircall → Coefficient (one row per call, with timestamp + line + team + agent + duration + status) |
| Brand inference | Lines in `LIQ_AIRCALL_LINES` (Justin Prescott / LiquidateNow Department / Ashley Sheppard) and any team matching `/liquidate\s*now|liqnow/i` are tagged `liq`; everything else is tagged `via`. Defined in `cmo/index.html` ~line 1873. |
| Timezone | Aircall reports timestamps in UTC. The dashboard pins the **daily bucket** (`row.Date`) to Pacific Time so a 5pm-PT call doesn't roll into the next UTC day. Hour-of-day and weekday logic still uses the raw UTC timestamp — TODO if the workday breakdown looks off. |
| Refresh cadence | Coefficient — TBD: confirm schedule |

### 6. Metricool (social posts)

| Field | Value |
| --- | --- |
| Spreadsheet ID | `1_4zK8GXJeMVtghAPm1APuriEC7GQMRMZPQnEAySPGjk` |
| Tab / gid | gid = `1914162846` (single tab, shared across brands) |
| Headers row | default (1) |
| Source system | **Metricool** export — one row per post (network, post_type, date, url, text, reach) |
| Refresh cadence | Metricool's Sheets export — TBD: confirm whether scheduled or manual |
| Brand mapping | Currently shared across brands (no per-brand split). When the user toggles to via/liq, the brand-pending banner shows because rows aren't tagged. |

### 7. Page Speed (Lighthouse / Core Web Vitals)

| Field | Value |
| --- | --- |
| Spreadsheet ID | `1f9J-XrnwKDHGRNrrBsApebDp8bBAp5Zh7DjNr5tTd4M` |
| Tabs | `perf_via`, `perf_lnow` |
| Headers row | 1 (no Coefficient banner — hand-managed) |
| Source system | **TBD** — confirm whether populated by a script (Apps Script? cron? Lighthouse CI?) or manually pasted from PSI. The column-alias map covers PSI + Lighthouse exporters and several common header variants (Performance / LCP / CLS / INP / TBT / FCP / Speed Index). |
| Refresh cadence | **TBD** — depends on the populating script |
| Notes | Auto-detects unit conventions: LCP/FCP normalized to **seconds**, INP/TBT to **ms**, Perf Score to 0–100. CWV thresholds (LCP 2.5s, CLS 0.1, INP 200ms, perf 50) feed the rule engine and live in the Thresholds editor. |

### 8. SemRush · Keywords

| Field | Value |
| --- | --- |
| Spreadsheet ID | `1gGFtFMEWL1iqXVn1OVwqPdbrE9tMwg93-i0tbBDkHe8` |
| Tabs | `kw_via` (Viatrading), `kw_lnow` (Liquidatenow) |
| Headers row | 1 (no Coefficient banner — direct SemRush export) |
| Source system | SemRush organic keyword export (one row per keyword per day) |
| Columns | `date, keyword, position, url, search_volume, difficulty, position_delta` |
| Refresh cadence | **TBD** — confirm whether scheduled via a SemRush integration, Apps Script pull, or manual paste |
| Notes | Position-delta convention: **negative = improved** (moved up toward #1). The SemRush page surfaces top keywords by volume + biggest gainers/losers. Decisions tag with `source: 'semrush_kw'`. |

### 9. SemRush · Backlinks

| Field | Value |
| --- | --- |
| Spreadsheet ID | `17vtH6XeDzd3O9i3qjNFAL5XESxSYfi15WrszCgq-xeo` |
| Tabs | `bl_via` (Viatrading), `bl_lnow` (Liquidatenow) |
| Headers row | 1 (no Coefficient banner — direct SemRush export) |
| Source system | SemRush backlink authority snapshot (one row per brand per day) |
| Columns | `date, referring_domains, new_domains, lost_domains, total_backlinks, top_linking_domain_authority` |
| Refresh cadence | **TBD** — confirm the populator and schedule |
| Notes | The dashboard takes the latest row in the active range per brand and compares to the earliest to surface the Δ in referring domains. Decisions tag with `source: 'semrush_bl'`. |

---

## End-to-end data flow

```
                       (per source)
  Google Ads ─┐
  GSC ────────┤
  GA4 ────────┼──► Coefficient (scheduled refresh) ──► Google Sheet ──┐
  Aircall ────┤                                                       │
  Keywords ───┘                                                       │
                                                                      │
  Metricool ────────────► its own scheduled export ──► Google Sheet ──┤
                                                                      │
  Page Speed ───────────► TBD (script or manual) ────► Google Sheet ──┤
                                                                      ▼
                                              gviz public read (no auth)
                                                       │
                                                       ▼
                                            cmo/index.html (browser)
                                                       │
                                                       ▼
                       Dashboard (Decisions, Thresholds, Page Speed, …)
```

Every step from Coefficient/Metricool to the sheet is **outside** this repo.
The only thing in this repo is the read-side: `cmo/index.html`.

---

## Page-level surfaces

| Sidebar entry | Backed by | Notes |
| --- | --- | --- |
| Overview | All channels (KPIs + briefing) | |
| Ads | `ads` | |
| Keywords | `keywords` | |
| SEO | `gsc` | |
| SemRush | `semrush_kw` + `semrush_bl` | One page, two stacked sections (Keywords table + Backlinks KPIs/trend) |
| Web | `ga` | |
| Page Speed | `pagespeed` | |
| Calls | `aircall` | PT-pinned daily bucket |
| Social | `social` | |
| Chat | Claude or GPT (model toggle) | Reuses keys saved on the Decisions pages; injects scoped summary as context |
| Decisions from Filters | All summaries → rule engine (`generateActionsFromSummaries`) | Numeric thresholds tunable per brand |
| Decisions from Claude | Same summaries → Anthropic API (browser-stored key) | Cached in localStorage by hash |
| Decisions from GPT | Same summaries → OpenAI Chat Completions (gpt-4o-mini, JSON mode) | Independent cache; same payload as Claude page |
| Thresholds | per-brand editor for every numeric cutoff | Persists to `cmoThresholds_v1` |
| Data Sources | per-connector LIVE / DEMO / FAIL status | First port of call when something looks off |

---

## Open items

1. **Confirm Coefficient schedules** for all 5 Coefficient-fed sheets (ads, keywords, gsc, ga, aircall). The dashboard has no way to enforce a schedule — what you see is whatever Coefficient last wrote.
2. **Confirm Metricool export cadence** for the Social sheet.
3. **Document the Page Speed populator** — whoever set this up needs to record: tool used (Apps Script / GitHub Action / external service), schedule, list of URLs audited, and which device strategies (mobile / desktop / both).
4. **Brand-split for Social** — currently shared. If it should be per-brand, a `brandTabs` split + brand inference is a one-liner (mirror the Ads pattern in `SHEETS`).
5. **Aircall hour-of-day in PT** — currently the daily bucket is PT but `isCallInHours` still uses the raw UTC timestamp. If the in-hours breakdown looks shifted, switch it to PT too. Keep an eye out during the next review.

---

_Last updated: 2026-04-26 — alongside the Page Speed connector + Aircall PT pin commits._
