# Workforce AI — Design System

Reference for every UI prompt. Update this file when any visual decision changes.

---

## Palette

| Token | Hex | Tailwind class | Usage |
|---|---|---|---|
| `--color-bg` | `#FAF7F2` | `bg-bg` | Page background — warm ivory, never pure white |
| `--color-surface` | `#FFFFFF` | `bg-surface` | Card / panel / sidebar background |
| `--color-ink` | `#211D18` | `text-ink` | Primary body text — warm near-black |
| `--color-ink-muted` | `#6B6358` | `text-ink-muted` | Secondary labels, captions, placeholder text |
| `--color-accent` | `#D97706` | `text-accent` / `bg-accent` | Primary action — buttons, active nav item, links, focus ring |
| `--color-accent-hover` | `#B45309` | `bg-accent-hover` | Pressed / hovered accent state |
| `--color-positive` | `#3F6B4A` | `text-positive` | High performance, finalized period, completed status, on-track |
| `--color-alert` | `#B3432E` | `text-alert` | Attention required (<70% utilisation), absent, rejected/archived, overdue |
| `--color-pending` | `#B8862E` | `text-pending` | Processing period (provisional data), In Review status, neutral warning |
| `--color-border` | `#E7E0D4` | `border-border` | Hairline borders, dividers — warm, not grey |

### Status colour mapping (non-negotiable)

| Domain status | Colour token |
|---|---|
| Attendance: present | `positive` |
| Attendance: absent | `alert` |
| Attendance: late / early leave | `pending` |
| Period: finalized | `positive` |
| Period: processing | `pending` — **always** note that data may be incomplete |
| Work package: On Going | `accent` |
| Work package: In Review | `pending` |
| Work package: Completed | `positive` |
| Work package: Rejected / Archived | `alert` |
| Productivity: High (≥90%) | `positive` |
| Productivity: Normal (70–89%) | `ink-muted` |
| Productivity: Attention (<70%) | `alert` |
| Labour cost: within budget | `positive` |
| Labour cost: over budget | `alert` |

### Do / don't

- **Do** use `--color-bg` for page backgrounds, `--color-surface` for raised elements.
- **Do** use `--color-accent` for all interactive / primary action elements.
- **Don't** introduce blue in any form — not as a default link colour, not in Tremor overrides, not in status badges.
- **Don't** use pure `#000000` or `#ffffff` for text or backgrounds — always use the ink/surface/bg tokens.
- **Don't** add dark-mode variants (`dark:` Tailwind prefix). This product is light-only.
- **Don't** use Inter — not as a body font, not as a fallback in the font stack.

---

## Typography

Fonts are loaded via `next/font/google` in `src/app/layout.tsx`.

| Role | Font | CSS variable | Tailwind class | Usage |
|---|---|---|---|---|
| Display | Space Grotesk | `--font-space-grotesk` | `font-display` | Page `<h1>`, section headers, KPI numbers at large sizes |
| Body / UI | IBM Plex Sans | `--font-ibm-plex-sans` | `font-sans` | All body copy, labels, nav items, table text — set as `<body>` default |
| Monospace / numeric | IBM Plex Mono | `--font-ibm-plex-mono` | `font-mono` | Tabular numbers: attendance %, cost (RM), progress %, project codes |

### Type scale

| Role | Size | Weight | Line height | Font |
|---|---|---|---|---|
| Page title (h1) | `text-2xl` (24px) | `font-semibold` (600) | `leading-tight` | display |
| Section header (h2) | `text-xl` (20px) | `font-semibold` | `leading-snug` | display |
| Card title (h3) | `text-base` (16px) | `font-medium` (500) | `leading-snug` | sans |
| Body | `text-sm` (14px) | `font-normal` (400) | `leading-relaxed` | sans |
| Caption / label | `text-xs` (12px) | `font-medium` | `leading-normal` | sans |
| KPI value (large) | `text-3xl`–`text-4xl` | `font-semibold` | `leading-none` | display |
| Numeric / tabular | any | `font-medium` | — | mono |
| Project code | `text-xs`, uppercase, `tracking-widest` | `font-medium` | — | mono |

---

## Spacing

Use Tailwind's default spacing scale. Common patterns:

- Page padding: `p-6` (24px)
- Card internal padding: `p-4` or `p-5`
- Between page sections: `space-y-6` (24px)
- Between card rows: `space-y-3` or `space-y-4`
- Inline gap between icon + label: `gap-2` or `gap-3`

---

## Radius

| Token | Value | Tailwind class | Usage |
|---|---|---|---|
| `--radius-card` | `10px` | `rounded-[10px]` or `rounded-card` | Cards, input fields, buttons, nav items, dropdowns |
| `--radius-sm` | `6px` | `rounded-[6px]` or `rounded-sm` | Badges, status pills, small tags |
| `--radius-full` | `9999px` | `rounded-full` | Avatar circles, progress indicators |

---

## Shadows

Shadows use warm-tinted rgba (ink colour) — never pure grey/black.

| Token | Value | Tailwind class | Usage |
|---|---|---|---|
| `--shadow-card` | `0 1px 2px rgb(33 29 24 / 0.06), 0 4px 12px rgb(33 29 24 / 0.04)` | `shadow-card` | Default card elevation |
| `--shadow-elevated` | `0 2px 4px rgb(33 29 24 / 0.08), 0 8px 24px rgb(33 29 24 / 0.06)` | `shadow-elevated` | Dropdowns, modals, floating panels |
| `--shadow-sidebar` | `2px 0 8px rgb(33 29 24 / 0.05)` | `shadow-sidebar` | Sidebar right-edge shadow |

---

## Layout shell

- Sidebar: `w-[240px]` expanded, `w-[72px]` collapsed. Width transitions in `200ms ease-in-out`.
- Topbar: `h-16`, white surface, bottom border.
- Main content: `bg-bg`, `p-6`, scrollable.
- Active nav item: amber left-border pill (3px) + `bg-accent-subtle` + `text-accent`.
- Inactive nav item: `text-ink-muted`, hover → `bg-border`.

---

## Tremor overrides

When using Tremor chart components, override default colours via the `colors` prop or custom CSS to match this palette. Never use Tremor's default blue. Preferred chart colours (in order):

1. `#D97706` (accent)
2. `#3F6B4A` (positive)
3. `#B8862E` (pending)
4. `#B3432E` (alert)
5. `#6B6358` (ink-muted)
