---
name: angular-material-theming
description: Theme Angular Material components using mat.theme(), mat.<component>-overrides(), and scoped selectors. Use when theming Material components, adding global theming in styles.scss, or applying component-level overrides. Always look up tokens from the official Angular Material documentation.
---

# Angular Material Theming

Theme Angular Material M3 components using design tokens and overrides. **Never override internal Material classes** (e.g. `.mat-mdc-*`, `.mdc-list-item__*`). Use only `mat.theme()` and `mat.<component>-overrides()` with valid tokens.

## Token Discovery

**Always** look up available tokens before adding overrides. For each component:

1. Go to **https://material.angular.dev** → Components → [Component Name]
2. Open the **API** or **Styling** tab for that component
3. Find `mat.<component>-overrides` or the component’s theming mixin
4. Use only the tokens listed there (invalid token names cause build failures)

Example: List tokens → https://material.angular.dev/components/list/styling

## Global Theming

Apply in `src/styles.scss` after `@use '@angular/material' as mat;`.

### Base Theme

```scss
html {
  @include mat.theme(
    (
      color: mat.$blue-palette,
      typography: 'Roboto',
    )
  );
}
```

### Scoped Theme (e.g. density for a section)

```scss
app-builder main > section:first-of-type mat-form-field {
  @include mat.theme((density: -3));
}
```

### Scoped Theme with Class (e.g. preview density variants)

```scss
.preview-surface.density-neg2 { @include mat.theme((density: -2)); }
.preview-surface.density-neg3 { @include mat.theme((density: -3)); }
```

## Component Overrides (Global or Scoped)

Use `mat.<component>-overrides()` with a selector. Tokens are design tokens—colors, typography, density, shape—not internal CSS.

### Global Overrides (all instances)

```scss
app-component-color-input {
  @include mat.button-toggle-overrides(
    (
      shape: 9px,
      height: 28px,
      'label-text-size': 13px,
      'selected-state-background-color': var(--mat-sys-primary),
      'selected-state-text-color': var(--mat-sys-on-primary),
    )
  );
}
```

### Scoped Overrides by Selector

Scope overrides to a specific area or state:

```scss
/* Default state */
app-sidebar {
  @include mat.list-overrides(
    (
      list-item-label-text-color: #a8abb5,
      list-item-leading-icon-color: #a8abb5,
      list-item-hover-label-text-color: #e0e0e0,
      list-item-selected-container-color: var(--mat-sys-primary),
      list-item-container-shape: 8px,
      /* ... other tokens */
    )
  );
}

/* Activated/selected state via routerLinkActive class */
app-sidebar a.sidebar-nav-active {
  @include mat.list-overrides(
    (
      list-item-label-text-color: var(--mat-sys-on-primary),
      list-item-leading-icon-color: var(--mat-sys-on-primary),
      list-item-hover-label-text-color: var(--mat-sys-on-primary),
      list-item-focus-label-text-color: var(--mat-sys-on-primary),
      list-item-selected-container-color: var(--mat-sys-primary),
    )
  );
}
```

## Component-Level Overrides

For overrides that only affect a single component, use the component’s `styles` array with `::ng-deep` (or `:host ::ng-deep`) so the mixin output applies to projected Material elements:

```typescript
@Component({
  selector: 'app-component-color-input',
  styles: `
    @use '@angular/material' as mat;

    :host ::ng-deep {
      @include mat.button-toggle-overrides(
        (
          shape: 9px,
          height: 25px,
          'label-text-size': 13px,
          'selected-state-background-color': var(--mat-sys-primary),
          'selected-state-text-color': var(--mat-sys-on-primary),
        )
      );
    }
  `,
})
export class ComponentColorInputComponent {}
```

**Prefer global styles** when the same override applies in multiple places (e.g. `styles.scss`). Use component-level styles only when the override is specific to that component.

## Preferred Pattern for State-Based Styling

Avoid overriding internal Material classes. Use a custom class driven by app state and scope token overrides to that class:

1. Add a class via `routerLinkActive`, `[class.xxx]`, or similar
2. Apply `mat.<component>-overrides()` under a selector that includes that class
3. Let Material handle layout and behavior; overrides only change tokens

```html
<a mat-list-item
   [routerLink]="item.route"
   routerLinkActive="sidebar-nav-active"
   [activated]="rla.isActive">
```

```scss
app-sidebar a.sidebar-nav-active {
  @include mat.list-overrides(( /* selected-state tokens */ ));
}
```

## Common Mixins

| Mixin | Use Case |
|-------|----------|
| `mat.theme()` | Base theme, density, color, typography scope |
| `mat.list-overrides()` | mat-list, mat-nav-list, mat-action-list |
| `mat.button-toggle-overrides()` | mat-button-toggle-group |
| `mat.button-overrides()` | mat-button, mat-icon-button, mat-fab |
| `mat.form-field-overrides()` | mat-form-field |
| `mat.input-overrides()` | mat-input |

Exact mixin names and tokens depend on the component—check the Material docs.

## Color Variables

Use theme variables for consistent colors:

- `var(--mat-sys-primary)` / `var(--mat-sys-on-primary)`
- `var(--mat-sys-surface)` / `var(--mat-sys-on-surface)`
- `var(--mat-sys-outline)` / `var(--mat-sys-outline-variant)`

## Additional Resources

- Token discovery and examples: [references/token-discovery.md](references/token-discovery.md)
- Angular Material components: https://material.angular.dev
- Component styling pages: https://material.angular.dev/components/[component]/styling
