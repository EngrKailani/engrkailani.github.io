# DMX Controller | Source-inspected architecture

**Original source:** [app.py](https://github.com/EngrKailani/DMX-Controller/blob/main/app.py), [Arduino sketch](https://github.com/EngrKailani/DMX-Controller/blob/main/LUX_DMX_Controller_Working/LUX_DMX_Controller_Working.ino), and [index.html](https://github.com/EngrKailani/DMX-Controller/blob/main/templates/index.html). This description documents implementation observed in code, not a full hardware validation.

## Control path

1. The Flask application serves a browser page at `/` with scene buttons and brightness input.
2. Browser JavaScript POSTs to `/scene/<scene_name>` or `/brightness/<int:value>`. Scene names are restricted to `red, green, blue, white, gradient, off, demo`; brightness range to integer **0–100**.
3. Flask connects to the configured Arduino serial port (default COM5; `DMX_ARDUINO_PORT` override), 115200 baud; then writes a newline-terminated command.
4. Arduino Mega receives ASCII text through `Serial` at 115200 baud and parses commands after newline.
5. The sketch updates base R/G/B/W channel values, the global dimmer, or its gradient/demo animation state.
6. The DMX array contains **513 slots**. Slot 0 is the start code (0); slots 1–4 hold brightness-scaled RGBW bytes, and the other channel values are zero.
7. `Serial1` transmits DMX on Mega TX1 pin **18**, via an external transceiver/shield. The enable pin is **2**. Framing uses 250,000 baud, **8N2**, a 120 µs BREAK and 16 µs mark-after-break.
8. A connected DMX fixture must be configured for starting address 1 with R/G/B/W channel order to match the intended UI.

## Historical code repaired

- The original committed `.ino` started with `fconst int DMX_TX_PIN = 18;`, which is invalid C++. It now starts with `const int DMX_TX_PIN = 18;`. **No hardware/Arduino build has been performed during recovery**, so this is a source-level fix, not a successful build certification.
- Original Flask `app.run(host="0.0.0.0")` exposed the unauthenticated application to LAN interfaces. It now uses `DMX_HOST` with **127.0.0.1 default**, and uses optional `DMX_ARDUINO_PORT`, so users can change the port without modifying code.

## What original code does NOT establish

- Successful HTTP response does not mean the Arduino acknowledged the command or the fixture changed. It means `serial.write()` did not raise an error.
- DMX frame timing and physical signal voltage were not measured by software; signal integrity and shield wiring must be checked on hardware.
- Driver currents printed in `templates/index.html` are labels. The Arduino sketch outputs **0–255 DMX channel values** and does not sense current, command driver current, or validate the fixture's DMX personality.
- Flask routes have no login, per-user authorization, CSRF token, or request rate limit. Even POST commands are unsafe to expose to untrusted clients.
- The incoming Arduino text buffer grows as a `String` until newline; production firmware should limit command length to avoid uncontrolled memory growth.
- Arduino's `setScene` and brightness handlers send 300 ms of frames synchronously, which may delay parsing of subsequent serial commands.

See [security guidance](SOURCE_AND_SECURITY.md) and [timing equations](DMX_TIMING_AND_MAPPING.md).
