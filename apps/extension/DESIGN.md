# Odysea Extension Design System

This document outlines the core design language, tokens, and atomic components used in the Odysea Chrome Extension. It serves as a guide for reproducing the extension's look and feel, particularly for the New Tab Page interface.

## 1. Design Tokens

### Colors

The extension utilizes a primarily dark theme (`bg-black`) with targeted accents and a secondary light theme.

**Primary & Accents:**

- `primary`: `#4285F4` (Google Blue) - Used as the primary action color.
- `spotify`: `#1DB954` - Used for Spotify-related UI elements.
- `google`: `#4285F4` - Used for Google-related UI elements.

**Backgrounds:**

- Global App Background: Solid Black (`bg-black`)
- Panels (Dark Mode): `bg-black/60` (60% opacity black with backdrop blur)
- Panels (Light Mode): `bg-white/40` (40% opacity white with backdrop blur)
- Cards (Dark Mode): `bg-neutral-900`
- Cards (Light Mode): `bg-white`

### Typography

- The application uses default Tailwind sans-serif fonts.
- Headings on Menus: text-xs font-bold dark:text-gray-400
- Extended Text Sizes: Custom classes exist for very large typography (e.g., clocks) ranging from `text-5xl` up to `text-13xl`.

### Border Radius

- Extensive use of rounded corners to create a soft, modern feel.
- Cards, Buttons, and Panels utilize `rounded-xl` or `rounded-lg`.

### Effects

- **Shadows:** `shadow-md` for standard depth on Panels and Cards. A custom `shadow-center` (`0 0 40px current-color`) is used for status glowing effects.
- **Blur:** `backdrop-blur-xs` is heavily used on floating Panels to create a frosted glass effect over the background.

## 2. Core Layout & Structures

The overarching layout paradigm revolves around floating, widget-like elements placed over a potentially dynamic background (like the New Tab Page).

### Panels

The `Panel` is the fundamental container for modular widgets.

- **Visuals:** They appear as floating cards with frosted glass (`backdrop-blur-xs`), rounded corners (`rounded-xl`), and a subtle shadow (`shadow-md`).
- **Theming:** They automatically adapt to light/dark modes (translucent white vs. translucent black).
- **Sizes:** They come in predefined sizes: `small` (300x300), `medium` (500x400), and `large` (650x500).

### Cards

The `Card` is used for content grouping inside Panels or as standalone grid items.

- **Visuals:** Solid backgrounds (`bg-white` or `bg-neutral-900`), fully opaque, `rounded-xl`, with a subtle shadow.
- **Padding:** Default generous padding (`p-6`).

### Grid Structures & Lists

- When displaying selectable items, prefer grid layouts.
- Active lists should use card-like layouts.
- Action buttons (like pin, delete) should be hover-revealed to maintain a clean default state.

## 3. Atomic Components

These are the fundamental building blocks of the UI. When designing new interfaces, these patterns should be replicated exactly.

### Button (`Button.svelte`)

- **Appearance:** Solid background using the `primary` color (`#4285F4`). White text, medium font weight.
- **Shape:** `rounded-lg`.
- **States:** Hover state darkens the background (`hover:bg-primary/80`). Focus state utilizes a ring effect (`focus:ring-4 focus:ring-primary/50`).
- **Padding:** `px-5 py-2.5`.

### Icon Button (`IconButton.svelte`)

- **Appearance:** Icon-only buttons without a visible background by default.
- **Colors:** Zinc/Gray by default (`text-zinc-500` / `dark:text-white/70`).
- **States:** Hover turns text darker in light mode (`hover:text-zinc-700`) and solid white in dark mode (`dark:hover:text-white`).

### Input Fields (`Input.svelte`, `Select.svelte`)

- **Appearance:** Gray backgrounds with distinct borders.
- **Light Mode:** `bg-gray-50 border-gray-300 text-gray-900`.
- **Dark Mode:** `dark:bg-gray-700 dark:border-gray-600 dark:text-white`.
- **States:** Focus states highlight with a blue ring and border (`focus:ring-blue-500 focus:border-blue-500`).
- **Shape:** `rounded-lg`.

### Toggle Switch (`Toggle.svelte`)

- **Appearance:** Pill-shaped background with a circular white knob.
- **Colors:** Checked state uses blue (`peer-checked:bg-blue-600`). Unchecked is gray (`bg-gray-200` / `dark:bg-gray-700`). Focus state uses a blue ring.

### Menus (Dropdown/Context)

- **Container:** `dark:bg-black/90` with `rounded-lg` and slight padding.
- Items: text-xs. Hovering/Focusing highlights the item background (focus:bg-gray-800).

### Notifications

- **Appearance:** Floating alerts, solid white/dark gray background (`bg-white` / `dark:bg-gray-800`), bordered, `rounded-md`, `shadow-sm`.
- **Colors:** Success (Green), Error (Red), Info (Blue) represented primarily by the icon color and an optional animated progress bar at the bottom.
