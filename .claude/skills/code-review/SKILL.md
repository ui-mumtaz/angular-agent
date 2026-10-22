---
name: code-review
description: Review recently changed code against project architecture conventions. Use when the user asks to review code, check conventions, audit recent changes, or says "review", "check my code", "does this follow conventions", or after finishing a multi-file implementation.
---

# Code Review

Review changed files against `docs/standards` and relevant `.agents/skills` references. Do not duplicate full convention text in the report; cite the relevant standard or skill section instead.

## Review Steps

1. **Scope:** Identify changed files with the relevant diff scope (`git diff --name-only`, `--cached`, or `HEAD~N`).
2. **Classify:** Group changed files by type: store (`*.store.ts`), component (`*.component.ts`), template, service (`*.service.ts`), model (`*.model.ts`), and test (`*.spec.ts`).
3. **Templates:** For every changed component, read the full inline template or external HTML when template behavior may be affected. Do not rely only on `git diff --stat`.
4. **Conventions:** Apply every applicable standard in the checklist below, including each standard's audit/check guidance and the template assessment rules in `templates-and-styling.md` when template changes trigger them.
5. **Report:** List deviations in one flat list. If there are no deviations, say so explicitly.

## Routing Hints

Use this table to know where to look first. It does not replace the mandatory coverage checklist.

| Changed files                   | Read                                                                                                                                                                                                                                                                            |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cross-cutting / unfamiliar area | [architecture.md](../../../docs/standards/architecture.md) first, then topic files below                                                                                                                                                                                        |
| Any TS / templates              | [core-engineering.md](../../../docs/standards/core-engineering.md)                                                                                                                                                                                                              |
| `*.component.ts`, templates     | [angular-components.md](../../../docs/standards/angular-components.md), [templates-and-styling.md](../../../docs/standards/templates-and-styling.md), [material.md](../../../docs/standards/material.md), [forms.md](../../../docs/standards/forms.md)                         |
| `*.store.ts`                    | [state-and-stores.md](../../../docs/standards/state-and-stores.md), [ngrx-signal-store skill](../ngrx-signal-store/SKILL.md)                                                                                                                                                   |
| `*.service.ts`                  | [services-and-side-effects.md](../../../docs/standards/services-and-side-effects.md)                                                                                                                                                                                            |
| `*.spec.ts`                     | [testing.md](../../../docs/standards/testing.md)                                                                                                                                                                                                                                |

## Mandatory: all linked standards

You **must** work through **every** row below for each review. For each standard, either:

- **Reviewed** — You applied that document’s rules to the change set (only the files/topics it governs; skip irrelevant passages inside the doc), or  
- **N/A** — The change set touches nothing that standard covers; state that in one short phrase.

Do not skip a row without **Reviewed** or **N/A**.

### Standards index


| Topic                                              | File                                                                                                |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Layers, folders, examples                          | [docs/standards/architecture.md](../../../docs/standards/architecture.md)                           |
| TypeScript, accessibility                          | [docs/standards/core-engineering.md](../../../docs/standards/core-engineering.md)                   |
| Components, template control flow, OnPush          | [docs/standards/angular-components.md](../../../docs/standards/angular-components.md)               |
| Signal Forms                                       | [docs/standards/forms.md](../../../docs/standards/forms.md)                                         |
| Tailwind, large-template splits, mat button layout | [docs/standards/templates-and-styling.md](../../../docs/standards/templates-and-styling.md)         |
| Material syntax, theming                           | [docs/standards/material.md](../../../docs/standards/material.md)                                   |
| Stores, `rxMethod`, local vs app store             | [docs/standards/state-and-stores.md](../../../docs/standards/state-and-stores.md)                   |
| Services, components vs stores                     | [docs/standards/services-and-side-effects.md](../../../docs/standards/services-and-side-effects.md) |
| Harnesses, Playwright, mocks (when tests change)   | [docs/standards/testing.md](../../../docs/standards/testing.md)                                     |


## Findings

List every deviation in a **single flat list**. Do not group or label by severity. For each item: what’s wrong, **file path** (and line or region if useful), cite the relevant `**docs/standards/*.md`** (or skill) section, and a concrete fix if obvious.

If there are no deviations, say so explicitly. Do not invent issues.

## End of review: standards coverage checklist

Close every review with a checklist mirroring the tables above. Example shape (use the real doc/skill names from this file):

```text
Standards coverage
- architecture.md — Reviewed | N/A: …
- core-engineering.md — Reviewed | N/A: …
- angular-components.md — …
- forms.md — …
- templates-and-styling.md — …
- material.md — …
- state-and-stores.md — …
- services-and-side-effects.md — …
- testing.md — …
- ngrx-signal-store skill — …
- angular-developer skill — …
```

**Do not** run builds or tests as part of this review; static convention checks and the checklist above are sufficient.

When reporting findings, cite the relevant `**docs/standards/*.md`** section instead of pasting long excerpts.