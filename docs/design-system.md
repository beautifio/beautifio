# Beautifio — Design System

**Version:** 1.0
**Status:** Final
**Last Updated:** June 2026

---

## 1. Design Principles

| Prinsip | Deskripsi |
|---------|-----------|
| **Clean** | Ruang putih yang cukup, tidak berantakan, fokus pada konten |
| **Modern** | Tipografi kontemporer, border radius konsisten, bayangan halus |
| **Trustworthy** | Warna solid, navigasi jelas, feedback visual tiap interaksi |
| **Optimistic** | Warna hangat, ilustrasi positif, mikro-interaksi yang menyenangkan |
| **Human** | Bahasa santai namun profesional, pendekatan personal |

**Style Reference:** Duolingo, Headspace, Linear, Notion, LinkedIn Learning

---

## 2. Color Palette

### 2.1 Brand Colors

| Token | Name | Hex | Usage |
|-------|------|-----|-------|
| `--color-primary` | Peacock | `#084463` | Navbar, CTA, Header, Primary Buttons |
| `--color-secondary` | Icy Sky | `#6BB9D4` | Card Accent, Illustration, Secondary Elements |
| `--color-accent` | Saffron | `#FFC64F` | Progress, Badge, Highlight, Active States |

### 2.2 Neutral Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-bg` | `#F8FAFC` | Halaman background |
| `--color-surface` | `#FFFFFF` | Cards, Modal, Sheet |
| `--color-text-primary` | `#1E293B` | Heading, Body text |
| `--color-text-secondary` | `#64748B` | Caption, Label, Helper text |
| `--color-border` | `#E2E8F0` | Dividers, Card border |

### 2.3 Semantic Colors

| Token | Hex | Usage |
|-------|-----|-------|
| Success | `#10B981` | Verified, Complete |
| Warning | `#F59E0B` | Pending, Attention |
| Error | `#EF4444` | Error, Rejected |
| Info | `#3B82F6` | Information |

---

## 3. Typography

### 3.1 Font Family

| Property | Value |
|----------|-------|
| Primary | **Poppins** |
| Fallback | Inter, sans-serif |

### 3.2 Type Scale

| Level | Size | Weight | Usage |
|-------|------|--------|-------|
| **H1** | 40px (2.5rem) | 700 Bold | Hero headline |
| **H2** | 32px (2rem) | 700 Bold | Section heading |
| **H3** | 24px (1.5rem) | 600 Semibold | Card title |
| **Body** | 16px (1rem) | 400 Regular | Paragraph text |
| **Caption** | 14px (0.875rem) | 400 Regular | Secondary text |
| **Small** | 12px (0.75rem) | 500 Medium | Badge, metadata |
| **Tiny** | 10px (0.625rem) | 600 Semibold | Overline, label |

### 3.3 Line Height

| Usage | Line Height |
|-------|-------------|
| Heading | 1.2 |
| Body | 1.6 |
| Caption | 1.5 |

### 3.4 Letter Spacing

| Usage | Tracking |
|-------|----------|
| Normal | 0 |
| Uppercase label | 0.05em |
| Overline | 0.1em |

---

## 4. Spacing

| Token | Size | Usage |
|-------|------|-------|
| `--space-xs` | 4px | Icons gap |
| `--space-sm` | 8px | Button padding |
| `--space-md` | 16px | Card padding |
| `--space-lg` | 24px | Section padding horizontal |
| `--space-xl` | 32px | Section spacing |
| `--space-2xl` | 48px | Hero padding |
| `--space-3xl` | 64px | Large section gap |

---

## 5. Border Radius

| Token | Size | Usage |
|-------|------|-------|
| `--radius-sm` | 12px | Badge, small element |
| `--radius-md` | 16px | Card, Input, Button |
| `--radius-lg` | 24px | Modal, Large card |
| `--radius-xl` | 32px | Hero section, Sheet |
| `--radius-full` | 9999px | Avatar, Pill |

---

## 6. Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-card` | `0 8px 24px rgba(0,0,0,0.08)` | Card default |
| `--shadow-dropdown` | `0 4px 16px rgba(0,0,0,0.12)` | Dropdown, Modal |
| `--shadow-button` | `0 2px 8px rgba(0,0,0,0.1)` | Button |
| `--shadow-hero` | `0 8px 32px rgba(0,0,0,0.16)` | Hero section |

---

## 7. Layout

### 7.1 Breakpoints

| Device | Width |
|--------|-------|
| Mobile | 390px (base) |
| Tablet | 768px |
| Desktop | 1024px |
| Wide | 1280px |

### 7.2 Grid

- Mobile: 4-column
- Tablet: 8-column
- Desktop: 12-column
- Gutter: 24px

### 7.3 Container

- Max width: 1280px
- Padding: 24px (mobile), 32px (tablet), 48px (desktop)

---

## 8. Components

### 8.1 Button

| Variant | Style |
|---------|-------|
| **Primary** | bg-primary text-white, pill, 12px radius |
| **Secondary** | border-primary text-primary |
| **Accent** | bg-accent text-primary |
| **Ghost** | transparent, hover:bg-gray-100 |
| Sizes: sm (32px), md (40px), lg (48px) |

### 8.2 Input

- Height: 48px
- Padding: 12px 16px
- Radius: 12px
- Border: 1px solid `#E2E8F0`
- Focus: border-primary + ring-2

### 8.3 Card

- Background: Surface (#FFFFFF)
- Border: 1px solid `#E2E8F0`
- Radius: 16px
- Shadow: 0 8px 24px rgba(0,0,0,0.08)
- Padding: 16px (default), 24px (large)

### 8.4 Badge

- Radius: 12px
- Font: 12px, 600 semibold
- Padding: 4px 12px

### 8.5 Avatar

- Size: 32px, 40px, 48px, 64px
- Radius: full
- Gradient default: primary → secondary

### 8.6 Bottom Navigation (Mobile)

- Height: 64px
- Active: icon + label, primary color
- Inactive: icon only, secondary color
- Border top: 1px solid `#E2E8F0`

### 8.7 Progress Bar

- Height: 8px
- Radius: 999px
- Track: bg-gray-100
- Fill: accent gradient

---

## 9. Iconography

- Library: **Lucide React**
- Sizes: 16px (inline), 20px (default), 24px (large)
- Style: Outline, stroke-width 2
- Warna mengikuti konteks (inherit by default)

---

## 10. Motion

| Element | Duration | Easing |
|---------|----------|--------|
| Page transition | 300ms | ease-in-out |
| Card hover | 200ms | ease |
| Modal enter/exit | 250ms | ease-out |
| Accordion | 300ms | ease |
| Fade-in (scroll) | 700ms | ease-out |
