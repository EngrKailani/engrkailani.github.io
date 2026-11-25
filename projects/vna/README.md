# Virtual Network Analyzer | Engineering Recovery R1

**Project 11 / 16 | 2025 RF measurements | Source-informed reconstruction**

The existing [portfolio project description](../vna.html) describes MATLAB-assisted two-port RF measurements over **100 MHz to 6 GHz**, 12-term SOLT calibration, and S-parameter visualization. The original MATLAB control code, calibration data, and device-under-test measurements **were not located** in the connected repositories or file library during this pass.

This directory contains **new analysis utilities and engineering documentation**, not recovered original VNA code or measured data.

## Available reconstructed files

| File | What it provides | Evidence |
|---|---|---|
| [MATLAB two-port analysis](analysis/analyze_s2p.m) | Touchstone 1.0 S2P parsing, S11/S21/S12/S22, return loss, VSWR, impedance and plots | Reconstructed; MATLAB execution not yet verified |
| [Python S2P audit](analysis/s2p_audit.py) | Offline two-port parser, S-matrix spectral-gain and reciprocity diagnostics, JSON summary | Reconstructed; 11 synthetic Python tests passed |
| [Unit tests](analysis/test_s2p_audit.py) | RI, MA, DB, units, continuation, validation, passive/gain/reciprocity edge cases | Synthetic, passed |
| [Synthetic example](examples/synthetic_twoport.s2p) | Three artificial records between 0.1 GHz and 6 GHz | Training data, not a measurement |
| [RF calculation notes](docs/RF_METHOD.md) | Equations, Touchstone port ordering, limitations | Derived engineering reference |
| [SOLT reconstruction plan](docs/SOLT_RECOVERY_PLAN.md) | 12-term model concepts and information still required | Proposed verification workflow |
| [Verification matrix](docs/VERIFICATION.md) | Software and physical-instrument checks | Hardware tests pending |

The Python reconstruction additionally exposes `diagnostics.maximum_power_gain`, `diagnostics.passivity_compatible` and `diagnostics.reciprocity_difference_abs` for each record. These are algebraic checks that require an equal real positive reference impedance assumption, not certification of a measured device. See [RF method](docs/RF_METHOD.md) and [verification cases](docs/VERIFICATION.md).

## Run offline Python analysis

```bash
python projects/vna/analysis/s2p_audit.py projects/vna/examples/synthetic_twoport.s2p
python -m unittest discover -s projects/vna/analysis -p "test_*.py" -v
```

To save JSON:

```bash
python projects/vna/analysis/s2p_audit.py measurements.s2p --output summary.json
```

The Python analyzer uses the standard library only. Do not interpret the example's calculated results as historical data or bench-test validation.

## Run the MATLAB reconstruction

With MATLAB's working directory set to `projects/vna/analysis`:

```matlab
r = analyze_s2p('../examples/synthetic_twoport.s2p', true);
disp([r.frequency_Hz/1e9, r.S11_dB, r.S21_dB])
```

The reconstructed MATLAB routine uses base MATLAB operations and does not depend on RF Toolbox. It has **not been executed in MATLAB** in this recovery environment.

## What this reconstruction does NOT do

- Does not reproduce the original instrument's MATLAB remote-control interface.
- Does not solve a two-port 12-term SOLT calibration from raw standard readings.
- Does not certify that imported S2P data were calibrated or acquired between 100 MHz and 6 GHz.
- Does not recover missing measurement files, actual circuit fixture, or original test results.
- Does not make synthetic signals look like original measurements.

If the original hardware model, calibration kit, MATLAB `.m` files or `.s2p` captures are found later, they can be documented separately with authentic provenance.

**Status:** source-informed reconstructed tooling; original instrument validation pending.
