const pads = Array.from(document.querySelectorAll('.pad'));
const startButton = document.querySelector('#start');
const muteButton = document.querySelector('#mute');
const levelLabel = document.querySelector('#level');
const message = document.querySelector('#message');

const colors = ['green', 'red', 'blue', 'yellow'];

let level = 1;
let sequence = [];
let acceptingInput = false;
let userIndex = 0;
let playbackTimers = [];
let audioContext = null;
let isMuted = false;

function updateStartLabel() {
  startButton.textContent = level > 1 ? 'Retry' : 'Start';
}

function durationForLevel(currentLevel) {
  const duration = 1000 - (currentLevel - 1) * 80;
  return Math.max(300, duration);
}

function setMessage(text) {
  message.textContent = text;
}

function highlightPad(color, duration) {
  const pad = pads.find((button) => button.dataset.color === color);
  if (!pad) return;
  pad.classList.add('active');
  setTimeout(() => pad.classList.remove('active'), duration);
}

function getAudioContext() {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (error) {
      console.error('Failed to create AudioContext:', error);
      return null;
    }
  }
  return audioContext;
}

async function resumeAudioContext() {
  const ctx = getAudioContext();
  if (!ctx) return null;
  if (ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch (error) {
      console.error('Failed to resume AudioContext:', error);
      return null;
    }
  }
  return ctx;
}

async function playTone(frequency, durationMs) {
  if (isMuted) return;
  const ctx = await resumeAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = 'square';
  oscillator.frequency.setValueAtTime(frequency, now);

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
  gain.gain.linearRampToValueAtTime(0.001, now + durationMs / 1000);

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start(now);
  oscillator.stop(now + durationMs / 1000 + 0.05);
}

async function playErrorTone() {
  if (isMuted) return;
  const ctx = await resumeAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = 'sawtooth';
  oscillator.frequency.setValueAtTime(220, now);
  oscillator.frequency.exponentialRampToValueAtTime(90, now + 0.3);

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.22, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start(now);
  oscillator.stop(now + 0.4);
}

function playSequence() {
  const duration = durationForLevel(level);
  const gap = 150;

  acceptingInput = false;
  userIndex = 0;
  startButton.disabled = true;
  setMessage('Watch the sequence...');

  sequence.forEach((color, index) => {
    const delay = index * (duration + gap);
    const timer = setTimeout(() => {
      highlightPad(color, duration);
      void playTone(colorTone(color), Math.max(120, duration * 0.6)); // Fire-and-forget: avoid awaiting audio here.
    }, delay);
    playbackTimers.push(timer);
  });

  const totalTime = sequence.length * (duration + gap);
  const endTimer = setTimeout(() => {
    setMessage('Your turn.');
    acceptingInput = true;
    startButton.disabled = false;
    playbackTimers = [];
  }, totalTime);
  playbackTimers.push(endTimer);
}

function startRound() {
  sequence = SimonLogic.advanceSequence(sequence, level, colors);
  playSequence();
}

function handlePadPress(color) {
  if (!acceptingInput) return;

  highlightPad(color, 300);
  void playTone(colorTone(color), 180);

  const result = SimonLogic.checkUserInput(sequence, userIndex, color);
  if (!result.correct) {
    acceptingInput = false;
    userIndex = result.nextIndex;
    void playErrorTone();
    const retryLabel = level > 1 ? 'retry' : 'start';
    setMessage(`Incorrect. Press ${retryLabel} to replay level ${level}.`);
    startButton.disabled = false;
    setTimeout(() => {
      if (!acceptingInput) {
        setMessage('Try again.');
        acceptingInput = true;
      }
    }, 700);
    return;
  }

  userIndex = result.nextIndex;
  if (result.isComplete) {
    acceptingInput = false;
    level += 1;
    levelLabel.textContent = level;
    updateStartLabel();
    setMessage('Correct! Next level starting...');
    startButton.disabled = true;
    setTimeout(() => {
      if (!isMuted) {
        void resumeAudioContext();
      }
      startRound();
    }, 2000);
  }
}

startButton.addEventListener('click', async () => {
  if (playbackTimers.length) {
    playbackTimers.forEach((timer) => clearTimeout(timer));
    playbackTimers = [];
  }
  if (!isMuted) {
    await resumeAudioContext();
    void playTone(colorTone('green'), 120);
  }
  levelLabel.textContent = level;
  if (sequence.length) {
    playSequence();
  } else {
    startRound();
  }
});

pads.forEach((pad) => {
  pad.addEventListener('click', () => handlePadPress(pad.dataset.color));
});

muteButton.addEventListener('click', () => {
  isMuted = !isMuted;
  muteButton.classList.toggle('is-muted', isMuted);
  muteButton.setAttribute('aria-pressed', String(isMuted));
  muteButton.setAttribute('aria-label', isMuted ? 'Unmute audio' : 'Mute audio');
});

function colorTone(color) {
  switch (color) {
    case 'green':
      return 392;
    case 'red':
      return 440;
    case 'yellow':
      return 494;
    case 'blue':
      return 330;
    default:
      return 440;
  }
}

updateStartLabel();
