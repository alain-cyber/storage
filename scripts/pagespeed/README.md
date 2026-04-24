# PageSpeed Insights -> Google Sheet

An Apps Script that polls the [PageSpeed Insights API](https://developers.google.com/speed/docs/insights/v5/get-started) for a list of URLs and appends the results to a Google Sheet.

## Setup

1. Create a new blank Google Sheet.
2. `Extensions` > `Apps Script`. Delete the stub `Code.gs`, paste in `Code.gs` from this folder. Save.
3. (Optional, recommended) Get a free PSI API key at <https://developers.google.com/speed/docs/insights/v5/get-started#key> and add it under `Project Settings` > `Script Properties` as `PSI_API_KEY`. Without a key you may hit rate limits.
4. Back in the editor, run `setup` once. Authorize when prompted. This creates three tabs:
   - **Config** — one row per URL. Column B is `mobile`, `desktop`, or `both`.
   - **Results** — append-only history, one row per URL/strategy/run.
   - **Latest** — most recent row per URL/strategy, auto-refreshed each run.
5. Edit **Config** with the URLs you want to track.
6. Run `runPageSpeed` to populate the sheet.
7. `Triggers` (clock icon on the left) > `Add Trigger`:
   - Function: `runPageSpeed`
   - Event source: `Time-driven`
   - Type: e.g. `Day timer`, pick an hour.

## Columns written

`Timestamp | URL | Strategy | Performance | Accessibility | Best Practices | SEO | LCP (s) | FCP (s) | CLS | TBT (ms) | Speed Index (s) | TTI (s) | Server Response (ms) | Total Bytes (KB) | Error`

Category scores are 0–100. Any row where the API call failed has the reason in the `Error` column and the metric columns blank.

## Notes

- PSI calls take ~15-30s per URL/strategy. Apps Script has a 6-minute execution cap, so keep the URL list modest (roughly <10 URLs with `both` strategies).
- The same script can drive a dashboard: point a chart at the **Latest** tab, or use `QUERY` against **Results** for trends over time.
