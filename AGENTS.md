# AGENTS.md

This repository is a VS Code extension for DeepSeek Harness. It is designed to support fast iteration and AI-assisted work, so the project stays easy to understand, validate, and extend.

## Project purpose

The extension registers a language model chat provider backed by the DeepSeek Harness runtime. The key layers are:

- `src/extension.ts`: activation, lifecycle, and command registration
- `src/provider.ts`: `LanguageModelChatProvider` implementation and response formatting
- `src/config.ts`: workspace settings access and persistence
- `src/runtime.ts`: runtime lifecycle and subprocess orchestration
- `src/types.ts`: shared config and runtime contracts

## Compound engineering workflow

Use this repo with the following pattern:

1. Keep architecture boundaries clear: config logic, provider logic, and runtime logic should remain separate.
2. Prefer small, reviewable changes over broad refactors.
3. Validate quickly with the project checks before packaging or shipping a release.
4. Favor explicit config and typed contracts over implicit state.

## Commands

- `npm install` — restore dependencies
- `npm run watch` — keep the TypeScript watcher and esbuild watcher running
- `npm run compile` — run type checks, linting, and bundle generation
- `npm run package` — build the production bundle for packaging

## Quality bar

Before considering a change complete, run:

`npm run compile`

For release validation, also run:

`npm run package`

## Notes

- The extension depends on the DeepSeek Harness SDK and subprocess runtime.
- Node version compatibility matters for runtime execution; keep the editor host and environment aligned with the project requirements.
- Keep changes minimal and grounded in the existing provider/runtime architecture.
