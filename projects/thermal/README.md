# Thermal Controller & Logger | Engineering Recovery

**Project 10 of 16 · 2025–2026 · Test automation**

This is an **engineering recovery package** for the original Thermal Controller & Logger. The [original Python source](https://github.com/EngrKailani/Thermal-Logger) survives and is maintained in its own repository; it is **not copied into the portfolio repo**.

## Recovered source

| Component | Original file |
|---|---|
| Desktop GUI and acquisition coordinator | [main_ui.pyw](https://github.com/EngrKailani/Thermal-Logger/blob/main/main_ui.pyw) |
| Thermocouple acquisition | [tc08_interface.py](https://github.com/EngrKailani/Thermal-Logger/blob/main/tc08_interface.py) |
| Arduino serial controls | [logger_core.py](https://github.com/EngrKailani/Thermal-Logger/blob/main/logger_core.py) |
| Graphical trends | [graph_window.py](https://github.com/EngrKailani/Thermal-Logger/blob/main/graph_window.py) |
| Original setup documentation | [README.md](https://github.com/EngrKailani/Thermal-Logger/blob/main/README.md) |

The original source reads up to eight thermocouple channels, optionally includes the cold-junction channel, manages setpoints over an optional Arduino serial link, displays channel trends, and records tests to CSV and optionally Excel.

## Newly reconstructed materials

- [Architecture and calculations](docs/ARCHITECTURE.md), derived by source inspection.
- [Verification matrix](docs/VERIFICATION_MATRIX.md), with all physical tests marked **not yet rerun**.
- [Recovery status and risks](docs/RECOVERY_LOG.md), including areas that need original hardware or files.
- [Standalone CSV audit tool](analysis/thermal_csv_audit.py) and [synthetic unit tests](analysis/test_thermal_csv_audit.py), created during recovery.

### Offline CSV audit

Python 3.10+; no Pico TC-08, DLL, Arduino or third-party libraries needed:

```bash
python projects/thermal/analysis/thermal_csv_audit.py path/to/existing-test.csv --window 10 --band-c 3.0 --output audit.json
python -m unittest discover -s projects/thermal/analysis -p "test_*.py" -v
```

The audit summarizes valid readings, means, spans, sample standard deviation, and last-window stability from existing CSV logs. It **does not** calculate actual sample rate, infer measurement accuracy, or invent lost test data. Four synthetic unit tests were run successfully during reconstruction.

## Limitations and attribution

This folder contains **new source-inspection documents and an offline audit tool**, not fabricated results. No real hardware testing, calibration, or proprietary data recovery was performed during this pass.

The original tool was developed for engineering thermal validation at LUX Dynamics. Confidential raw test data, internal reports, and Arduino firmware not present in the public source are not included.

Back to [Thermal Controller & Logger portfolio page](../thermal.html).
