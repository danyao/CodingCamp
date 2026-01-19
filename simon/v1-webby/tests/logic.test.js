const assert = require('assert');
const { generateSequence, checkUserInput, sequenceLengthForLevel } = require('../logic');

function makeRng(values) {
  let index = 0;
  return () => {
    const value = values[index % values.length];
    index += 1;
    return value;
  };
}

function testSequenceLength() {
  // Ensures levels map to a minimum length of 4 and scale by level.
  assert.strictEqual(sequenceLengthForLevel(1), 4);
  assert.strictEqual(sequenceLengthForLevel(3), 6);
  assert.strictEqual(sequenceLengthForLevel(0), 4);
}

function testGenerateSequenceDeterministic() {
  // Uses a fixed RNG to verify deterministic color selection.
  const colors = ['green', 'red', 'blue', 'yellow'];
  const rng = makeRng([0.1, 0.4, 0.7, 0.9]);
  const sequence = generateSequence(1, colors, rng);
  assert.deepStrictEqual(sequence, ['green', 'red', 'blue', 'yellow']);
}

function testCheckUserInputProgress() {
  // Checks progression through a sequence and completion detection.
  const sequence = ['red', 'blue'];
  let result = checkUserInput(sequence, 0, 'red');
  assert.strictEqual(result.correct, true);
  assert.strictEqual(result.isComplete, false);
  assert.strictEqual(result.nextIndex, 1);

  result = checkUserInput(sequence, result.nextIndex, 'blue');
  assert.strictEqual(result.correct, true);
  assert.strictEqual(result.isComplete, true);
  assert.strictEqual(result.nextIndex, 2);
}

function testCheckUserInputFailure() {
  // Confirms incorrect input resets the index without completing.
  const sequence = ['red', 'blue'];
  const result = checkUserInput(sequence, 0, 'green');
  assert.strictEqual(result.correct, false);
  assert.strictEqual(result.isComplete, false);
  assert.strictEqual(result.nextIndex, 0);
}

function run() {
  testSequenceLength();
  testGenerateSequenceDeterministic();
  testCheckUserInputProgress();
  testCheckUserInputFailure();
  console.log('logic tests passed');
}

run();
