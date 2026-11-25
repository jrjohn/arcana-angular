# AGENTS.md — arcana-angular

Instructions for any AI coding agent (Claude Code, Codex, Cursor, Copilot, Gemini…) working
in this repository **or in any product created from it**. `CLAUDE.md`, `GEMINI.md` and
`.github/copilot-instructions.md` all point here; this file is the single source.

> **You MUST NOT report a task as done until `tools/arch-check.sh` exits 0 and the CI lanes
> (§5) are green.** Breaking the layering costs a red build: the pre-commit hook
> (`tools/githooks/pre-commit`) rejects new files outside the layer directories and `*Impl`
> imports outside `src/app/app.config.ts`, and Jenkins stage "Architecture Qube" fails the
> merge on any critical violation or a score below 90.

## 0. First command in a fresh clone

Run `tools/install-hooks.sh` once. Git does not install hooks on clone; until you run it the
pre-commit check does not exist and only CI catches a flat layout — after the work is
written. `tools/new-app.sh` runs it for you.

## 1. Starting something new

| Situation | Do this | Never do this |
|---|---|---|
| New web product | `tools/new-app.sh <name> <dest-dir>` — copies the whole repo, renames the npm package, angular project, image, Sonar key, Jenkins APP_NAME and CI container names, resets the version, installs the hook | `ng new` and copy a few `src/app/` folders into it |
| New business feature (entity + page) | `tools/new-feature.sh <Name>` — one vertical slice: entity, API DTO, mapper, DAO interface + impl, repository interface + impl (Memory → LRU → DAO cache), service, list page + ViewModel (Input/Output/Effect), routes, tokens + providers, unit tests | Call `HttpClient` or `ApiService` from a component, or add `src/app/foo.ts` |
| More screens for a feature | Add `presentation/features/<feature>/<screen>/` with a `*.component.ts` + `*.view-model.ts` pair, mirroring `features/users/user-detail/`; add the route to `<feature>.routes.ts` | Put state or service calls in the component class |

Copying parts instead of `new-app.sh` loses this file, the hook and the CI gate, so nothing
tells the next agent the rules exist.

## 2. Layers — where a file goes

All paths are under `src/app/`. Direction is one way:
component → ViewModel → service → repository → DAO → `ApiService` (HTTP).

| Layer | Path | Contains | May depend on |
|---|---|---|---|
| Bootstrap + DI | `app.ts`, `app.config.ts`, `app.routes.ts`, `core/strategies/` | root component, providers (`{ provide: X_TOKEN, useClass: XImpl }`), lazy routes, preloading | everything; `app.config.ts` is the only file that imports `*Impl` classes |
| Presentation — view | `presentation/features/<feature>/<screen>/*.component.{ts,html,scss}`, `<feature>.routes.ts`, `presentation/layout/<x>/`, `presentation/shared/{base,components/<x>,pipes}/` | standalone components extending `BaseComponent`; read `vm.output.*` signals, call `vm.input.*`, subscribe to `vm.effect$` | its ViewModel, `presentation/shared/`, domain entities (types) |
| Presentation — ViewModel | `*.view-model.ts` next to its component | `@Injectable()` class extending `BaseViewModel` with `input` (actions), `output` (computed signals), `effect$` (Subjects); provided in the component's `providers` | domain services, domain entities/models |
| Domain | `domain/services/`, `domain/entities/`, `domain/models/`, `domain/guards/` | business rules (`UserService`), entities + validators, `AppError`, route guards, cross-cutting services (auth, i18n, nav graph, network status) | repository **interfaces** + tokens (`repository/*.repository.ts`, `repository.tokens.ts`), entities |
| Repository | interface `repository/<x>.repository.ts` (extends `base.repository.ts`), token in `repository/repository.tokens.ts`, impl `repository/impl/<x>.repository.impl.ts` | offline-first cache orchestration (Memory → LRU → IndexedDB → DAO), DTO ↔ entity mapping, offline queue | DAO interfaces + tokens (`dao/index.ts`), `data/storage/`, `data/mappers/`, entities |
| DAO | interface `dao/<x>.dao.ts`, token in `dao/index.ts`, impl `dao/impl/<x>.dao.impl.ts` | raw HTTP via `ApiService`, returns API DTOs; no mapping, no caching | `data/api/`, `data/dto/` |
| Data infrastructure | `data/api/`, `data/dto/`, `data/mappers/`, `data/storage/`, `data/interceptors/`, `data/sync/` | `ApiService`, snake_case DTOs, mappers, memory/LRU/IndexedDB caches, HTTP interceptors, offline sync | entities, each other |

`data/repositories/user.repository.ts` is a legacy pre-DAO repository that nothing wires
(only its own spec imports it). Do not extend it or copy it; the hook refuses new files there.
Do not describe or create layers this table lacks (there is no use-case layer: business rules
live in `domain/services/`).

## 3. Rules

| # | Rule | Enforced by |
|---|---|---|
| R1 | Every repository and DAO is an interface plus an `@Injectable()` `XRepositoryImpl` / `XDaoImpl` in an `impl/` directory next to it, injected through an `InjectionToken` (`X_REPOSITORY_TOKEN`, `X_DAO_TOKEN`) typed as the interface. | arch-qube "Interface/Impl Colocation", "Implementation Naming Convention" |
| R2 | Only `src/app/app.config.ts` imports a concrete `*Impl` class or anything from an `impl/` directory. Barrel `export … from` lines in `index.ts` and `*.spec.ts` tests are the only other allowed mentions. | arch-qube "Only DI Container Imports Impl"; pre-commit hook |
| R3 | Components never inject a domain service, repository or DAO; they talk to their ViewModel only. | arch-qube "View Cannot Call Service", "Unidirectional Data Flow" |
| R4 | Imports go downward only (component → ViewModel → service → repository → DAO). A lower layer never imports a higher one. | arch-qube "Layer Direction Enforcement", "Module Boundary" |
| R5 | A ViewModel exposes exactly `input`, `output` (signals) and `effect$` (Subjects), extending `BaseViewModel`. Component methods only delegate (≤ 20 lines). | arch-qube "No Business Logic in Boundary"; "MVVM I/O/E Structure" is AI-only (NOT EVALUATED with `--no-ai`) — code review |
| R6 | Navigation goes through `NavGraphService` (type-safe routes), not `router.navigate(['…'])` strings in components. | arch-qube "Type-Safe NavGraph" |
| R7 | No new file directly under `src/app/` and none outside the layer directories of §2. | pre-commit hook |
| R8 | Every new DAO, repository, service, ViewModel and component has a `*.spec.ts` next to it (Jasmine + TestBed with interface fakes, as `new-feature.sh` generates). | arch-qube "Test Coverage Threshold"; Jenkins stage "Test Coverage" + SonarQube quality gate |

## 4. Architecture check (arch-qube)

arch-qube (https://github.com/jrjohn/arcana-arch-qube) scans the source for layer-direction,
DI, MVVM and naming violations and scores it; usage guide:
https://github.com/jrjohn/arcana-skills/tree/main/arch-qube-skill. The version is pinned in
`tools/arch-qube.version`, read by both `tools/arch-check.sh` and the Jenkinsfile.

`tools/arch-qube.version` is bumped automatically by Renovate when arch-qube releases; do not edit the version anywhere else.

- Run: `tools/arch-check.sh`. It uses `ghcr.io/jrjohn/arch-qube:<version>` (public,
  multi-arch), then `arcana.boo/arcana/arch-qube:<version>`, with the same
  `--framework angular`, `--threshold 90` and exclusions as Jenkins stage "Architecture Qube".
  Exit 0 = pass, 1 = fail, 2 = could not run (no Docker / neither image pullable) — 2 is
  **not** a pass. There is no `:latest` fallback on purpose.
- Without Docker: on a tree without `node_modules/`, `dist/`, `.angular/`, `coverage/`, run
  `pipx run --spec "git+https://github.com/jrjohn/arcana-arch-qube.git@v$(cat tools/arch-qube.version)" arch-qube scan . --framework angular --no-ai --ci --format json,markdown -o arch-qube-reports --threshold 90`.
- Report: `arch-qube-reports/arch-qube.md` (summary) and `arch-qube.json` (per rule:
  `files_checked`, violations). PASS needs the score ≥ threshold **and** zero violations in
  every critical rule — a 99.4 can still FAIL. Read it rule by rule:
  - a rule under "Not evaluated" (here: MVVM I/O/E Structure, 4-Layer Progressive Cache,
    Offline-First, Defense-in-Depth — AI-only with `--no-ai`) is **not** a pass for code you
    touched; review it by hand against §3;
  - a rule with `files_checked: 0` checked nothing;
  - an unlayered project scores 0 on "Layer Direction Enforcement".
- `--ci` prints nothing on failure. Rerun without `--ci` (or open `arch-qube.md`) to see why.
- False positive: open an issue on arcana-arch-qube with the report attached. Never lower
  `--threshold`, add exclusions, or move code to dodge a rule.

## 5. Before you say "done"

Run these, in this order, and paste the last line of each into your summary:

```bash
tools/arch-check.sh                                    # must print "arch-check: PASS"
npm ci --legacy-peer-deps                              # same install as Dockerfile.ci / Dockerfile.test
npx ng build --configuration=production                # Jenkins "Docker Compose Build" (Dockerfile.ci)
npx ng test --watch=false --no-progress --browsers=ChromeHeadless --code-coverage   # Jenkins "Test Coverage"
```

There is no lint stage in the Jenkinsfile and no `lint` script; the production build (strict
templates + TypeScript) is the static check. Without local Chrome, run the identical test lane
in Docker: `docker compose -f docker-compose.test.yml run --build --rm test` (must exit 0), and
the build lane with `docker compose -f docker-compose.ci.yml build`. CI also runs the SonarQube
quality gate, which you cannot run locally.

## 6. Reference

- Optional detail: `arcana-angular-developer-skill`
  (https://github.com/jrjohn/arcana-skills/tree/main/arcana-angular-developer-skill).
  This file is the source of truth: if the skill and this file disagree, this file wins.
