# AGENTS.md

Coding standards for `angular-agent`. These apply to all code in this repo, human- or agent-written.

## Stack

Angular 22, standalone components only (no `NgModule`s), Angular Material for UI, Vitest for tests, zone-based change detection (not zoneless) unless a later decision changes this.

## Formatting

Formatting is enforced by Prettier (`.prettierrc`) and `.editorconfig`, not by convention:

- Single quotes, 100-character print width.
- 2-space indentation, final newline, trailing whitespace trimmed.
- `*.html` templates are formatted with Prettier's Angular parser — don't hand-wrap template attributes against it.

Run `npx prettier --write <files>` before committing; don't manually reformat to a different style.

## TypeScript

`tsconfig.json` turns on `noImplicitOverride`, `noPropertyAccessFromIndexSignature`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, and (`angularCompilerOptions`) `strictInjectionParameters` + `strictInputAccessModifiers`. Write code that satisfies these — don't suppress with `any`, non-null assertions, or `// @ts-ignore` to route around a real type error.

- Prefer `interface` for data shapes, `type` for unions/aliases (see `task.ts`).
- Narrow public API surfaces deliberately: use `Pick`/`Omit` to derive request/draft types from an entity type rather than duplicating fields (`TaskDraft = Pick<Task, ...>`).

## Components

- Standalone only. Every component declares its own `imports: []`; no `NgModule` declarations.
- **No `Component` suffix on class names** (`Dashboard`, not `DashboardComponent`; `TaskFormDialog`, not `TaskFormDialogComponent`) — current Angular style guide for standalone apps.
- Template and styles are separate colocated files (`templateUrl` / `styleUrl`), not inline strings, except for components so trivial a template would be a one-liner.
- A component gets its own folder once it has more than one supporting file (template + styles + a dialog's data interface) — see `dashboard/task-form-dialog/`.
- Use the `@if` / `@for` control-flow syntax, not `*ngIf` / `*ngFor`.
- Inject dependencies with `inject()` at field-initializer position, not constructor parameters.

## State management

- No global state library (NgRx, etc.) unless a feature's complexity genuinely needs it. Default is a signal-based `@Injectable({ providedIn: 'root' })` service per feature area.
- A service exposes its readable state as a `Signal<T>` (`readonly tasks = this.tasksSignal.asReadonly()`) for components to bind to directly — don't wrap reads in an `Observable` just to be consistent with the mutation methods.
- Mutation methods (create/update/remove) return `Observable<T>` even when the current implementation is synchronous in-memory data. This is a deliberate seam: when a method is swapped for a real `HttpClient` call, callers and templates don't change.
- Components don't reach into another feature's service internals; cross-feature communication goes through a service's public (signal + Observable-method) API only.

## Forms

- Reactive Forms only, typed (`FormControl<string>`, `nonNullable: true`), never template-driven forms.
- Validators live on the `FormControl`, not re-implemented in the template.
- A create/edit pair that produces the same shape of data uses **one** shared form component parameterized by optional input data, not two near-duplicate components.

## Routing

- Feature routes are lazy-loaded via `loadComponent`, not imported eagerly into `app.routes.ts`.
- Keep `app.routes.ts` as a flat declarative list; put redirect/guard logic in the route config, not in component constructors.

## UI / Material

- Angular Material components over hand-rolled equivalents (table, dialog, form fields, buttons, icons) — don't re-implement what Material already provides well.
- Theme via the M3 `mat.theme()` Sass mixin in `styles.scss`; don't hardcode Material's internal CSS variable names in feature styles — use the `--mat-sys-*` system tokens so a future theme/palette change propagates.
- Confirmation for a destructive action (delete) goes through a `MatDialog`, never a native `confirm()`.

## Testing

- Vitest (`npm test` / `ng test`) is the test runner. Spec files are colocated (`*.spec.ts` next to the file under test).
- A signal-based service's mutation methods and a form's validators are the minimum bar for coverage when tests are in scope for a change — both are the kind of logic that breaks silently without a test.

## File naming

- Kebab-case file names, matching the Angular CLI's default generator output (`task-form-dialog.ts`, not `taskFormDialog.ts`).
- One concern per file: a dialog's `*_DialogData` interface lives in the dialog's own file, not in a shared `models.ts` grab-bag.
