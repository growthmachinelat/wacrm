# Chatrelo Design System

> Comprehensive brand identity, design tokens, typography, iconography, and UI component specifications for Chatrelo — the high-velocity WhatsApp CRM and conversational commerce platform.

---

## 1. Brand Identity

### 1.1 Brand Name & Core Meaning
- **Name**: **Chatrelo**
- **Etymology**: The convergence of **Chat** (conversational messaging, instant customer engagement) and **Trelo** (structured pipeline momentum, automated kanban flows, clarity of motion).
- **Tagline**: *Conversations that move.*

### 1.2 Vision & Mission
Chatrelo delivers a high-velocity, self-hostable CRM and automation engine designed natively for WhatsApp. The visual identity breaks away from generic enterprise software with a dark, focused obsidian surface illuminated by an electric neon lime accent — evoking speed, reliability, and modern SaaS craftsmanship.

### 1.3 Target Audience
- **Growth & Sales Teams**: SMBs and scale-ups driving high-volume pipelines via WhatsApp.
- **Support & Operations**: Support agents requiring rapid inbox navigation, multi-agent collaboration, and automated conversational flows.
- **D2C Brands & Creators**: Modern businesses managing customer relationships directly on WhatsApp with zero-friction checkout and messaging workflows.

---

## 2. Logo & Iconography

### 2.1 Logo Origin & Geometry
- **Master Source**: `logo.jpeg` (800 × 800 px)
- **Anatomy**:
  1. **Rounded Chat Bubble**: Asymmetric speech container with smooth rounded corners and a directional tail anchor on the bottom-left.
  2. **Checkmark Cutout**: Embedded central checkmark symbol representing verified message delivery, resolved inquiries, and completed deals.
  3. **High-Contrast Palette**: Electric Neon Lime foreground (`#c6f02c`) set against Dark Obsidian (`#0f1513`).

### 2.2 Asset Manifest
| File Path | Dimensions / Format | Background | Usage Purpose |
| :--- | :--- | :--- | :--- |
| `public/logo.jpeg` | 800 × 800 px JPEG | Solid `#0f1513` | Original high-res raster master |
| `public/logo.png` | 800 × 800 px PNG | Solid `#0f1513` | Lossless, optimized master PNG |
| `public/logo-icon.png` | 800 × 800 px PNG | Transparent | Full-frame symbol with alpha channel |
| `public/logo-mark.png` | 512 × 512 px PNG | Transparent | De-fringed, tightly cropped symbol for UI tiles |
| `public/logo.svg` | Scalable Vector XML | Transparent | Infinite-resolution vector mark |
| `src/app/icon.tsx` | 32 × 32 px Edge PNG | Solid `#0f1513` | Dynamic Next.js favicon & browser tab mark |

### 2.3 Safe Zones & Clearances
- **Minimum Clear Space**: A perimeter equal to at least 20% of the mark's width must surround the logo at all times, free from text, icons, or intersecting borders.
- **Minimum Sizing**:
  - Favicon / Status indicator: `16 × 16 px`
  - Navigation bar / Sidebar mark: `24 × 24 px` (rendered in a `32 × 32 px` container)
  - Auth page headers / Welcome screens: `48 × 48 px` to `56 × 56 px`
- **Background Restrictions**:
  - Primary display is over Dark Obsidian (`#0f1513` or `oklch(0.188 0.010 173)`).
  - On lighter surfaces, display within an Obsidian-backed badge (`bg-[#0f1513]`) to preserve the brand's iconic electric contrast.

---

## 3. Color System

### 3.1 OKLCH Color Model
Chatrelo uses the **OKLCH** color space for all design tokens. OKLCH guarantees perceptual uniformity, predictable contrast ratios, and seamless blending between light and dark modes.

### 3.2 Core Brand Tokens Table
| Token Name | Hex | RGB | OKLCH | Role & Purpose | WCAG Contrast (vs Background) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `--primary` (Dark) | `#c6f02c` | `198, 240, 44` | `oklch(0.894 0.206 122)` | Primary brand accent in dark mode | **14.2:1** on `#0f1513` (AAA Pass) |
| `--primary-foreground` (Dark) | `#0f1513` | `15, 21, 19` | `oklch(0.188 0.010 173)` | Dark obsidian text on lime buttons | **14.2:1** on `#c6f02c` (AAA Pass) |
| `--primary` (Light) | `#15803d` | `21, 128, 61` | `oklch(0.460 0.150 142)` | High-contrast emerald green for light mode | **5.6:1** on `#ffffff` (AA Pass) |
| `--primary-foreground` (Light) | `#ffffff` | `255, 255, 255` | `oklch(0.990 0.000 0)` | Crisp white text on primary buttons in light mode | **5.6:1** on emerald (AA Pass) |
| `--primary-hover` (Dark) | `#d4f54e` | `212, 245, 78` | `oklch(0.930 0.180 122)` | Hover state for dark mode primary elements | **15.4:1** on `#0f1513` |
| `--primary-hover` (Light) | `#166534` | `22, 101, 52` | `oklch(0.400 0.150 142)` | Hover state for light mode primary elements | **7.2:1** on `#ffffff` |
| `--primary-soft` | — | — | `12-15% tint` | Subtle tint for sidebar active items, tags, pills | Surface accent |
| `--background` (Dark) | `#0f1513` | `15, 21, 19` | `oklch(0.188 0.010 173)` | App root canvas, deep dark obsidian foundation | Canvas |
| `--background` (Light) | `#fafcfb` | `250, 252, 251`| `oklch(0.990 0.002 173)` | Crisp, clean light canvas | Light canvas |
| `--card` (Dark) | `#151c19` | `21, 28, 25` | `oklch(0.220 0.010 173)` | Elevated surface for cards, dropdowns, panels | Surface level 1 |
| `--card` (Light) | `#ffffff` | `255, 255, 255` | `oklch(1 0 0)` | Clean white card surface | Light surface |
| `--sidebar` (Dark) | `#0b100e` | `11, 16, 14` | `oklch(0.160 0.010 173)` | Anchored vertical navigation background | Structural anchor |
| `--sidebar` (Light) | `#f5f8f6` | `245, 248, 246` | `oklch(0.985 0.002 173)` | Soft neutral vertical navigation | Light anchor |
| `--border` | `#232d29` | `35, 45, 41` | `oklch(0.290 0.012 173)` | Structural divider lines (Dark: 0.29, Light: 0.922) | Structure |
| `--foreground` | `#fbfbfb` | `251, 251, 251` | `oklch(0.985 0.000 0)` | Primary high-emphasis body text (Dark: 0.985, Light: 0.21) | High Contrast |

---

## 4. Theming & Surfaces

### 4.1 Orthogonal Theming Architecture
The Chatrelo theme engine is split into two independent dimensions:
1. **Mode Dimension (`data-mode`)**:
   - `dark` (Default): Obsidian surfaces calibrated around hue `173`.
   - `light`: Clean, light canvas with crisp borders and calibrated high-contrast emerald green controls (`oklch(0.46 0.15 142)`), eliminating eye-strain and washed-out text.
2. **Accent Theme Dimension (`data-theme`)**:
   - `chatrelo` (Default): Electric Neon Lime (`#c6f02c`) in Dark Mode / Deep Chatrelo Emerald in Light Mode.
   - `violet`: Hostinger-inspired violet (`oklch(0.526 0.247 293)`).
   - `emerald`: Growth green (`oklch(0.62 0.16 162)`).
   - `cobalt`: SaaS blue (`oklch(0.585 0.2 254)`).
   - `amber`: Warm SMB orange (`oklch(0.745 0.16 65)`).
   - `rose`: Modern creator crimson (`oklch(0.645 0.22 16)`).

### 4.2 Zero-Flash Boot Execution
To prevent theme and mode flashing during SSR hydration, `src/app/layout.tsx` executes an inline `THEME_BOOT_SCRIPT` inside `<head>` before the browser executes its first layout pass. It validates and applies `data-theme` and `data-mode` directly from `localStorage` (`chatrelo.theme` and `chatrelo.mode`).

---

## 5. Typography

### 5.1 Font Family
- **Sans-Serif Font**: [Inter](https://fonts.google.com/specimen/Inter) via `next/font/google` (`--font-sans`).
- **Monospace Font**: Geist Mono (`--font-mono`) for API tokens, phone numbers, and code blocks.

### 5.2 Typographic Hierarchy
| Style | Size | Weight | Tracking | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Display / H1** | `24px` (`text-2xl`) to `30px` (`text-3xl`) | `700` (Bold) | `-0.025em` (`tracking-tight`) | Page headers, auth titles |
| **Section / H2** | `18px` (`text-lg`) to `20px` (`text-xl`) | `600` (Semibold) | `-0.02em` (`tracking-tight`) | Card headers, modal titles, drawer headers |
| **Subheading / H3** | `16px` (`text-base`) | `600` (Semibold) | `-0.01em` | Pipeline stage headers, contact names |
| **Body (Default)** | `14px` (`text-sm`) | `400` (Regular) | `normal` | Message bubbles, table cells, form inputs |
| **Body Medium** | `14px` (`text-sm`) | `500` (Medium) | `normal` | Navigation links, button text, table headers |
| **Caption / Meta** | `12px` (`text-xs`) | `500` (Medium) | `normal` | Timestamps, status pills, role chips, helper hints |
| **Code / Key** | `13px` (`text-[13px]`) | `400` (Regular) | `normal` | WABA IDs, phone numbers (`font-mono`) |

---

## 6. UI Components & Best Practices

### 6.1 Buttons
- **Primary Action (`bg-primary text-primary-foreground`)**:
  - Background: Electric Neon Lime (`#c6f02c`).
  - Text: Dark Obsidian (`#0f1513`), semibold.
  - Hover: `hover:bg-primary-hover` with subtle scaling (`transition-all`).
  - Shadow: `shadow-xs hover:shadow-sm`.
- **Secondary / Outline Action**:
  - Background: `bg-transparent hover:bg-card-2`.
  - Border: `border-border`.
  - Text: `text-foreground`.
- **Destructive Action**:
  - Background: `bg-destructive text-destructive-foreground hover:bg-destructive/90`.

### 6.2 Sidebar & Navigation
- **Brand Row**: Anchored with a 32 × 32 px obsidian tile (`bg-[#0f1513] border border-border/40`) containing the Chatrelo logo mark and a bold "Chatrelo" brand logotype.
- **Active Navigation Pill**:
  - `bg-primary/10 text-primary font-medium`: Tinted electric lime surface providing unmistakable focus without visual noise.
- **Unread Badge**:
  - Pill badge with `bg-primary text-primary-foreground text-xs font-semibold px-2 py-0.5 rounded-full`.

### 6.3 Cards & Surface Elevation
- **Base Card**: `bg-card border border-border rounded-xl`.
- **Interactive Card (Kanban, Broadcasts)**:
  - Transition on hover: `hover:border-primary/40 hover:bg-card-2/60`.
- **Modals & Dialogs**: `bg-card border border-border/80 shadow-2xl backdrop-blur-md`.

### 6.4 Status Badges & Role Chips
- **Owner**: `border-amber-500/40 bg-amber-500/10 text-amber-300` (Crown icon)
- **Admin**: `border-primary/40 bg-primary/10 text-primary` (Shield icon)
- **Agent**: `border-border bg-muted text-foreground` (UserCog icon)
- **Viewer**: `border-border bg-card text-muted-foreground` (User icon)

---

## 7. Quality & Accessibility Standards

1. **WCAG 2.1 AA & AAA Compliance**: All primary text and interactive buttons meet or exceed the 7:1 contrast ratio for AAA conformance.
2. **Reduced Motion**: All animations support `prefers-reduced-motion` media queries via `tw-animate-css`.
3. **Touch Targets**: Minimum interactive touch area of 44 × 44 px on mobile surfaces.
4. **Localization Readiness**: All user-facing strings are externalized into `messages/{en,es,pt,ko}.json` preserving ICU message format signatures.
