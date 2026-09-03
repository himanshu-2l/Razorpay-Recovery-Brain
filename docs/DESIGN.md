# UI/UX Design System & Architectural Standard
## Razorpay Revenue Recovery Brain · Agent Studio
*Generated and enforced via `ui-ux-pro-max` design intelligence.*

---

## 1. Core Philosophy: No "AI Slop" / Clean Enterprise Fintech

To ensure the UI remains organized, uncluttered, and enterprise-grade as more features are added, all components must adhere to the following non-negotiable principles:

1. **Information Density with Breathing Room**:
   - Spacing is standard (16px–24px padding on cards, 8px–12px gap between list items, 32px between major sections).
   - Never cram multiple unrelated widgets into the same visual card.
2. **Progressive Disclosure over Visual Clutter**:
   - Summary view first (KPI cards, high-level indicators).
   - Deep details revealed on-demand via modals (`CaseDetailModal`), dedicated tabs, or collapsible accordions.
3. **No Gratuitous AI Tropes**:
   - Avoid rainbow gradients, glowing neon borders on every card, or excessive floating particles.
   - Accents are semantic signals, not decorations (Emerald = Compliant/Recovered, Red = Blocked/Risk, Amber = Degradation/Warning, Blue = Primary/System, Purple = Voice/Telephony).
4. **Typography Strictness**:
   - Data / IDs / Financial Amounts / Timestamps / Latencies $\rightarrow$ `font-mono` (JetBrains Mono / Fira Code).
   - Headings & Titles $\rightarrow$ `font-sans font-bold tracking-tight`.
   - Body & Descriptions $\rightarrow$ `text-gray-400 font-sans text-xs/sm leading-relaxed`.

---

## 2. Color Palette & Design Tokens

| Token | CSS Variable / Tailwind | Hex Value | Purpose |
| :--- | :--- | :--- | :--- |
| **Canvas Background** | `bg-[#050507]` | `#050507` | Deep OLED black canvas |
| **Surface Card** | `bg-white/[0.02]` / `glass-panel` | `rgba(255,255,255,0.02)` | Primary card surface with backdrop blur |
| **Border Subtle** | `border-white/5` | `rgba(255,255,255,0.05)` | Card dividing borders |
| **Border Active** | `border-white/10` | `rgba(255,255,255,0.10)` | Interactive/focus borders |
| **Razorpay Blue** | `text-[#2B7FFF]` / `bg-[#2B7FFF]` | `#2B7FFF` | Primary brand accent & active states |
| **Success / Recovered** | `text-emerald-400` / `bg-emerald-500` | `#10B981` | Recovery rates, allowed compliance |
| **Warning / Degradation**| `text-amber-400` / `bg-amber-500` | `#F59E0B` | Technical degradation, timeouts |
| **Danger / Blocked** | `text-red-400` / `bg-red-500` | `#EF4444` | Revenue at risk, blocked non-compliant |
| **Voice / AI Studio** | `text-purple-400` / `bg-purple-600` | `#8B5CF6` | Hinglish Telephony agent & LLM features |

---

## 3. Tab Structure & Information Architecture

The application is structured into **5 distinct, dedicated operational surfaces**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            RAZORPAY AGENT STUDIO                            │
├─────────────┬─────────────┬──────────────────┬──────────────┬───────────────┤
│ 📊 Overview │ 📁 Cases    │ ⚡ Webhook       │ 🎙️ Hinglish   │ 🛡️ RBI        │
│  (Command   │  (50+ Live  │    Sandbox       │   Voice      │   Compliance  │
│   Center)   │   Signals)  │    Playground    │   Studio     │   Shield      │
└─────────────┴─────────────┴──────────────────┴──────────────┴───────────────┘
```

- **Command Center (`overview`)**: High-level telemetry: 4 Primary KPI cards, real-time Live Event Ticker, Impact Counter (DSO before/after), and recent cases table.
- **Cases Explorer (`cases`)**: Dedicated filterable table for 50+ cases across all 4 leak vectors (Payment Degradation, Cart Abandonment, Subscriptions, B2B Receivables) with full audit log drawers.
- **Webhook Sandbox (`webhook`)**: Interactive simulator with 5 realistic presets, raw JSON editor, and instant latency & diagnosis feedback.
- **Voice Recovery Studio (`voice`)**: Full telephony UI with live audio waveform, Web Speech TTS playback, bilingual transcript timeline, and GPU LLM mode toggle.
- **RBI Compliance Shield (`compliance`)**: Fair Practices Code compliance audit, 8 AM–7 PM contact window simulation, frequency caps, and 48-hour cool-off logs.

---

## 4. Guidelines for Adding Future Features

When adding new features or components:
1. **Never create redundant tabs**: Check existing tabs before adding a new navigation item.
2. **Follow Component Isolation**: Put complex workflows into their own component file in `dashboard/src/components/`.
3. **Use Lucide Icons only**: Never use raw emojis for UI icons or status indicators.
4. **Ensure Keyboard & Accessibility compliance**:
   - `cursor-pointer` on clickable cards and buttons.
   - Contrast ratio $\ge 4.5:1$ against dark background.
   - Clear focus rings and hover transitions (`transition-all duration-200`).
5. **Keep Build Clean**: Always verify `bun run build` passes with zero TypeScript warnings or unused imports.
