# ProDriver Sim | Engineering Recovery R1

**Project 13 / 16 · Electrical simulation · Recovered original source, new supporting analysis**

The [original ProDriver Sim application](https://github.com/EngrKailani/ProDriver-Sim) survives in its own GitHub repository, including `main.py`, driver/LED module JSON profiles, and a desktop GUI. This directory contains **new source-informed documentation, diagrams, cross-checking utilities, and tests** for the engineering portfolio. It intentionally does not duplicate company configuration files or a potentially sensitive calibration database.

## Architecture and public configuration plots

![ProDriver source-inspected architecture](visuals/model_architecture.svg)

![Archived LED module current-voltage lookup curves](visuals/module_iv_profiles.svg)

![Archived driver efficiency lookup curves](visuals/driver_efficiency_reference.svg)

The plots visualize public archived JSON **profile values**. These curves are not new bench measurements, proof of fitting accuracy, or evidence that the actual fixtures were tested during recovery.

## Recovered source

| Original source | Content |
|---|---|
| [main.py](https://github.com/EngrKailani/ProDriver-Sim/blob/main/main.py) | JSON parsing, interpolation, electrical power model, operating limit checks, CLI, and PyQt6 UI |
| [BST1.json](https://github.com/EngrKailani/ProDriver-Sim/blob/main/BST1.json) | Archived driver voltage, efficiency and operating-limit parameters |
| [HO7_4800lm.json](https://github.com/EngrKailani/ProDriver-Sim/blob/main/HO7_4800lm.json) | Archived 4800 lm module reference curves |
| [HO7_6400lm.json](https://github.com/EngrKailani/ProDriver-Sim/blob/main/HO7_6400lm.json) | Archived 6400 lm module reference curves |

## Newly reconstructed engineering files

- [Model equations](docs/MODEL_EQUATIONS.md): module I–V interpolation, estimated efficiency blending, power balance and example calculations.
- [Source review and limitations](docs/SOURCE_REVIEW.md): confirmed features vs missing implementation and source caveats.
- [Verification matrix](docs/VERIFICATION.md): eight synthetic tests and required future comparison with hardware data.
- [Recovery status](docs/RECOVERY_LOG.md): recovered source vs missing measurements.
- [Independent Python reference checker](analysis/model_audit.py) and [unit tests](analysis/test_model_audit.py).
- [Nominal calculated examples](analysis/profile_nominal_examples.csv), **not measured performance**.

## Run the original application

```bash
git clone https://github.com/EngrKailani/ProDriver-Sim.git
cd ProDriver-Sim
python main.py --driver BST1.json --module HO7_4800lm.json --current 0.6 --input-v 120
```

For the PyQt6 GUI: `python -m pip install PyQt6`, then `python main.py`.

## Run the independent reference calculator

From the portfolio checkout, point the utility to files in your *separate* original ProDriver Sim clone:

```bash
python projects/prodriver/analysis/model_audit.py --driver ../ProDriver-Sim/BST1.json --module ../ProDriver-Sim/HO7_4800lm.json --current 0.6 --input-v 120
cd projects/prodriver/analysis
python -m unittest -v
```

The new checker is a **reimplementation of a deterministic subset**, not the original source and not proof that the original application is validated. It uses Python standard library only.

## Provenance and restrictions

Simulation output is a prediction. The original archived curves were not independently traced to calibration records; company internal test data were not accessed or copied. Current `simulate()` **flags** out-of-range voltage, current and power rather than automatically limiting the output. Do not use an `OK` result as a safety certification, device approval, or replacement for measured performance.

Back to [portfolio case study](../prodriver.html).
