/**
 * PageSpeed Insights -> Google Sheet
 *
 * Setup:
 *   1. Create a new Google Sheet.
 *   2. Extensions > Apps Script, paste this file in as Code.gs.
 *   3. Run `setup()` once to create the "Config", "Results", and "Latest" tabs.
 *   4. Edit the "Config" tab — add one URL per row, set strategy to mobile/desktop/both.
 *   5. (Optional) In Apps Script: Project Settings > Script Properties, add
 *        PSI_API_KEY = <your key>.  Unauthenticated calls work but are rate limited.
 *   6. Run `runPageSpeed()` to append a row per URL/strategy into "Results".
 *   7. Triggers > Add Trigger > runPageSpeed, time-driven, e.g. daily.
 */

const SHEET_CONFIG = 'Config';
const SHEET_RESULTS = 'Results';
const SHEET_LATEST = 'Latest';

const RESULT_HEADERS = [
  'Timestamp',
  'URL',
  'Strategy',
  'Performance Score',
  'Accessibility Score',
  'Best Practices Score',
  'SEO Score',
  'LCP (s)',
  'FCP (s)',
  'CLS',
  'TBT (ms)',
  'Speed Index (s)',
  'TTI (s)',
  'Server Response (ms)',
  'Total Bytes (KB)',
  'Error',
];

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const config = getOrCreateSheet_(ss, SHEET_CONFIG);
  if (config.getLastRow() === 0) {
    config.getRange(1, 1, 1, 2).setValues([['URL', 'Strategy (mobile|desktop|both)']]);
    config.getRange(2, 1, 1, 2).setValues([['https://www.example.com/', 'both']]);
    config.setFrozenRows(1);
    config.getRange('A1:B1').setFontWeight('bold');
    config.autoResizeColumns(1, 2);
  }

  const results = getOrCreateSheet_(ss, SHEET_RESULTS);
  if (results.getLastRow() === 0) {
    results.getRange(1, 1, 1, RESULT_HEADERS.length).setValues([RESULT_HEADERS]);
    results.setFrozenRows(1);
    results.getRange(1, 1, 1, RESULT_HEADERS.length).setFontWeight('bold');
  }

  const latest = getOrCreateSheet_(ss, SHEET_LATEST);
  if (latest.getLastRow() === 0) {
    latest.getRange(1, 1, 1, RESULT_HEADERS.length).setValues([RESULT_HEADERS]);
    latest.setFrozenRows(1);
    latest.getRange(1, 1, 1, RESULT_HEADERS.length).setFontWeight('bold');
  }
}

function runPageSpeed() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const config = ss.getSheetByName(SHEET_CONFIG);
  const results = ss.getSheetByName(SHEET_RESULTS);
  const latest = ss.getSheetByName(SHEET_LATEST);
  if (!config || !results || !latest) {
    throw new Error('Sheets missing — run setup() first.');
  }

  const rows = config.getRange(2, 1, Math.max(0, config.getLastRow() - 1), 2).getValues();
  const targets = [];
  rows.forEach(([url, strategy]) => {
    if (!url) return;
    const s = String(strategy || 'both').toLowerCase().trim();
    const list = s === 'both' ? ['mobile', 'desktop'] : [s];
    list.forEach(st => targets.push({ url: String(url).trim(), strategy: st }));
  });

  if (!targets.length) {
    throw new Error('No URLs in Config tab.');
  }

  const now = new Date();
  const newRows = targets.map(t => {
    try {
      return rowFromPsi_(now, t.url, t.strategy, fetchPsi_(t.url, t.strategy));
    } catch (e) {
      return emptyRow_(now, t.url, t.strategy, e && e.message ? e.message : String(e));
    }
  });

  results.getRange(results.getLastRow() + 1, 1, newRows.length, RESULT_HEADERS.length).setValues(newRows);
  refreshLatest_(latest, results);
}

function fetchPsi_(url, strategy) {
  const key = PropertiesService.getScriptProperties().getProperty('PSI_API_KEY');
  const params = [
    'url=' + encodeURIComponent(url),
    'strategy=' + encodeURIComponent(strategy),
    'category=performance',
    'category=accessibility',
    'category=best-practices',
    'category=seo',
  ];
  if (key) params.push('key=' + encodeURIComponent(key));
  const endpoint = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed?' + params.join('&');
  const res = UrlFetchApp.fetch(endpoint, { muteHttpExceptions: true });
  const code = res.getResponseCode();
  const body = res.getContentText();
  if (code !== 200) {
    let msg = 'HTTP ' + code;
    try {
      const j = JSON.parse(body);
      if (j.error && j.error.message) msg += ': ' + j.error.message;
    } catch (_) { /* ignore */ }
    throw new Error(msg);
  }
  return JSON.parse(body);
}

function rowFromPsi_(timestamp, url, strategy, psi) {
  const lr = psi.lighthouseResult || {};
  const cats = lr.categories || {};
  const audits = lr.audits || {};

  const score = c => (c && typeof c.score === 'number' ? Math.round(c.score * 100) : '');
  const sec = a => (a && typeof a.numericValue === 'number' ? +(a.numericValue / 1000).toFixed(2) : '');
  const ms = a => (a && typeof a.numericValue === 'number' ? Math.round(a.numericValue) : '');
  const raw = a => (a && typeof a.numericValue === 'number' ? +a.numericValue.toFixed(3) : '');
  const kb = a => (a && typeof a.numericValue === 'number' ? Math.round(a.numericValue / 1024) : '');

  return [
    timestamp,
    url,
    strategy,
    score(cats.performance),
    score(cats.accessibility),
    score(cats['best-practices']),
    score(cats.seo),
    sec(audits['largest-contentful-paint']),
    sec(audits['first-contentful-paint']),
    raw(audits['cumulative-layout-shift']),
    ms(audits['total-blocking-time']),
    sec(audits['speed-index']),
    sec(audits['interactive']),
    ms(audits['server-response-time']),
    kb(audits['total-byte-weight']),
    '',
  ];
}

function emptyRow_(timestamp, url, strategy, errMsg) {
  return [timestamp, url, strategy, '', '', '', '', '', '', '', '', '', '', '', '', errMsg];
}

function refreshLatest_(latest, results) {
  const last = results.getLastRow();
  if (last < 2) return;
  const data = results.getRange(2, 1, last - 1, RESULT_HEADERS.length).getValues();
  const byKey = {};
  data.forEach(r => {
    const key = r[1] + '|' + r[2];
    const prev = byKey[key];
    if (!prev || new Date(r[0]) > new Date(prev[0])) byKey[key] = r;
  });
  const rows = Object.values(byKey);
  const existing = latest.getLastRow();
  if (existing > 1) latest.getRange(2, 1, existing - 1, RESULT_HEADERS.length).clearContent();
  if (rows.length) latest.getRange(2, 1, rows.length, RESULT_HEADERS.length).setValues(rows);
}

function getOrCreateSheet_(ss, name) {
  return ss.getSheetByName(name) || ss.insertSheet(name);
}
