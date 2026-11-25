# Source audit: thermal-logger trend labels

**Reviewed public code:** [`main_ui.pyw`, `update_channel_trends`](https://github.com/EngrKailani/Thermal-Logger/blob/main/main_ui.pyw) and [`logger_core.py`](https://github.com/EngrKailani/Thermal-Logger/blob/main/logger_core.py).  
**Status:** Independent portfolio code review and synthetic edge-case verification, November 2026. The original Python application and its hardware were **not** executed during this review.

## Source-supported behavior

The original logger's display logic stores the latest **up to ten valid readings per channel** by default. The configured trend threshold is **3.0 °C**, interpreted by the algorithm as **maximum minus minimum no greater than 3.0 °C**. The nominal UI polling interval is 1.0 second, but sample counts do not establish an actual acquisition rate. These defaults are taken from `logger_core.py`.

In `main_ui.pyw`, after at least **two** usable values, the display label is chosen using these conditions:

1. If `max(history) - min(history) <= threshold`, label **stable**.
2. Otherwise, if `history[-1] - history[0] > 0`, label **increasing**.
3. Otherwise, if that endpoint difference is negative, label **decreasing**.
4. Otherwise, label **stable** even if the range is greater than the configured threshold.

The original interface presents the threshold as “stable within ±3.0 °C”. The underlying code actually uses **the full observed range**, not a plus-or-minus 3 °C deviation from a target. That display wording can be misleading.

A missing/NaN reading does not clear the channel's prior valid history. If there is an existing history, the prior trend can remain displayed when a new observation is missing. The code also does not require a full ten-reading window before showing a label.

## Source-aligned synthetic test cases

These are newly constructed **software input examples**, not logged temperatures or measured test results.

| Synthetic example | Window values in °C | Original UI label | Independent conservative review |
| --- | --- | --- | --- |
| Two close readings | 40, 40.5 | stable | Insufficient consecutive readings |
| Ten close readings | 40, 40.2, 40.3, 40.1, 39.9, 40.2, 40.1, 40.2, 40.3, 40.1 | stable | Within configured band |
| Ten rising readings | 30 through 39 | increasing | Outside configured band |
| Ten oscillating, equal endpoints | 40, 44, 35, 40, 39, 38, 40, 40, 40, 40 | **stable** | **Outside configured band (9 °C spread)** |
| Ten steady readings, then missing | Ten 40s, followed by a missing observation | stable (retained) | Missing latest reading |

The source label “stable” describes only this UI algorithm. It does **not** prove equilibrium, negligible drift, measurement calibration or acceptable test conditions.

## Proposed stronger review rule, not shipped in the original logger

A separate code review might require **ten consecutive finite observations**, no missing latest reading and a **maximum-minus-minimum range within the configured band** before marking a window *within band*. That review state should not be described as an independently validated temperature equilibrium.

This stricter comparison is provided only as an illustrative **proposed verification policy** in the portfolio's code review. It is **not** a description of what the historic software or hardware was changed to do.

## Reproducibility

Run `node scripts/thermal-trend-source-check.js` from the portfolio repository. This dependency-free JavaScript checker recreates the original label decision for finite numeric readings and missing-value markers. It exercises 10 named edge cases plus bounded-window, invalid configuration and empty-history checks.

It does not execute `main_ui.pyw`, exercise the Pico TC-08 driver, verify thermocouple accuracy, recover Arduino firmware, infer timestamps or prove timing consistency.

## Outstanding validation

- Recover representative time-stamped, releasable measurements, if authorized, and verify the physical sensor path with calibrated equipment.
- If the logger is revised, explicitly define what the display should mean by *stable*, including full-window requirements, stale/missing readings, sensor uncertainty and allowed thermal drift.
- Test the revised implementation in isolation before integrating it with hardware, with safety controls reviewed independently.
