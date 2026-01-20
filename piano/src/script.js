const notes = [
  { label: "C", name: "C4", freq: 261.63 },
  { label: "D", name: "D4", freq: 293.66 },
  { label: "E", name: "E4", freq: 329.63 },
  { label: "F", name: "F4", freq: 349.23 },
  { label: "G", name: "G4", freq: 392.0 },
  { label: "A", name: "A4", freq: 440.0 },
  { label: "B", name: "B4", freq: 493.88 },
  { label: "C", name: "C5", freq: 523.25 },
  { label: "D", name: "D5", freq: 587.33 },
  { label: "E", name: "E5", freq: 659.25 },
  { label: "F", name: "F5", freq: 698.46 },
  { label: "G", name: "G5", freq: 783.99 },
  { label: "A", name: "A5", freq: 880.0 },
  { label: "B", name: "B5", freq: 987.77 },
  { label: "C", name: "C6", freq: 1046.5 },
];

const hues = Array.from({ length: notes.length }, (_, index) =>
  Math.round((index * 360) / notes.length)
);
const keysEl = document.getElementById("keys");
const startButton = document.getElementById("start-audio");
const errorEl = document.getElementById("audio-error");
const keyButtons = new Map();
const keyboardMap = {
  q: "C4",
  w: "D4",
  e: "E4",
  r: "F4",
  a: "G4",
  s: "A4",
  d: "B4",
  f: "C5",
  g: "D5",
  h: "E5",
  j: "F5",
  k: "G5",
  l: "A5",
  ";": "B5",
  "'": "C6",
  t: "G4",
  y: "A4",
  u: "B4",
  i: "C5",
  o: "D5",
  p: "E5",
  "[": "F5",
  "]": "G5",
  "\\": "A5",
};
const noteToKey = Object.fromEntries(
  Object.entries(keyboardMap).map(([key, note]) => [note, key])
);
let audioCtx;
let audioUnlocked = false;

function showAudioError(message, error) {
  if (error) {
    console.error(message, error);
  } else {
    console.error(message);
  }
  if (!errorEl) return;
  errorEl.textContent = message;
}

function initAudioContext() {
  if (audioCtx) return audioCtx;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  } catch (error) {
    showAudioError("Failed to create AudioContext.", error);
    return null;
  }
  return audioCtx;
}

function playTone(freq) {
  if (!audioUnlocked) {
    showAudioError("Audio is disabled. Press Start to enable sound.");
    return;
  }
  const ctx = audioCtx;
  if (!ctx) return;
  if (ctx.state === "closed") {
    showAudioError("AudioContext is closed. Reload to try again.");
    return;
  }
  if (ctx.state !== "running") {
    showAudioError("Audio is disabled. Press Start to enable sound.");
    return;
  }
  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.7, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.65);
  } catch (error) {
    showAudioError("Failed to play tone.", error);
  }
}

function createKey(note, hue) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "key";
  button.style.background = `hsl(${hue} 85% 55%)`;
  button.setAttribute("aria-label", `${note.name} key`);
  button.innerHTML = `${note.label}<span class="note">${note.name}</span>`;
  const hotkey = noteToKey[note.name];
  if (hotkey) {
    const hotkeyEl = document.createElement("span");
    hotkeyEl.className = "hotkey";
    hotkeyEl.textContent = hotkey.toUpperCase();
    button.appendChild(hotkeyEl);
  }

  const activate = () => {
    button.classList.add("active");
    playTone(note.freq);
  };
  const deactivate = () => button.classList.remove("active");

  button.addEventListener("pointerdown", activate);
  button.addEventListener("pointerup", deactivate);
  button.addEventListener("pointerleave", deactivate);
  button.addEventListener("keydown", (event) => {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      activate();
    }
  });
  button.addEventListener("keyup", deactivate);

  keyButtons.set(note.name, button);
  return button;
}

notes.forEach((note, index) => {
  keysEl.appendChild(createKey(note, hues[index % hues.length]));
});

if (startButton) {
  startButton.addEventListener("click", () => {
    const ctx = initAudioContext();
    if (!ctx) return;
    ctx
      .resume()
      .then(() => {
        audioUnlocked = true;
        startButton.classList.add("is-ready");
        startButton.textContent = "Sound On";
        if (errorEl) {
          errorEl.textContent = "";
        }
      })
      .catch((error) => {
        showAudioError("Failed to resume AudioContext.", error);
      });
  });
}

document.addEventListener("keydown", (event) => {
  if (event.repeat) return;
  const noteName = keyboardMap[event.key.toLowerCase()];
  if (!noteName) return;
  event.preventDefault();
  try {
    const button = keyButtons.get(noteName);
    if (button) {
      button.classList.add("active");
    }
    const note = notes.find((entry) => entry.name === noteName);
    if (note) {
      playTone(note.freq);
    }
  } catch (error) {
    console.error("Keyboard playback failed:", error);
  }
});

document.addEventListener("keyup", (event) => {
  const noteName = keyboardMap[event.key.toLowerCase()];
  if (!noteName) return;
  const button = keyButtons.get(noteName);
  if (button) {
    button.classList.remove("active");
  }
});
