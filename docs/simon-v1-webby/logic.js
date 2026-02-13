(function (root) {
  const DEFAULT_COLORS = ['green', 'red', 'blue', 'yellow'];

  function sequenceLengthForLevel(level) {
    return 4 + Math.max(0, level - 1);
  }

  function generateSequence(level, colors = DEFAULT_COLORS, rng = Math.random) {
    const length = sequenceLengthForLevel(level);
    return Array.from({ length }, () => {
      const pick = Math.floor(rng() * colors.length);
      return colors[pick];
    });
  }

  function advanceSequence(existing, level, colors = DEFAULT_COLORS, rng = Math.random) {
    const targetLength = sequenceLengthForLevel(level);
    let next = Array.isArray(existing) ? existing.slice() : [];

    if (next.length === 0) {
      return generateSequence(level, colors, rng);
    }

    while (next.length < targetLength) {
      const pick = Math.floor(rng() * colors.length);
      next.push(colors[pick]);
    }

    return next;
  }

  function checkUserInput(sequence, index, color) {
    if (!Array.isArray(sequence) || sequence.length === 0) {
      return { correct: false, nextIndex: index, isComplete: false };
    }

    const expected = sequence[index];
    if (color !== expected) {
      return { correct: false, nextIndex: 0, isComplete: false };
    }

    const nextIndex = index + 1;
    return { correct: true, nextIndex, isComplete: nextIndex === sequence.length };
  }

  const api = {
    sequenceLengthForLevel,
    generateSequence,
    advanceSequence,
    checkUserInput,
  };

  root.SimonLogic = api;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
