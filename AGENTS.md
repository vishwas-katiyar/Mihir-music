# AGENTS Guide
Scope: How to work in this repo as an agent. Keep concise and actionable.
Status: Repository currently has no source files committed. Add details below as the codebase grows.

## Source Discovery
- Always start with `ls -Force` to reveal hidden files.
- If a stack appears (e.g., `package.json`, `pnpm-lock.yaml`, `pyproject.toml`, `Cargo.toml`), update this guide with stack-specific commands.
- For Cursor/Copilot rules: none found (`.cursor/`, `.cursorrules`, `.github/copilot-instructions.md` absent). Re-check after pulling new changes.
- Treat user-untracked files as intentional; do not delete or reset.

## Build, Lint, Test Commands
- Currently no project scripts present. Once tooling exists, add exact commands here.
- General detection order: read package/config files, then `npm run`/`pnpm run`/`yarn run`, `make help`, or `just --list`.
- Node defaults (if `package.json` appears): `npm install` (or `pnpm install`), `npm run build`, `npm run lint`, `npm test`, `npm test -- <pattern>` for single test; Jest: `npm test -- MySuite`; Vitest: `npm test -- --runInBand file.spec.ts`.
- Python defaults (if `pyproject.toml`/`requirements.txt` appears): `python -m pip install -r requirements.txt`; tests via `pytest`, single test `pytest path::TestClass::test_case`; lint via `ruff check` or `flake8`; type via `mypy`.
- Go defaults: `go test ./...`, single test `go test ./... -run TestName`, lint `golangci-lint run`, build `go build ./...`.
- Rust defaults: `cargo build`, `cargo test`, single test `cargo test test_name`, lint `cargo fmt --check`, `cargo clippy --all-targets --all-features -D warnings`.
- .NET defaults: `dotnet restore`, `dotnet build`, `dotnet test --filter FullyQualifiedName~TestName`.
- Frontend bundlers (Vite/Next/Remix): look for `vite.config.*`, `next.config.*` and use `npm run dev`, `npm run build`, `npm run lint`, `npm run test` accordingly.
- If Docker present: prefer `docker compose build`/`up` and service-specific `test` targets.
- Always document the exact single-test invocation per framework when you learn it.

## Local Environment
- Keep dependencies local; avoid global installs unless documented.
- Prefer `node --run` or `npx` for one-off tooling to avoid polluting `package.json`.
- Check required Node/Python/Go/Rust versions via `.nvmrc`, `.node-version`, `pyproject.toml`, `go.mod`, `rust-toolchain` when they appear.

## Coding Style (General Defaults)
- Imports: group standard libs, third-party, then local; keep alphabetical inside groups; prefer explicit named imports over wildcards.
- Module boundaries: avoid long relative paths (`../../`); favor root aliases if configured (TS path mapping, jsconfig).
- Formatting: follow formatter if present (Prettier, Black, gofmt, rustfmt, dotnet-format). If none, use 2-space indent for JS/TS/JSON, 4 for Python, tabs for Go.
- Line length: target 100-120 chars unless formatter dictates.
- Types: prefer explicit types on public APIs; in TS, avoid `any`, use `unknown` + narrowing; in Python, use typing (PEP 484/604) and `typing_extensions` if needed.
- Nullability: avoid `null` when `undefined` suffices in TS; check optional properties before access.
- Immutability: default to `const` (JS/TS) and `readonly` where possible; avoid mutating arguments.
- Functions: keep small; extract helpers over deep nesting; prefer pure functions for logic.
- Naming: snake_case for Python, camelCase for JS/TS, PascalCase for types/components/classes, SCREAMING_SNAKE_CASE for constants.
- React: functional components, hooks for state/effects, avoid inline arrow props where perf matters; memoize expensive computations.
- Accessibility: use semantic HTML, `aria-*` as needed, focus order sane, color contrast.
- CSS: prefer module-scoped or CSS-in-JS consistent with stack; avoid global leaks; use design tokens if available.
- Async: prefer `async/await`; wrap awaits with error handling; avoid unhandled promises.
- Error handling: fail fast with actionable messages; avoid silent catch; surface context (ids, params) without leaking secrets.
- Logging: keep logs structured; avoid noisy console in shipped code; guard debug logs with env flags.
- Configuration: load from env with schema validation (e.g., `zod`/`joi`); avoid defaulting secrets.
- Input validation: validate at boundaries (HTTP handlers, CLI args, job payloads).
- Security: escape/encode user input, avoid `eval`, prefer parameterized queries, handle CSRF/CORS/auth via middleware.
- Performance: debounce/throttle on frequent events; avoid N+1 calls; paginate; cache when safe.
- State management: keep server state fetched, client state minimal; normalize data; avoid duplicated sources of truth.
- Filesystem paths: use path join utilities; avoid hard-coded separators; keep relative to project root.
- Timezones: store UTC, display local; use libs (date-fns/luxon) not manual math.

## Testing Practices
- Add tests alongside code (`*.test.ts`/`*.spec.ts` or `tests/`).
- Prefer deterministic tests; avoid network except via mocks/fakes.
- For React, use Testing Library; avoid enzyme-style internals; assert behavior not implementation.
- Snapshot tests: stable inputs only; keep small; prefer explicit assertions.
- Feature flags: test both sides when possible.
- Randomized tests: seed and log seeds.
- Use coverage gates only if repo config demands; avoid chasing 100% at expense of clarity.
- When adding single test command, document it in Build/Lint/Test section.
- Before committing, run formatter + linter + targeted tests.

## Git Hygiene
- Never rewrite user history; no `reset --hard` or amend unless user requests.
- Keep commits scoped and descriptive; prefer present tense, imperative.
- Do not commit secrets (`.env`, `credentials.json`); if encountered, warn user.
- Respect untracked user files; do not delete.
- When asked for commit, check staged vs unstaged carefully.

## PR / Review Expectations
- Keep diffs minimal; explain rationale in PR description.
- Link issues or tickets if provided.
- Note breaking changes and migration steps.
- Provide manual verification steps if automated tests are absent.
- Ensure CI commands are documented in Build/Lint/Test section once known.

## Documentation Habits
- Update this `AGENTS.md` whenever you learn concrete commands or rules.
- Keep README or docs in sync with actual tooling.
- Prefer short code snippets illustrating typical commands.
- Add architecture notes when discovered (entrypoints, data flow, key services).

## Error Handling Patterns (General)
- Wrap boundary layers (HTTP, CLI, queues) with top-level error handlers that log and exit non-zero.
- Use typed errors or error classes; attach metadata not raw data.
- Avoid user-facing stack traces; return friendly messages plus request id.
- Retries: use exponential backoff with caps; avoid retrying on validation errors.
- Timeouts: set for network/file/db ops; avoid hanging awaits.
- Cleanup: ensure disposals in `finally` (db, file handles, subscriptions).

## Style by Language (Fallbacks)
- TypeScript: `strict` mode, `esnext` modules, no implicit `any`; prefer interfaces for object shapes, types for unions; use `ReadonlyArray` for immutability.
- JavaScript: enable eslint with `eslint:recommended`; prefer JSDoc for public functions; avoid dynamic `this` binding.
- Python: enable `ruff`/`flake8`, `black`, `isort`, `mypy`; prefer dataclasses for simple models; type `self`/`cls` in methods.
- Go: run `gofmt` on save; `go vet` for static checks; keep exported identifiers commented; return `(T, error)` not panics except programmer bugs.
- Rust: run `cargo fmt` and `cargo clippy`; use `Result` and `anyhow`/`eyre` for context; avoid `.unwrap()` in non-test code.
- CSS/SCSS: use variables for colors/spacing; avoid !important; keep components scoped.

## Imports and Dependencies
- Avoid circular deps; refactor shared logic to utilities.
- Prefer tree-shakeable imports (`import {x} from 'lib'` not whole lib) when bundling.
- Keep dependency versions minimal; avoid heavy libs for trivial tasks.
- Document any global polyfills or shims.

## Configuration & Secrets
- Load env via `.env` + `.env.local` (gitignored) when stack supports.
- Do not hardcode secrets; use placeholders.
- If cloud keys required, ask user; never fabricate.
- Record required env vars in docs with descriptions and defaults.

## Data and API Layers
- For HTTP clients, centralize fetch/axios wrappers; handle JSON parsing and errors uniformly.
- Validate server responses; do not assume shapes.
- For GraphQL, generate types from schema if available.
- For databases, prefer parameterized queries/ORM; migrate with versioned tool (Prisma/MikroORM/Knex/Flyway).

## UI/UX Defaults (if frontend emerges)
- Responsive-first: test at mobile/tablet/desktop.
- Typography: choose project-specific font (Google Fonts etc.) instead of defaults; define scale.
- Color: set CSS variables for palette; ensure contrast.
- Layout: prefer CSS grid/flex with sensible gaps; avoid magic numbers.
- Motion: use purposeful transitions (opacity/translate 150-250ms); reduce motion if `prefers-reduced-motion`.

## Performance & Observability
- Measure before optimizing; use profiling tools available in stack.
- Add metrics/logging at boundaries; avoid high-cardinality labels.
- Cache with clear TTLs and invalidation strategy.
- For frontends, code-split heavy routes; lazy-load images with `loading="lazy"`.

## Accessibility Checklist
- Every interactive element needs accessible name.
- Ensure focus styles visible; manage focus on dialogs/route changes.
- Provide keyboard operability for all controls.
- Use landmarks (`main`, `nav`, `footer`) for layout.

## Working With Secrets and Keys
- Never commit `.env`; add to `.gitignore`.
- Redact secrets from logs and error messages.
- Rotate leaked keys immediately; inform user.

## File/Directory Conventions (to adopt later)
- `src/` for app code, `tests/` for tests, `scripts/` for ops tooling, `docs/` for documentation.
- Keep barrel files minimal; avoid re-exporting everything blindly.
- Prefer clear filenames: `feature-name.tsx`, `useFeature.ts`, `feature.service.ts`.

## Single-Test Recipes (fill when known)
- Leave examples until real commands exist.
- Jest: `npm test -- MyTestName`.
- Vitest: `npm test -- --runInBand path/to/file.test.ts`.
- Cypress: `npx cypress run --spec path/to/spec.cy.ts`.
- Playwright: `npx playwright test path --grep "name"`.
- Pytest: `pytest path::TestClass::test_method`.
- Go: `go test ./... -run TestName`.
- Rust: `cargo test test_name`.

## When Adding New Stack Details
- Update Build/Lint/Test with exact commands and env prerequisites.
- Note package managers (npm/pnpm/yarn/bun) and lockfile to use.
- Document formatter invocation and config files.
- Record CI equivalents if present (GitHub Actions, etc.).
- Add any project-specific patterns (routing, state management, API client, db layer).
- Capture any Cursor/Copilot rules once they appear and summarize here.

## Communication Tips for Agents
- Default to acting without asking unless blocked by secrets/ambiguity.
- Summarize changes with file paths and rationale.
- Suggest next steps (tests/build) after modifications.
- Keep outputs concise; avoid dumping large files.

## Maintenance
- Periodically re-run `ls -Force` and `git status -sb` to detect new files.
- Keep this file ASCII; avoid unnecessary comments.
- When the real codebase arrives, tighten this guide to actual tools and conventions.
