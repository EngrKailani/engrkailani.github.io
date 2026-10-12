# Electrical model and reproducible engineering calculations

**Original source reviewed:** [ProDriver-Sim/main.py](https://github.com/EngrKailani/ProDriver-Sim/blob/main/main.py), with publicly committed \`BST1.json\`, \`HO7_4800lm.json\`, and \`HO7_6400lm.json\`.

This document describes behavior implemented in the currently available code. It does **not** claim validated simulation-to-bench correlation.

## Module voltage from an I–V table

The source reads an LED module's \`series_count\`, \`parallel_count\` and \`iv_curve_led\` table. For a commanded module current \(I_m\), equal-current parallel strings are approximated by:

\[
I_{\mathrm{string}}=\frac{I_m}{N_p},\qquad
V_m=N_s V_f(I_{\mathrm{string}})
\]

where \(V_f\) comes from piecewise-linear interpolation, not a semiconductor diode-equation solve. The current source code **clamps to the nearest first/last table point** outside the known table current span; it does not extrapolate. Other voltage fallbacks exist if curves are absent.

## Electrical output and input estimates

\[
P_{\mathrm{out}}=V_m I_m,\qquad P_{\mathrm{in,estimated}}=\frac{P_{\mathrm{out}}}{\eta_{\mathrm{estimated}}}.
\]

The driver's estimated efficiency uses up to three lookup families:

1. \(\eta_{\mathrm{power}}(P_{\mathrm{out}})\).
2. \(\eta_{\mathrm{voltage}}(V_m)\), selecting an archived \`120 V\` curve below 200 V input, or \`277 V\` curve at and above 200 V.
3. \(\eta_{\mathrm{load}}(100P_{\mathrm{out}}/P_{\max})\).

The implementation prioritizes the power curve if present, forms the mean of other available curves, and blends those estimates according to \`efficiency_blend_weight\`. With no candidates it defaults to **0.85**, and with candidates the result is clamped to **0.50 to 0.98**. This is a heuristic estimator, **not** a full first-principles loss model. The 200 V switch is a software branch, not a continuous mains dependence.

## Nominal calculated examples

Using the source's public **BST1** driver configuration and nominal module values:

| Module configuration | Input voltage | Nominal module current | Lookup module voltage | Calculated Pout | Estimated efficiency | Estimated Pin |
|---|---:|---:|---:|---:|---:|---:|
| HO7 4800 lm | 120 V | 0.600 A | 44.70 V | 26.82 W | ~88.34% | ~30.36 W |
| HO7 6400 lm | 120 V | 0.800 A | 44.70 V | 35.76 W | ~88.86% | ~40.24 W |

These numbers are **new calculations on archived configuration tables, not historic bench results**. They are below the earliest \`efficiency_vs_output_power\` source table point (38.5 W), so the source's curve endpoint-clamping changes their estimates. That **limits confidence** in the efficiency result at these operating points.

The module's public names include lumen suffixes, but this simulation's \`simulate()\` does not calculate optical lumen output or a full electro-thermal lumen maintenance curve.

## Model boundary and caveats

- \`Driver.check_limits()\` returns issue strings for input voltage, load voltage, and maximum output power; the main calculation does **not** reduce current to bring the driver into range.
- The module may additionally flag total current or current-per-LED limitations, but it still reports a predicted operating point.
- JSON curves such as \`current_derating_vs_temp\`, \`thermal_derating\`, and \`efficiency_vs_current\` are stored in some public profile files but are not applied in the currently reviewed \`simulate()\` path.
- No randomized input mains voltage, probabilistic grid variation, AC resistive losses, or automated raw-lab-data correlation is implemented in this source snapshot.
- The simulation does not compute driver junction temperature, lifetime, PCB losses, optical distribution, or calibration uncertainty.

For validation, compare the predictions against a verified power analyzer, V/I instrumentation and appropriate temperature measurements at each intended operating condition. Confirm the driver part number and module profiles correspond to the real fixture, and record input voltage, current, output voltage, fixture temperature, output power, input power, efficiency, and calibrated uncertainty.
