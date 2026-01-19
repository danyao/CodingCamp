# Repository Guidelines

## Project Structure & Module Organization
This folder contains a single product spec for the Simon game.
- `spec.md` is the functional specification and source of truth.
If you add implementation code later, prefer a simple layout such as:
- `src/` for game logic and UI
- `assets/` for images, sounds, or styles
- `tests/` for automated tests

## Build, Test, and Development Commands
No build or test tooling is configured yet. Once a runtime is chosen, document commands here. Example patterns:
- `npm run dev` for a local dev server
- `npm test` or `pytest` for tests
- `make build` for production builds

## Coding Style & Naming Conventions
There are no style rules yet. When code is added, document:
- Indentation (2 or 4 spaces)
- Naming (e.g., `camelCase` functions, `PascalCase` classes)
- Lint/format tools (e.g., `eslint`/`prettier`, `black`/`ruff`)

## Testing Guidelines
No test framework is specified. If tests are added, include:
- Framework name
- Test file naming (e.g., `*.spec.ts`, `test_*.py`)
- Any coverage or CI expectations

## Commit & Pull Request Guidelines
There is no commit history in this folder. Use clear, imperative messages (e.g., "Add initial Simon UI scaffold"). For PRs, include:
- Summary of changes
- Linked issues (if applicable)
- Screenshots or short clips for UI changes
- Testing notes

## Notes for Contributors
`spec.md` defines the required gameplay and UI behavior. Keep the implementation aligned with:
- 2x2 button layout in clockwise order: green, red, blue, yellow
- Level-driven sequence length and timing
- START button behavior and retry-at-same-level logic
