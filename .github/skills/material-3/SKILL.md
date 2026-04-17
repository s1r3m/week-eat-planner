---
name: material-3
description: >
  Implement Google's Material Design 3 (Material You) UI system. Primary stack: Vue 3,
  Tailwind CSS v4, and reka-ui primitives. Covers MD3 tokens, component patterns, layout,
  theming, and accessibility using modern web technologies. Use when: "material design",
  "MD3", "material you", "Vue material", "Tailwind material".
user-invokable: true
argument-hint: "[component|theme|layout|scaffold|audit] [description or URL]"
---

# Material Design 3 (Vue 3 + Tailwind + reka-ui)

This skill guides implementation of Google's Material Design 3 (MD3) using **Vue 3**, **Tailwind CSS v4**, and **reka-ui**. MD3 is a personal, adaptive, expressive design system characterized by dynamic color, tonal surfaces, rounded shapes, and spring-based motion.

## Philosophy

MD3 is built on three principles:

- **Personal**: Dynamic color adapts UI to the user's preferences. Theming is individual, not one-size-fits-all.
- **Adaptive**: Layouts transform across window size classes. Components resize, reposition, and change form factor responsively.
- **Expressive**: Emphasized typography and motion create moments of delight without sacrificing usability.

**Key differences from MD2:**

- Tonal surfaces replace elevation shadows as the primary depth cue.
- Fully rounded corners by default for buttons and chips (not slightly rounded).
- 3 levels of user-controlled contrast (standard/medium/high).

## Design Token System

In this stack, MD3 tokens are implemented as CSS custom variables and consumed via **Tailwind CSS utility classes**.

### Color Tokens (`--md-sys-color-*`)

Mapped to Tailwind `bg-*`, `text-*`, `border-*` utilities.
| Token / Tailwind | Purpose |
|------------------|---------|
| `primary` / `on-primary` | High-emphasis fills, text, icons against surface |
| `primary-container` / `on-primary-container` | Standout fill for key components (FAB, active states) |
| `secondary` / `on-secondary` | Less prominent accents |
| `secondary-container` / `on-secondary-container` | Recessive components (tonal buttons) |
| `tertiary` / `on-tertiary` | Contrasting accents |
| `error` / `on-error` | Error states |
| `error-container` / `on-error-container` | Error container fills |
| `surface` / `on-surface` | Default background |
| `on-surface-variant` | Lower-emphasis text/icons on surface |
| `surface-container-*` (lowest to highest) | Container backgrounds (cards, menus, nav areas). Replaces elevation shadows. |
| `outline` | Important boundaries (text field borders) |
| `outline-variant` | Decorative elements (dividers) |

**Example:** `<div class="bg-primary-container text-on-primary-container">...</div>`

### Typography Tokens

Mapped to Tailwind custom text utilities (e.g., `text-display-lg`, `text-title-md`, `text-body-sm`).
| Scale | Sizes | Use |
|-------|-------|-----|
| Display | L / M / S | Hero text, large numbers |
| Headline | L / M / S | Section headers |
| Title | L / M / S | Smaller headers, card titles |
| Body | L / M / S | Paragraph text, descriptions |
| Label | L / M / S | Buttons, chips, captions |

### Shape Tokens

Mapped to Tailwind `rounded-*` utilities.
| MD3 Token | Tailwind Class | Example components |
|-----------|----------------|-------------------|
| Extra Small (4dp)| `rounded-sm` | Chips, snackbars |
| Small (8dp) | `rounded` / `rounded-md` | Text fields, menus |
| Medium (12dp) | `rounded-lg` / `rounded-xl` | Cards |
| Large (16dp) | `rounded-2xl` | FABs, navigation drawer |
| Extra Large (28dp)| `rounded-3xl` | Dialogs, bottom sheets |
| Full | `rounded-full` | Buttons, chips, badges |

### Elevation Levels (Tonal)

Elevation in MD3 is communicated through **tonal surface color**, not shadows. Shadows are only used when needed for additional protection against busy backgrounds.

- Level 0: `bg-surface`
- Level 1: `bg-surface-container-low`
- Level 2: `bg-surface-container`
- Level 3: `bg-surface-container-high`
- Level 4/5: `bg-surface-container-highest` (Hover/focus states)

## Component Quick Reference (Vue 3 + reka-ui)

We use **reka-ui** to provide accessible headless primitives, styled with Tailwind CSS to match MD3 guidelines.

| Component | Reka UI Primitive             | Tailwind Styling Notes                                                                                                                                                                     |
| --------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Button    | `<Primitive as="button">`     | `rounded-full px-6 h-10 font-label-lg` (Filled: `bg-primary text-on-primary`, Tonal: `bg-secondary-container text-on-secondary-container`, Outlined: `border border-outline text-primary`) |
| FAB       | `<Primitive as="button">`     | `rounded-2xl w-14 h-14 bg-primary-container text-on-primary-container drop-shadow-sm`                                                                                                      |
| Checkbox  | `CheckboxRoot`                | `rounded-sm border-outline data-[state=checked]:bg-primary`                                                                                                                                |
| Switch    | `SwitchRoot`                  | Track: `bg-surface-variant`, Thumb: `bg-outline rounded-full`                                                                                                                              |
| Dialog    | `DialogRoot`, `DialogContent` | `bg-surface-container-high rounded-3xl p-6`                                                                                                                                                |
| Menu      | `DropdownMenuRoot`            | `bg-surface-container rounded-sm py-2`                                                                                                                                                     |
| Tabs      | `TabsRoot`, `TabsList`        | `border-b border-outline-variant`. Active tab gets primary underline.                                                                                                                      |
| Snackbar  | `ToastRoot`                   | `bg-inverse-surface text-inverse-on-surface rounded-sm px-4 py-3`                                                                                                                          |
| Card      | Native `<div>`                | `rounded-xl` (Filled: `bg-surface-container-highest`, Outlined: `border border-outline-variant bg-surface`, Elevated: `bg-surface-container-low drop-shadow-sm`)                           |

## Common Patterns (Vue 3)

### App Shell (Responsive Navigation)

```vue
<script setup lang="ts">
import { ref } from "vue";
</script>

<template>
  <div
    class="flex min-h-screen bg-surface text-on-surface flex-col sm:flex-row"
  >
    <!-- Navigation Rail (Tablet/Desktop) -->
    <nav
      class="hidden sm:flex flex-col items-center w-20 bg-surface border-r border-outline-variant py-3 gap-3"
    >
      <button
        class="w-14 h-14 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center mb-4"
      >
        <i class="icon-edit"></i>
      </button>
      <div
        class="flex flex-col items-center gap-1 text-label-sm text-on-surface-variant"
      >
        <div
          class="w-16 h-8 rounded-full bg-secondary-container flex items-center justify-center"
        >
          <i class="icon-home text-on-secondary-container"></i>
        </div>
        <span>Home</span>
      </div>
    </nav>

    <main class="flex-1 flex flex-col">
      <header class="h-16 px-4 flex items-center bg-surface">
        <h1 class="text-title-lg">Page Title</h1>
      </header>
      <div class="p-6 flex-1">
        <!-- Content here -->
      </div>
    </main>

    <!-- Bottom Navigation (Mobile) -->
    <nav
      class="sm:hidden h-20 bg-surface-container border-t border-outline-variant flex justify-around items-center px-2"
    >
      <!-- Active Tab -->
      <div class="flex flex-col items-center gap-1">
        <div
          class="w-16 h-8 rounded-full bg-secondary-container flex items-center justify-center"
        >
          <i class="icon-home text-on-secondary-container"></i>
        </div>
        <span class="text-label-sm font-medium text-on-surface">Home</span>
      </div>
      <!-- Inactive Tab -->
      <div class="flex flex-col items-center gap-1">
        <div
          class="w-16 h-8 flex items-center justify-center text-on-surface-variant"
        >
          <i class="icon-search"></i>
        </div>
        <span class="text-label-sm text-on-surface-variant">Search</span>
      </div>
    </nav>
  </div>
</template>
```

### Card Grid

```vue
<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    <!-- Outlined Card -->
    <div
      class="rounded-xl border border-outline-variant bg-surface overflow-hidden flex flex-col"
    >
      <img
        src="/image.jpg"
        alt="Description"
        class="w-full aspect-video object-cover"
      />
      <div class="p-4 flex-1">
        <h3 class="text-title-md mb-1">Card Title</h3>
        <p class="text-body-md text-on-surface-variant">
          Supporting text for this card.
        </p>
      </div>
      <div class="p-4 pt-0 flex justify-end gap-2">
        <button
          class="px-6 h-10 rounded-full font-label-lg text-primary hover:bg-primary/10 transition-colors"
        >
          Learn more
        </button>
        <button
          class="px-6 h-10 rounded-full font-label-lg bg-secondary-container text-on-secondary-container hover:bg-secondary-container/80 transition-colors"
        >
          Action
        </button>
      </div>
    </div>
  </div>
</template>
```

## Anti-Patterns

**Never do these when implementing MD3 in Vue/Tailwind:**

- **Hardcode raw Tailwind colors (e.g., `bg-blue-500`)**: Always use your semantic MD3 tokens (e.g., `bg-primary`, `text-on-surface`). Hardcoded colors break dark mode and dynamic theming.
- **Ignore tonal pairing**: Only combine colors in their intended pairs (e.g., `bg-primary` + `text-on-primary`, `bg-surface-container` + `text-on-surface`).
- **Use `border-outline` for dividers**: Use `border-outline-variant` for dividers and borders. `border-outline` is for high-emphasis boundaries like text field focus states.
- **Use shadows for elevation by default**: MD3 uses tonal elevation (`bg-surface-container-*`) instead of `shadow-*` utility classes for most surfaces.
- **Use arbitrary `rounded-*` sizes**: Stick to the MD3 shape scale (`rounded-sm` for chips, `rounded-xl` for cards, `rounded-full` for buttons).
- **Ignore Accessibility APIs**: When building custom components, always use `reka-ui` primitives instead of raw `div`s to ensure ARIA roles, keyboard navigation, and focus management are handled.

## MD3 Compliance Audit

When invoked with `audit` as the argument, analyze the target Vue component and produce a compliance report.

### Audit Procedure

Check `.vue` files for the following:

1. **Color Tokens**: Are they using semantic `bg-primary`, `text-on-surface` classes instead of `bg-red-500`? Are text and backgrounds paired correctly?
2. **Typography**: Are MD3 text utilities (`text-title-lg`, `text-body-md`) used consistently?
3. **Shape**: Are buttons `rounded-full`? Are cards `rounded-xl`?
4. **Elevation**: Are cards and menus using `bg-surface-container-*` instead of large box shadows?
5. **Components**: Is `reka-ui` used for complex interactions (Dialogs, Menus, Switches) to ensure accessibility?
6. **Layout**: Does the layout respond to screen sizes (e.g., switching from bottom nav to side rail using `sm:` Tailwind prefixes)?

### Audit Report Format

Produce the report focusing on Vue/Tailwind specific findings, highlighting exact lines in the `.vue` files where arbitrary Tailwind values or incorrect MD3 patterns are used.
