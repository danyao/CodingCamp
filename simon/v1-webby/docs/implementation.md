# Implementation Overview

This version is a lightweight, framework-free Simon game built with plain HTML, CSS, and JavaScript. The UI is defined in `src/index.html` with the main controls and game board. Visual styling and the “lit” state live in `src/styles.css`.

Game logic is split into two layers:
- `src/logic.js` contains pure functions for sequence length, sequence generation, and user input checking. It exposes `SimonLogic` on `window` for the browser and also exports CommonJS for Node tests.
- `src/script.js` handles DOM interaction, playback timing, user input, and audio. It calls into `SimonLogic` for deterministic, testable logic.

Audio uses the Web Audio API with simple oscillator tones. The audio context is created lazily on Start to satisfy browser gesture requirements. The mute button toggles audio without affecting gameplay; icon SVGs are stored in `src/icons/`.

Tests live in `tests/logic.test.js` and can be run with:

```
node simon/v1-webby/tests/logic.test.js
```

If you extend the app, keep game rules aligned with `spec.md` and add unit tests for any new logic in `src/logic.js`.
