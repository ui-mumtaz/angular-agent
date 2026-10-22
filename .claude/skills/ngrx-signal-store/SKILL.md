---
name: ngrx-signal-store
description: Create NgRx Signal Stores using withState, withComputed, withMethods, withHooks, and rxMethod. Use when building signal-based state management, adding reactive side effects with rxMethod, or integrating dialogs/async flows into stores. Triggers on Signal Store questions, store creation or refactoring, or when migrating from traditional NgRx Store.
---

# NgRx Signal Store

NgRx Signal Store provides composable, signal-based state management for Angular. Components inject the store and call methods; services are used internally by the store.

## Core Imports

```typescript
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
```

## Store Structure

### withState — Initial State

Inject dependencies via default parameters, not inside the factory body.

```typescript
// ✅ Correct — inject in params
withState<MyState>(
  (persistence = inject(MyService)) => createInitialState(persistence)
)

// ❌ Avoid — inject inside body
withState<MyState>(() => {
  const persistence = inject(MyService);
  return createInitialState(persistence);
})

// Static state
withState<MyState>({ items: [], filter: '' })
```

### withComputed — Derived Signals

First param is `store`; inject services as subsequent default params.

```typescript
withComputed(
  (
    store,
    tokenRegistry = inject(TokenRegistryService),
    otherService = inject(OtherService)
  ) => ({
    derivedValue: computed(() => store.items().length),
    filteredItems: computed(() =>
      filterItems(store.items(), store.filter(), tokenRegistry)
    ),
  })
)
```

### withMethods — State Mutations and rxMethod

Inject all services as default params after `store`. Use `patchState` for updates.

**When to use rxMethod vs async methods**: Use `rxMethod` only when there is a specific reactive need. Use regular `async` methods for one-off imperative actions (e.g., sign in, create item, load item) triggered by user clicks.


| Use rxMethod when…                                                                                                             | Use async method when…                                                        |
| ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| The flow involves **dialogs** — you need to handle `dialog.afterClosed()` as an observable stream                              | The action is a simple fire-and-forget (e.g., sign in, checkout)              |
| The method must **sync with signals** — it reacts to signal changes and runs automatically when the signal updates             | The action is triggered imperatively by a button click with no reactive input |
| The **input is directly linked** to a signal and should trigger automatically on changes (e.g., auto-save when config changes) | There is no need for reactive composition or signal-driven execution          |


```typescript
withMethods(
  (
    store,
    serviceA = inject(ServiceA),
    serviceB = inject(ServiceB),
    dialog = inject(MatDialog),
    snackBar = inject(MatSnackBar)
  ) => ({
    // Sync method
    updateItem(id: string, value: string): void {
      const items = { ...store.items() };
      items[id] = value;
      patchState(store, { items });
    },

    // rxMethod — use when flow involves dialogs, or when input is linked to a signal
    renameItem: rxMethod<Item>((source$) =>
      source$.pipe(
        switchMap((item) => {
          const ref = dialog.open(RenameDialog, {
            data: { defaultValue: item.name },
            width: '360px',
          });
          return ref.afterClosed().pipe(map((name) => ({ item, name })));
        }),
        filter(({ name }) => !!name),
        tap(({ item, name }) => {
          serviceA.update(item.id, { ...item, name });
          patchState(store, { items: serviceA.getAll() });
          snackBar.open(`Renamed to "${name}"`, undefined, { duration: 2000 });
        })
      )
    ),

    // rxMethod for auto-save — input linked to signal, triggers automatically on changes
    autoSave: rxMethod<Config>((source$) =>
      source$.pipe(
        debounceTime(300),
        tap((config) => {
          serviceA.persist(store.currentId(), config);
          patchState(store, { items: serviceA.getAll() });
        })
      )
    ),
  })
)
```

### withMethods — `const` methods + return-by-name (preferred in this repo)

Inside the `withMethods` factory, define **every public method** as a `const`: async functions for imperative work, and `const name = rxMethod(...)` for reactive flows. End with a single **shorthand return** so names are declared once and wired to the store API.

```typescript
withMethods((store, data = inject(MyService), dialog = inject(MatDialog)) => {
  const syncListFromData = async (): Promise<void> => {
    patchState(store, { items: await data.list() });
  };

  const load = async (): Promise<void> => {
    patchState(store, { loading: true });
    try {
      await syncListFromData();
    } finally {
      patchState(store, { loading: false });
    }
  };

  const removeItem = async (id: string): Promise<void> => {
    await data.remove(id);
    await syncListFromData();
  };

  const confirmRemove = rxMethod<Item>((source$) =>
    source$.pipe(
      switchMap((item) => {
        const id = item.id;
        return dialog
          .open(ConfirmDialog, { data: item })
          .afterClosed()
          .pipe(
            filter((ok): ok is true => ok === true),
            switchMap(() => from(removeItem(id))),
          );
      }),
    ),
  );

  return {
    load,
    removeItem,
    confirmRemove,
  };
})
```

**Why this shape**

- `rxMethod` **pipelines must call the same** `const` **functions** (e.g. `from(removeItem(id))`). Do **not** cast `store` to a fictional type and call `store.deleteItem` / `store.removeItem` from inside another method: the `store` argument in `withMethods` is the **state slice** and does **not** reliably expose sibling method functions at runtime — you can get `… is not a function`.
- Shared snippets (list refresh, snackbars) stay as **private** `const` helpers above; they are **not** returned unless they are part of the public store API.

### withHooks — Wiring rxMethods

Use `onInit` to connect rxMethods to signals. **rxMethod accepts a signal directly** — no `toObservable` needed.

```typescript
withHooks({
  onInit(store) {
    store.autoSave(store.currentConfig);
  },
})
```

### Full Store Example

```typescript
export const MyStore = signalStore(
  { providedIn: 'root' },
  withState<MyState>((persistence = inject(MyService)) => createInitialState(persistence)),
  withComputed(
    (store, registry = inject(RegistryService)) => ({
      derived: computed(() => computeFrom(store, registry)),
    })
  ),
  withMethods(
    (
      store,
      service = inject(MyService),
      dialog = inject(MatDialog)
    ) => ({
      update(x: string): void {
        patchState(store, { value: x });
      },
      openDialog: rxMethod<void>((source$) =>
        source$.pipe(
          switchMap(() => {
            const ref = dialog.open(ConfirmDialog, { data: { title: 'Confirm' } });
            return ref.afterClosed();
          }),
          filter((confirmed) => confirmed === true),
          tap(() => { /* side effect */ })
        )
      ),
    })
  ),
  withHooks({
    onInit(store) {
      store.openDialog(undefined); // or trigger from component
    },
  })
);
```

## Derive State from Resources, Not Explicit State

When a store consumes async data from a `resource()` (e.g., Firestore streams, HTTP), **never duplicate the resource's data or loading status as explicit state fields**. Instead, derive everything via `withComputed` from the resource's built-in signals (`.value()`, `.isLoading()`, `.error()`, `.status()`).

```typescript
// ❌ BAD — duplicating resource data as explicit state
withState<MyState>({ items: [], itemsLoading: true })

// then manually syncing via effect:
// effect(() => { patchState(store, { items: resource.value(), itemsLoading: false }) })

// ✅ GOOD — derive from the resource directly
withResource((store, svc = inject(MyService)) => ({
  itemsResource: svc.createItemsResource(store.someParam),
})),
withComputed((store) => ({
  items: computed(() => store.itemsResourceValue() ?? []),
  itemsLoading: computed(() => store.itemsResourceIsLoading()),
}))
```

**Why**: The resource already encapsulates value, loading, and error state. Duplicating it into `withState` creates two sources of truth that must be manually kept in sync. Deriving via `computed` keeps a single source of truth and eliminates sync bugs.

**When to patch store from a resource**: Use `rxMethod` (not `effect`) wired in `onInit` when you need to transform or select from the resource value into other store state (e.g., loading the active item's config into the store):

```typescript
syncFromResource: rxMethod<Item[] | null | undefined>((source$) =>
  source$.pipe(
    filter((items): items is Item[] => items != null && items.length > 0),
    tap((items) => {
      const active = items.find(i => i.id === store.activeId()) ?? items[0];
      patchState(store, { ...active.config, activeId: active.id });
    })
  )
)

// onInit:
store.syncFromResource(store.itemsResourceValue);
```

## Best Practices


| Practice                            | Example                                                                                                                       |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Inject in params**                | `(store, svc = inject(MyService))` not `const svc = inject(...)` inside body                                                  |
| **Derive from resources**           | Use `withComputed` over the resource's `.value()` / `.isLoading()` — never duplicate as explicit state                        |
| **rxMethod over effect**            | Prefer `rxMethod` wired in `onInit` for reacting to resource changes; avoid `effect()`                                        |
| **rxMethod only when needed**       | Use rxMethod for dialogs, signal-syncing, or reactive triggers; use `async` for simple imperative actions (sign in, checkout) |
| **rxMethod for dialogs**            | Use `switchMap` → `dialog.open().afterClosed()` → `filter` → `tap`                                                            |
| **rxMethod for auto-save**          | `debounceTime` + `tap`; wire in `onInit` with `store.autoSave(store.someSignal)`                                              |
| **Pass signals to rxMethod**        | `store.myRxMethod(store.mySignal)` — no `toObservable`                                                                        |
| **Declare rxMethod in withMethods** | Don't create rxMethod in `onInit`; define it in methods, wire in hook                                                         |
| **Static imports for dialogs**      | Import dialog components at top; avoid dynamic `import()`                                                                     |


## patchState Usage

```typescript
// Partial update
patchState(store, { name: 'New Name' });

// Nested update — spread current, override specific keys
patchState(store, {
  system: {
    ...store.system(),
    color: { ...store.system().color, seedColor: hex },
  },
});

// From function
patchState(store, (state) => ({ count: state.count + 1 }));
```

## Component Usage

```typescript
export class MyComponent {
  protected readonly store = inject(MyStore);

  onRename(item: Item): void {
    this.store.renameItem(item); // rxMethod receives item
  }
}
```

