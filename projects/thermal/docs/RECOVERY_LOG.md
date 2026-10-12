# Thermal Logger | Source recovery log

**Project:** 10 / 16 on the engineering portfolio. **Recovery pass:** 2026-10-11.

## Located original source

[Original repository](https://github.com/EngrKailani/Thermal-Logger) with:
- `main_ui.pyw`: full Tkinter test configuration/acquisition/export interface.
- `logger_core.py`: Arduino transport and shared trend/sample settings.
- `tc08_interface.py`: Pico TC-08 driver wrapper.
- `graph_window.py`: live multichannel graph.
- `LUX_Thermal_Logger.spec`: PyInstaller specification.
- Vendor DLL and icon in the source repo, **not replicated here**.

**README problem found and corrected:** Prior setup text referred to a nonexistent `main_logger.py`, `run_logger.bat`, and a differently named GitHub repository. The corrected source README now points to `py main_ui.pyw` and documents Windows driver requirements.

## Reconstructed now

- Descriptive architecture with explicit driver, acquisition, graph and output boundaries.
- Data format and original stability-rule explanation.
- Offline CSV integrity/statistics tool independent of hardware, plus four synthetic passing unit tests.
- Verification matrix separating source inspection from physical validation.

## Still missing or unverified

1. Arduino source sketch, controller wiring, pin maps and final electrical schematic.
2. Verified driver/bitness environment or application executable from original deployment.
3. Original raw thermal test data and any internal traceability records.
4. Calibration certificates and numerical uncertainty budget.
5. Physical measurements for startup, controller response, sampling jitter and failure recovery.
6. Actual screenshots of the original running application and instrument setup.

## Release boundaries

Only public application source links, new recovery notes, and new offline analysis source should be published. Do not upload company records, proprietary test logs, or unverified measurement outputs.

**No claims of restored original measurements or bench validation.** Subsequent testing can be appended with labeled provenance.
