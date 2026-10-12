# HueMotion engineering recovery log

## Recovered original materials

- [Original public HueMotion repository](https://github.com/EngrKailani/HueMotion)
- Single-file Node HTTP server and embedded HTML/CSS/browser JavaScript (`server.casambi.js`).
- Webcam-based MediaPipe Tasks Vision 21-landmark hand tracking (up to two hands).
- Eight gesture mappings, RGBW preview states, stabilization and dispatch logic.
- Optional `ws` WebSocket transport and Casambi API session flow.
- Original PDF user manual, already available in the public source repo.
- Existing portfolio page and embedded video retained.

## Newly created during this recovery

- Architecture vector diagram, eight-scene RGBW mapping figure, safeguards timing figure.
- Source audit, engineering mapping, security review, verification matrix.
- Pure offline gesture timing/mapping `CommonJS` module and 11 synthetic unit tests.
- Original-repo README warning for unauthenticated scene endpoint and new `.gitignore` to help avoid future credential commits.

## Still unavailable or not established

- Camera recognition accuracy/false-positive rates, user study or latency measurements.
- Verified scene responses from a physical Casambi network, device logs or authenticated production test account.
- Original classifier development dataset, threshold-tuning test matrix, hardware rig or numerical timing validation.
- Any evidence of server-side authentication or enforced opt-in in the original code (the source does not include these protections).

## Publishing rules

No real `.env`, Casambi API key, password, customer network identifier, private configuration, recorded webcam footage or internal corporate files will be copied to the public portfolio. The original team/app source stays in its existing repository, with links rather than copied code or binaries.

**Status:** Source recovery plus offline reconstruction, not a deployment certificate or live Casambi commissioning test.
