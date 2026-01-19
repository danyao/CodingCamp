# GAME: Simon

This document provides a functional spec of a game called Simon.

# Feature Spec

## User Interface

The main game interface consists of 4 coloured buttons arranged in a 2x2 grid. From the top-left corner and going clockwise, the colours are green, red, blue and yellow.

There is also a START button.
There is also a MUTE button to toggle audio on and off.

## Game Play

The game proceeds in rounds of increasing levels.

### Starting a game

- A game can start at level 1.
- A user must clear a level before they can proceed to the next level.
- The user can retry the same level in multiple rounds until they clear it.
- The user presses the START button to initiate a new round.

### Playing a Round

- In each round, the game generates a random colour sequence, for example, RED, BLUE, YELLOW, RED.
- The sequence is presented to the user by lighting up the corresponding coloured button for 1 second.
- Each sequence step plays a short, retro-style beep associated with the colour.
- At the end of the sequence, all buttons are returned to the normal state.
- The user now attempts to replicate the colour sequence by pressing on the buttons.
- If the user correctly replicates the sequence, the game moves onto the next level.
- If the user makes a mistake at any point, the round is terminated. The user can press START to initiate a new round at the same level.
- If the user makes a mistake, play an error sound and allow them to attempt the same sequence again without replaying it.

### Levels

- The current level of the game determines the length of the colour sequence and the speed at which the sequence is presented to the user.
- Sequences get longer and are presented faster at higher levels.
- At level 1, sequences are 4 colours long, and each colour is presented for 1 seconds.
- Two separate algorithms control how the sequence and timing progress across levels.

## Future Extensions

- Saving and resuming from a specific level

# Technical Spec

- The game should be playable as a local web app without any networked or cloud storage.
