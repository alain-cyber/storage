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
| Tabs | `raw_ads_via` (ViaTrading), `raw_ads_lnow` (LiquidateNow) |
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
| Timezone | Aircall reports timestamps in UTC. The dashboard pins everything that depends on a calendar/clock — daily bucket, hour-of-day, weekday, holiday check — to **Pacific Time** via a single `Intl.DateTimeFormat({ timeZone: 'America/Los_Angeles' })` formatter (`ptCallParts`). |
| Business hours | Mon-Fri **8am–6pm PT**, excluding US federal holidays + day-after-Thanksgiving + Christmas Eve. Holidays are kept as a static `US_HOLIDAYS` set in `cmo/index.html` (~line 2995); update once a year before Q4 of the prior year. Saturday/Sunday holiday observances follow federal convention (Sat → observed Friday, Sun → observed Monday). |
| Missed-call metrics | The `Miss Rate` KPI and the per-line "Worst lines" ranking are computed **only over in-hours calls** — after-hours misses are tracked separately so the rate reflects what the team can act on (staffing / routing). Total call volume KPIs still count all inbound calls. |
| Refresh cadence | Coefficient — TBD: confirm schedule |

### 6. Metricool · Posts (per-post data)

| Field | Value |
| --- | --- |
| Spreadsheet ID | `1ka0jq2aL4FZVBmV-DTMj4Tw2moqRMIqf2En5dq4ho1Q` (Metricool_Social_Data_Template) |
| Tab | `raw_social_post` (resolved by sheet name) |
| Headers row | 1 |
| Source system | **Metricool** export — one row per post (`date, published_at, network, account, account_id, post_type, content_type_normalized, post_id, url, text, campaign, tag, impressions, reach, views, likes, comments, shares, saves, clicks, engagements, engagement_rate, day_of_week, hour, source, raw_json`) |
| Date format quirk | Column A `date` is exported as the broken stub `[object Ob`. The real timestamp lives in column B `published_at` as a serialized struct, e.g. `{dateTime=2026-04-21T23:53:57, timezone=Europe/Madrid}`. `normalizeSocialRows` reads `published_at` first, extracts the inner `dateTime` / `date` substring, then normalizes. |
| Refresh cadence | Metricool's Sheets export — TBD: confirm whether scheduled or manual |
| Brand mapping | All social activity is ViaTrading-only today (LiquidateNow has no social presence). `normalizeSocialRows` tags every row with `brand: 'via'`, so the Liq toggle on the dashboard filters cleanly to empty and the brand-pending banner stays hidden. When LN gets its own Metricool accounts, swap the hardcoded tag for `account`-based inference (see Open Items #4). |
| Replaced | The legacy workbook `1_4zK8GXJeMVtghAPm1APuriEC7GQMRMZPQnEAySPGjk` (gid `1914162846`) on 2026-04-27. Schema added `published_at`, `account`, `account_id`, `content_type_normalized`, `post_id`, `campaign`, `tag`, `views`, `saves`, `clicks`, `engagement_rate`, `day_of_week`, `hour`, `source`, `raw_json` and renamed `engagement` → `engagements`. |

### 6b. Metricool · Account daily (daily snapshots, wide format)

| Field | Value |
| --- | --- |
| Spreadsheet ID | `1ka0jq2aL4FZVBmV-DTMj4Tw2moqRMIqf2En5dq4ho1Q` (same workbook as Posts) |
| Tab | `raw_social_account_daily` (resolved by sheet name) |
| Headers row | 1 |
| Source system | Metricool export — one **wide** row per `(network, date)` with `followers, followers_delta, impressions, reach, profile_views, page_views, video_views, watch_time, likes, comments, shares, clicks, engagements, engagement_rate` as columns. |
| Used for | "Followers", "Followers Growth", "Growth Rate" KPIs on the Social page. Earliest + latest snapshot per network within the active range = absolute and percent growth. |
| Date format | Column A is a real `Date` type (not a string), so the default 60-day gviz `where date >= date 'YYYY-MM-DD'` filter applies cleanly via `dateColumn: 'A'`. |
| Brand mapping | ViaTrading-only today — `normalizeSocialAnalyticsRows` tags every row with `brand: 'via'` for the same reason as the Posts tab. |
| Replaced | The legacy `Analytics` tab on the old workbook on 2026-04-27. Format changed **long → wide** — was one row per `(network, metric, date)` with a `value` column; now metrics are columns. `summarizeSocialAnalytics` was rewritten accordingly; `followers_delta` is exposed for future daily-growth charts. |

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
| Tabs | `kw_via` (ViaTrading), `kw_lnow` (LiquidateNow) |
| Headers row | 1 (no Coefficient banner — direct SemRush export) |
| Source system | SemRush organic keyword export (one row per keyword per day) |
| Columns | `date, keyword, position, url, search_volume, difficulty, position_delta` |
| Refresh cadence | **TBD** — confirm whether scheduled via a SemRush integration, Apps Script pull, or manual paste |
| Notes | Position-delta convention: **negative = improved** (moved up toward #1). The SemRush page surfaces top keywords by volume + biggest gainers/losers. Decisions tag with `source: 'semrush_kw'`. |

### 9. SemRush · Backlinks

| Field | Value |
| --- | --- |
| Spreadsheet ID | `17vtH6XeDzd3O9i3qjNFAL5XESxSYfi15WrszCgq-xeo` |
| Tabs | `bl_via` (ViaTrading), `bl_lnow` (LiquidateNow) |
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
4. **Brand-split for Social** — all rows are now hardcoded `brand: 'via'` because LiquidateNow has no social presence yet. When LN spins up its own Metricool accounts, replace the hardcoded tag in `normalizeSocialRows` / `normalizeSocialAnalyticsRows` with `account`-based inference (mirror the Aircall pattern in `cmo/index.html`).
5. ~~**Aircall hour-of-day in PT** — currently the daily bucket is PT but `isCallInHours` still uses the raw UTC timestamp.~~ **Resolved 2026-04-27.** `isCallInHours` now uses `ptCallParts` for dow/hour/holiday checks; missed-call metrics are filtered to in-hours only.
6. **GA4 export needs a `landingPage` dimension** so the Web page can show "Top 20 landing pages — sessions, conversion rate, W/W" and flag landing pages whose traffic dropped >30% week-over-week. Current GA4 sheet has columns `Date, Total users, Sessions, Channel, Source/Medium, Device, Country, New users, Views, Engagement rate, Avg session duration, Key event count for Form_Submit, Event count` — no page path. **To unblock:** open the Coefficient GA4 connector, edit the report, add `landingPage` (or `pagePath`) as a dimension alongside the existing breakdowns. Once it lands, `summarizeGa` can mirror the new `summarizeGsc` per-page block: group by landing page, sum Sessions and `Key event count for Form_Submit` (= conversions), compute conv rate, and add a W/W delta. Once unblocked, also wire the >30% W/W flag.
7. **404 / de-indexed page detection** — was on the original ask but isn't possible from current data. GSC strips 404s and de-indexed pages invisibly (they just stop appearing). To do this honestly we'd need either a scheduled HTTP-check job writing status codes into a sheet (cheapest: an Apps Script cron over the top-N URLs from GSC), or a Google Indexing API integration. Track whoever owns Page Speed populating (Open Item #3) — they're the natural owner for an HTTP-check job too.

---

_Last updated: 2026-04-27 — Metricool source swap; Aircall in-hours filter; GSC per-page aggregation + indexed-pages KPI; CWV regressions on top pages; site-wide perf split mobile/desktop. Open Items 6 & 7 added (GA4 landingPage dimension + 404 detection)._
