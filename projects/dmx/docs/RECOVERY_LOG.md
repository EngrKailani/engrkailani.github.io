# DMX Controller | October 2026 recovery log

## Located original artifacts

- Original [DMX Controller GitHub repository](https://github.com/EngrKailani/DMX-Controller).
- Flask server `app.py`, browser `templates/index.html`, UI stylesheet, and original source README.
- Arduino Mega sketch for serial command parsing, DMX512 transmission, scene control and animations.
- Original portfolio page with an embedded generic lighting demonstration video (kept intact).

## Corrections made in the original source repo

- Replaced invalid `fconst` with `const` at the Arduino sketch's first declaration.
- Changed the Flask server default host from `0.0.0.0` to `127.0.0.1`, with optional `DMX_HOST` for intentionally enabled access.
- Added `DMX_ARDUINO_PORT` environment override, default `COM5`.
- Updated README setup and explicit unauthenticated route warnings.

These repairs are source changes, **not proof of a successful compile or a physical fixture demonstration**.

## New portfolio recovery materials

- Architecture, serial/DMX frame and sequence vector diagrams.
- DMX channel/byte/timing source-based calculations.
- New offline JavaScript reference model and 13 synthetic tests.
- Reconstructed verification matrix, source/security review and calculated scene byte CSV.

## Missing or not verified

Exact Arduino board/toolchain build, RS-485 hardware schematic, physical DMX output signals, fixture DMX personality and actual address, calibrated electrical/optical currents and flux, scene latency, repeatability, and original lab measurements.

The embedded demonstration video is preserved but not described as a timestamped, metrologically validated DMX test.

**Provenance rule:** Preserve distinction between original code, a source fix, and newly constructed models/diagrams. No measurement data were invented.
