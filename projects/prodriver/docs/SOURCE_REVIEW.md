# ProDriver Sim | Original code inspection and recovery status

Inspected [main.py](https://github.com/EngrKailani/ProDriver-Sim/blob/main/main.py) and archived JSON examples from the connected public repository.

| Item | Status | Evidence |
|---|---|---|
| JSON loading for driver/module | Implemented | `Driver.from_file`, `Module.from_file` |
| I–V lookup and interpolation | Implemented | `build_curve`, `eval_curve`, `Module.forward_voltage` |
| DC electrical power prediction | Implemented | `simulate` computes `V*I` |
| Efficiency lookup and blending | Implemented | `Driver.estimate_efficiency` |
| Input voltage / output limit warnings | Implemented, warnings only | `Driver.check_limits` |
| Module-current limit flags | Implemented, warnings only | `Module.max_module_current` and `simulate` |
| Desktop user interface | Source present, not executed here | PyQt6 `SimulationWindow` |
| Standard-library CLI | Source present, not executed here | `main()` options `--driver`, `--module`, `--current`, `--input-v` |
| Live acquisition of raw grid voltage | Not found | No measurement adapter, sampling or outlier processing |
| Thermal current derating | Not applied | Some JSON curves present, not used in `simulate` |
| Explicit AC loss model | Not found | Input power is calculated as `Pout/eta` |
| Automatic safe current clipping | Not implemented | Out-of-range issues do not modify output power |
| Measured-vs-modeled deviation | Not automated | No lab data ingestion/fit in calculation path |
| Historical calibration / uncertainty data | Not recovered | No traceable original raw measurement package |

## README recovery

The original repository README contained a broken fenced-code block and overstated features beyond the currently public implementation. The original repository README was repaired to use the correct CLI launch command and document present limitations. The original source code itself was **not** modified during this recovery.

## Data handling

Archived public driver/module JSON files are linked, rather than duplicated in this portfolio. The original repository also includes a database file, but the current `main.py` does not query it. Its content has not been used as an evidence source.

Do not equate plotted archived configuration points with newly measured values. Inputs may be historical fit points, vendor typical data, or curated engineering tables; their exact provenance and fit error are not confirmed by the available files.
