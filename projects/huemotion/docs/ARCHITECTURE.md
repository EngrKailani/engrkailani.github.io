# Recovered HueMotion software architecture

**Evidence:** Original public [server.casambi.js](https://github.com/EngrKailani/HueMotion/blob/main/server.casambi.js) and README. This is an analysis of surviving source, not a live system test.

## Processing stages

1. Browser asks the user for webcam video via `getUserMedia`.
2. Browser loads **MediaPipe Tasks Vision** at an `@latest` CDN URL and the MediaPipe hand-landmarker model from an external host, configured for up to two hands in video mode.
3. A custom browser-side classifier interprets the 21 MediaPipe hand landmark points per detected hand into raw gestures, including two-hand patterns for Heart, Crying, and Jazz Hands.
4. A state machine counts consecutive frames before updating `stableGesture`. This reduces rapid transitions but does not measure recognition accuracy.
5. Each recognized stable gesture updates an **RGBW preview** in the browser.
6. When the user chooses **Enable Casambi**, browser logic optionally calls `GET /control?key=r` and other allowlisted key choices. A repeat cooldown and extra Fist/Off hold guard exist only in the browser.
7. Node.js handles the HTTP endpoint, checks only whether the key is in `{r,g,b,y,w,p,o,x}`, and looks up scene IDs from local environment variables.
8. When configured, the server creates a Casambi API session and uses `ws` to open the bridge wire, then sends `{wire,method:"controlScene",id:sceneId,level:1}`.

## File responsibilities

- `server.casambi.js` holds Node server code, HTTP routing, browser HTML, CSS and a browser ES-module script.
- `package.json` declares the WebSocket dependency `ws`.
- `HueMotion_Manual.pdf` is an original published manual, linked but not repackaged.
- `logo.jpg` is an original project image.

## Critical trust boundary

The browser opt-in and timing rules are **not** authorization. The server accepts direct HTTP requests to `/control` without an authentication token. It also returns `Access-Control-Allow-Origin: *` and uses `server.listen(PORT)` without explicitly binding to loopback. This is acceptable only as a local educational demonstration when appropriately isolated; it must be redesigned for deployments where real lighting actions matter.

## Component limits

- Exact gesture-to-scene names, keys and timings are source-defined; see [mapping](GESTURE_MAPPING.md).
- RGBW values are preview percentages, not calibrated luminaire output, electrical power or measured colorimetry.
- Shaka uses a gradient cycling **preview**, not a physical continuous-ramp implementation proven to match it.
- Original source is monolithic; no extracted camera-independent classifier library is present. The new offline `gesture_policy.cjs` covers *policy*, not 21-landmark classification.
- The original demo video on the portfolio is retained; it is not a substitute for instrumented delay, classification accuracy or network reliability testing.
