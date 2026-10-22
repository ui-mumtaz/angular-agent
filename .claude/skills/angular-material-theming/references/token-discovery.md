# Token Discovery for Angular Material Theming

## Where to Find Tokens

Angular Material M3 components use design tokens for customization. Tokens differ by component and are documented on the official site.

### Step-by-Step

1. **Open Angular Material docs**: https://material.angular.dev
2. **Navigate to the component**: Components → [e.g. List, Button, Form Field]
3. **Check the Styling section**: Usually a "Styling" or "Customization" tab/link
4. **Locate the overrides mixin**: e.g. `list-overrides`, `button-overrides`
5. **Use the listed tokens only**: Invalid token names cause build errors

### Direct Styling URLs (as of Angular Material 21)

| Component | Styling Page |
|-----------|--------------|
| List | https://material.angular.dev/components/list/styling |
| Button | https://material.angular.dev/components/button/styling |
| Form Field | https://material.angular.dev/components/form-field/styling |
| Input | https://material.angular.dev/components/input/styling |
| Select | https://material.angular.dev/components/select/styling |
| Checkbox | https://material.angular.dev/components/checkbox/styling |
| ... | Components → [Name] → Styling |

### API Reference

The **API** tab often includes token names for mixins such as `mat.list-overrides`, `mat.button-overrides`, etc.

## Common Token Patterns

- **Colors**: `*-color`, `*-background-color`, `*-text-color`
- **Typography**: `*-font`, `*-size`, `*-weight`, `*-tracking`, `*-line-height`
- **Shape**: `shape`, `*-shape`, `*-radius`
- **Density**: `height`, `*-height`, `*-space`, `*-padding`
- **State**: `*-hover-*`, `*-focus-*`, `*-selected-*`, `*-disabled-*`

## Validation

Invalid tokens produce clear build errors:

```
Invalid token name `list-item-selected-label-text-color`. Valid tokens are:
active-indicator-color, list-item-label-text-color, list-item-selected-container-color, ...
```

Use only tokens from that list. If a token is missing for a given state, Material may not support it yet; avoid overriding internal classes and consider raising an issue on angular/components.
