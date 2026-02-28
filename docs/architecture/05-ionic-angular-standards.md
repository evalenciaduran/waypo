# AGENTS.md — Ionic (Angular) Engineering Standards

This repository is an **Ionic + Angular** application. Follow these standards strictly when creating or modifying code.
Primary goals: **maintainability, testability, consistency, performance, and predictable architecture**.

---

## 0) Non-negotiable rules (read first)

- **Standalone-first**: prefer `standalone: true` components/directives/pipes. Avoid NgModules unless strictly required for legacy integration.
- **Feature-based (vertical slice)**: code lives inside its feature folder. Avoid global "services/" dumping grounds.
- **Smart/Dumb separation**:
  - **Containers (smart)** orchestrate state, navigation, side effects, repositories.
  - **UI (dumb)** is pure presentational: Inputs/Outputs only. No data access, no navigation, no Capacitor.
- **State uses Signals by default** (`signal`, `computed`, `effect`). Use RxJS only when it provides real value (streams, websockets), not as the default store.
- **Repository + InjectionToken**: UI/state NEVER depend on concrete HTTP implementations directly.
- **Route-scoped providers**: feature dependencies are provided in the feature route config (encapsulation).
- **Capacitor/plugins**: never call `Capacitor.*` (or plugins) directly from UI/components. Always go through a wrapper in `core/platform/*`.

---

## 1) How to run / verify (agent workflow)

Before running anything:

1. **Read `package.json`** and prefer existing scripts.
2. If you need to run commands and scripts exist, use them.

Typical scripts (use the repo's actual ones if different):

- Install: `npm ci`
- Dev: `npm run start` (or `ionic serve`)
- Build: `npm run build`
- Unit/Integration: `npm run test`
- E2E (Playwright): `npm run e2e`
- Lint: `npm run lint`
- Format: `npm run format` (or `npm run prettier`)

Definition of Done for any task:

- Code compiles.
- Relevant tests are added/updated (Playwright for flows, unit tests when appropriate).
- Architecture rules above are respected.
- `data-testid` added for any new interactive UI element that matters in E2E.

---

## 2) Project structure (canonical)

Preferred structure (adapt to existing repo, do not restructure without explicit request):

src/app/
core/
shell/ # app layout, menus, router outlet
platform/ # Capacitor wrappers (storage, geolocation, network, etc.)
http/ # interceptors, base urls, error mapping
shared/
ui/ # reusable presentational components
utils/ # pure helpers (no Angular/Capacitor)
testing/ # builders/fixtures/mocks shared across features
features/
<feature-name>/
routes.ts
provide-<feature>.ts
containers/
ui/
state/
data-access/
ports/ # interfaces + InjectionTokens
adapters/ # http/mock/memory implementations
models/ # DTOs + mappers
README.md # feature contract and decisions

Rules:

- Features should not import from other features directly.
- Cross-feature reuse goes through `shared/` or `core/`.
- Avoid "god services" in `core/`. Keep `core` for infrastructure and shell-level concerns.

---

## 3) Routing and providers (Ionic)

- Routes should be per feature and loaded with `loadComponent`.
- Feature dependencies must be registered as **route-scoped providers**.

Example pattern (adjust naming to project conventions):

- `features/<feature>/routes.ts` exports feature routes
- `features/<feature>/provide-<feature>.ts` provides tokens + stores used by that feature

Do not put feature providers in `app.config.ts` unless it truly is global.

---

## 4) Data access (Repository + InjectionToken)

### 4.1 Ports (contracts)

- Define a `Repo` interface in `data-access/ports`.
- Export an `InjectionToken` for that interface.
- Keep DTOs and mapping in `data-access/models`.

### 4.2 Adapters

- HTTP implementation lives in `data-access/adapters`.
- Adapters should:
  - perform network call
  - map DTO -> domain model
  - throw/return normalized errors (do not leak raw http errors to UI)

### 4.3 Injection

- Provide repo implementations in `provide-<feature>.ts` and attach that provider in routes.

---

## 5) Feature state with Signals (default)

Use a feature store pattern:

- `loading`, `error`, data signals, derived `computed`, and explicit async actions (methods).
- Store depends on Repo token, not on adapter class.

Rules:

- Store does NOT depend on UI controllers (ToastController, NavController).
- Side effects that show UI (toast/alerts) belong to containers or shell helpers.

---

## 6) UI rules (Ionic components)

### 6.1 Containers

- `OnPush` by default.
- Only containers:
  - read/write store
  - call navigation
  - open modals/popovers
  - translate user actions into store actions

### 6.2 Presentational UI components

- Inputs/Outputs only.
- No repositories, no HttpClient, no routing, no Capacitor, no direct storage.
- Add accessibility attributes and deterministic selectors.

### 6.3 Layout convention

- Prefer **`div` + custom CSS** for layout over `ion-grid` for consistency and control.
- Keep Ionic primitives where they matter (`ion-content`, `ion-header`, safe areas, scrolling).

---

## 7) Styling and theming

- Prefer CSS Variables and SCSS for theming (`--ion-color-*`).
- Component styles live in their own `*.scss`. Avoid global overrides unless they are tokens/utilities.
- Avoid deep selectors into Ionic internals that are brittle.

Responsiveness:

- All screens must be responsive.
- Avoid fixed heights; propagate `height: 100%` correctly (especially for maps).

---

## 8) Capacitor and native integrations

- All plugin usage must go through `core/platform/*` wrappers.
- Wrappers should:
  - handle platform checks safely
  - normalize return types/errors
  - expose simple app-level methods (e.g. `getCurrentPosition()`)

UI and stores must treat these as dependencies injected via tokens/services.

---

## 9) Testing standards

### 9.1 E2E (Playwright) — primary for flows

- Use **only `data-testid`** selectors for stability.
- Add `data-testid` to:
  - primary buttons/CTAs
  - critical inputs
  - key list items/rows
  - error and success states (toasts, banners, empty states)

Suggested structure:
e2e/
features/
<feature>/
<feature>.spec.ts
fixtures/
pages/ (optional, if flows grow)

### 9.2 Unit/Integration (recommended)

- Use Angular TestBed for stores/containers when logic is non-trivial.
- Mock repos via InjectionTokens:
  - `{ provide: <TOKEN>, useValue: mockRepo }`

---

## 10) Scaffolding: creating a new feature (checklist)

When adding a feature, create:

- `features/<name>/routes.ts`
- `features/<name>/provide-<name>.ts`
- `features/<name>/containers/<name>-page.container.ts`
- `features/<name>/ui/*` (presentational components)
- `features/<name>/state/<name>.store.ts` (signals)
- `features/<name>/data-access/ports/*` (Repo interface + token)
- `features/<name>/data-access/adapters/*` (http/mock)
- `features/<name>/data-access/models/*` (DTOs + mapping)
- `e2e/features/<name>/*.spec.ts` (Playwright)

Naming:

- `*.container.ts` for containers
- `*.component.ts` for presentational UI
- `*.store.ts` for signals store
- `*.repo.ts` for repository ports

---

## 11) PR sanity checklist (fast)

- [ ] Standalone components + OnPush.
- [ ] UI is dumb; no data access/nav/capacitor.
- [ ] Feature has route-scoped providers.
- [ ] Repo token used; no adapter leakage into UI/state.
- [ ] Signals store is the source of truth.
- [ ] `data-testid` added for new interactive elements.
- [ ] Playwright updated/added for the main flow + error state.

---

## 12) Agent behavior guidelines (important)

- Do not do large refactors unless explicitly requested.
- Keep changes scoped to the feature/task.
- Prefer the existing project patterns over introducing new ones.
- If repo conventions differ from this file, follow the repo and update this AGENTS.md only if the user asks.
