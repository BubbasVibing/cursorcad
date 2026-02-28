# CAD Cursor -- UI Design Engineer Memory

## Project Overview
- **Stack**: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, React Three Fiber + Drei
- **Purpose**: Natural language to 3D print file (STL/3MF) tool
- **Theme**: Dark, Cursor/VS Code-inspired split-pane interface

## Design Tokens
- **Backgrounds**: zinc-950 (primary), zinc-900 (surfaces/cards), zinc-800 (elevated)
- **Borders**: zinc-800 (subtle), zinc-700 (interactive borders)
- **Text**: zinc-100 (primary), zinc-300 (secondary), zinc-500 (muted/placeholder), zinc-600 (disabled)
- **Accent**: emerald-600 (buttons/active), emerald-500 (hover/focus rings), emerald-400 (text accent)
- **Body base**: bg #0a0a0a, text #ededed (set in globals.css)
- **Border radius**: 8px (buttons/inputs) -> 12px (cards) -> 16px (large containers)
- **Grid**: 8px spacing system

## Component Architecture
- **SplitPane**: flex layout, left aside 420px fixed, right main flex-1, border-r divider
- **ChatPanel**: "use client", flex-col full height, header/scroll-area/input-bar
- **Viewport**: dynamic import wrapper -> ViewportCanvas (ssr: false critical for R3F)
- **ViewportCanvas**: R3F Canvas + Grid + OrbitControls + lighting + HUD overlay

## Key Patterns
- R3F components MUST be client-side only: use `dynamic(() => import(...), { ssr: false })`
- ViewportCanvas.tsx is the inner component with actual R3F code; Viewport.tsx wraps it with dynamic import
- ChatPanel manages message state locally (will be replaced by real AI integration)
- InputBar: textarea auto-resize via scrollHeight, Enter to send, Shift+Enter newline
- All icons are inline SVGs (no icon library dependency)

## Fonts
- Geist Sans: `--font-geist-sans` (UI text, via `font-sans` or direct class)
- Geist Mono: `--font-geist-mono` (code/HUD, via `font-mono`)
- Set on `<body>` in layout.tsx as CSS variable classes

## Files Reference
- Layout: `components/layout/SplitPane.tsx`
- Chat: `components/chat/{ChatPanel,InputBar,MessageBubble,TypingIndicator,QuickPromptChips}.tsx`
- Viewport: `components/viewport/{Viewport,ViewportCanvas,ViewportHUD,LoadingOverlay,GeometryMesh}.tsx`
- Page: `app/page.tsx` (composes SplitPane > ChatPanel + Viewport)

## Gotchas
- Tailwind CSS 4 uses `@import "tailwindcss"` (not v3 `@tailwind` directives)
- Path alias `@/*` maps to project root
- `box-sizing: border-box` is set globally in globals.css
- Next.js 16 static generation works with the current setup (build verified)
