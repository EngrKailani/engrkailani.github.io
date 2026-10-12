# HueMotion | Engineering Recovery R1

**Project 14 / 16 | Webcam gesture-controlled RGBW scene concept**

The original [HueMotion application](https://github.com/EngrKailani/HueMotion) has been recovered in its public GitHub repository. This portfolio folder adds **source-inspected documentation, three vector graphics, and a standalone, non-networked gesture policy model**. The original live application is preserved separately. No Casambi credentials, private scene numbers, operational network data, or user recordings are included.

![Source architecture](visuals/architecture.svg)

![Gesture scene mapping](visuals/gesture_scene_map.svg)

![Client-side timing safeguards](visuals/safeguard_timing.svg)

## Original project source and manual

- [Original server, browser interface, and gesture recognition](https://github.com/EngrKailani/HueMotion/blob/main/server.casambi.js), single source file
- [Original README and setup instructions](https://github.com/EngrKailani/HueMotion/blob/main/README.md)
- [Original HueMotion project manual](https://github.com/EngrKailani/HueMotion/blob/main/HueMotion_Manual.pdf)
- [Original portfolio demonstration](../huemotion.html) with an existing video, preserved unchanged
- [Dependencies](https://github.com/EngrKailani/HueMotion/blob/main/package.json): local WebSocket client library `ws`

The original implementation uses MediaPipe Tasks Vision loaded into the browser from a CDN, webcam video, up to two detected hands, and application-defined gesture heuristics. The Node.js server optionally authenticates to a Casambi network and sends scene messages using a WebSocket bridge.

## New reproducibility tools

| File | Purpose | Provenance |
|---|---|---|
| [gesture_policy.cjs](analysis/gesture_policy.cjs) | Independent timing and gesture/scene mapping reconstruction, no network access | New, source-informed |
| [gesture_policy.test.cjs](analysis/gesture_policy.test.cjs) | 11 deterministic tests for mappings and timing | Synthetic tests |
| [Architecture](docs/ARCHITECTURE.md) | Server/browser boundary and original code structure | Source inspection |
| [Gesture specification](docs/GESTURE_MAPPING.md) | Eight original scenes, keys, frame/timing controls | Source inspection |
| [Security review](docs/SECURITY_AND_LIMITATIONS.md) | Why UI opt-in does not restrict HTTP access | Source inspection |
| [Verification matrix](docs/VERIFICATION.md) | Offline checks vs webcam and lighting testing | Status tracking |

## Run the original preview

```bash
git clone https://github.com/EngrKailani/HueMotion.git
cd HueMotion
npm install
node server.casambi.js
```

Browse to `http://localhost:3000`; grant camera permission and choose Start. Use the on-screen preview with Casambi disabled by default. The browser must load the MediaPipe package and trained hand-landmarker model; network access is required for those URLs.

**Security warning:** The original `GET /control?key=...` route has no requester authentication and includes broad CORS headers. The browser's disabled trigger toggle does **not** disable direct server requests. Do not run this service on an untrusted LAN or expose it to the public internet. Do not enable a live lighting bridge until the endpoint is hardened and tested.

## Run the new offline tests

Install Node.js. This does not require the original server, webcam, Casambi credentials or network connection:

```bash
node --test projects/huemotion/analysis/gesture_policy.test.cjs
```

The 11 unit scenarios also passed a JS runtime assertion-harness evaluation during reconstruction. **The full original browser recognition and live Casambi bridge were not tested.** This reconstructed policy module is educational test infrastructure, not a replacement for the original app or a server-side authorization system.

## Source / reconstruction distinctions

Historical **source**: original [HueMotion repository](https://github.com/EngrKailani/HueMotion). New **reconstruction**: diagrams, mapping table, offline state gate, security/verification documents in this directory. Historical performance measurements, classifier accuracy, gesture false-positive rates, and successful scene transitions cannot be inferred solely from code. The original manual is linked rather than republished.

Back to [HueMotion portfolio detail](../huemotion.html).
