const pads = Array.from(document.querySelectorAll('.pad'));
const startButton = document.querySelector('#start');
const levelLabel = document.querySelector('#level');
const message = document.querySelector('#message');

const colors = ['green', 'red', 'blue', 'yellow'];

let level = 1;
let sequence = [];
let acceptingInput = false;
let userIndex = 0;
let playbackTimers = [];

function sequenceLengthForLevel(currentLevel) {
  return 4 + (currentLevel - 1);
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

function playSequence() {
  const duration = durationForLevel(level);
  const gap = 150;

  acceptingInput = false;
  userIndex = 0;
  startButton.disabled = true;
  setMessage('Watch the sequence...');

  sequence.forEach((color, index) => {
    const delay = index * (duration + gap);
    const timer = setTimeout(() => highlightPad(color, duration), delay);
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
  sequence = Array.from({ length: sequenceLengthForLevel(level) }, () => {
    const pick = Math.floor(Math.random() * colors.length);
    return colors[pick];
  });
  playSequence();
}

function handlePadPress(color) {
  if (!acceptingInput) return;

  highlightPad(color, 300);

  if (color !== sequence[userIndex]) {
    acceptingInput = false;
    setMessage(`Incorrect. Press start to retry level ${level}.`);
    return;
  }

  userIndex += 1;
  if (userIndex === sequence.length) {
    acceptingInput = false;
    level += 1;
    levelLabel.textContent = level;
    setMessage('Correct! Press start for the next level.');
  }
}

startButton.addEventListener('click', () => {
  if (playbackTimers.length) {
    playbackTimers.forEach((timer) => clearTimeout(timer));
    playbackTimers = [];
  }
  levelLabel.textContent = level;
  startRound();
});

pads.forEach((pad) => {
  pad.addEventListener('click', () => handlePadPress(pad.dataset.color));
});
