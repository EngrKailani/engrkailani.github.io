# DMX Controller | Engineering Recovery R1

**Project 15 of 16 · Lighting control · Recovered original source + new engineering documentation**

The original [DMX Controller repository](https://github.com/EngrKailani/DMX-Controller) includes Flask application code, HTML/CSS, and an Arduino Mega DMX transmitter sketch. This portfolio directory contains **new source-inspected documentation, engineering diagrams, an independent offline reference model, and test cases**. No new physical fixture measurements or qualifications have been fabricated.

## Engineering graphics

![Recovered DMX controller architecture](visuals/control_architecture.svg)

![DMX frame timing and channel mapping](visuals/frame_timing.svg)

![Original scene sequence and scaled values](visuals/scene_sequence.svg)

The diagrams are reconstructed from the original public source and **are not photographs or instrument traces**.

## Recovered original files

| Original file | Function |
|---|---|
| [app.py](https://github.com/EngrKailani/DMX-Controller/blob/main/app.py) | Flask routes, COM port setup and newline serial commands |
| [Arduino sketch](https://github.com/EngrKailani/DMX-Controller/blob/main/LUX_DMX_Controller_Working/LUX_DMX_Controller_Working.ino) | DMX frames, RGBW channels, brightness, scene effects |
| [templates/index.html](https://github.com/EngrKailani/DMX-Controller/blob/main/templates/index.html) | Browser controller UI and JavaScript POST actions |
| [static/style.css](https://github.com/EngrKailani/DMX-Controller/blob/main/static/style.css) | Original browser styling |
| [README.md](https://github.com/EngrKailani/DMX-Controller/blob/main/README.md) | User setup guide and updated security notes |

## New recovery files

| File | Description |
|---|---|
| [Architecture](docs/ARCHITECTURE.md) | End-to-end software/hardware structure |
| [Timing and channel calculations](docs/DMX_TIMING_AND_MAPPING.md) | 513-slot frame structure, brightness calculations, animation timing |
| [Security and source limitations](docs/SOURCE_AND_SECURITY.md) | Why localhost-only is safer; documented unsupported features |
| [Verification matrix](docs/VERIFICATION.md) | Synthetic software checks vs hardware validation requirements |
| [Recovery log](docs/RECOVERY_LOG.md) | Original changes and missing data |
| [DMX reference model](analysis/dmx_reference.cjs) | New pure-JavaScript source-informed model, no hardware control |
| [13 offline unit tests](analysis/dmx_reference.test.cjs) | Deterministic checks using synthetic data |
| [Expected byte outputs](data/calculated_scene_values.csv) | Computed RGBW channel bytes, not electrical measurements |

## Original app usage

```powershell
git clone https://github.com/EngrKailani/DMX-Controller.git
cd DMX-Controller
py -m pip install flask pyserial
$env:DMX_ARDUINO_PORT = "COM5"  # Change if necessary
py app.py
```

Open `http://localhost:5000`. The original sketch targets an Arduino Mega-compatible `Serial1` interface on TX1 pin 18, with DMX enable on pin 2 and status LED on pin 13. Compatible RS-485 DMX output hardware and an RGBW fixture are separate hardware requirements.

**The Flask server now binds to 127.0.0.1 by default**. The server routes are unauthenticated; never expose this service to an untrusted LAN or internet-facing address. The original firmware's initial `fconst` typo was corrected directly in its repository; actual compilation and real DMX signaling **have not been tested in this recovery pass**.

## Offline tests

Install Node.js, then run from any checkout of the portfolio:

```bash
node --test projects/dmx/analysis/dmx_reference.test.cjs
```

The 13 tests also passed a JavaScript assertion-harness run during reconstruction. This reference model does not connect to Flask, Arduino or a light fixture and is **not the original firmware**.

## Evidence boundaries

The web page's RGBW output-profile current labels are not measurements made by this code. It controls integer DMX values 0–255; it neither measures lamp current nor reprograms LED driver currents. The Python route's successful response acknowledges **sending serial data**, not verified DMX transmission or an actual light output change.

Back to [DMX Controller portfolio page](../dmx.html).
