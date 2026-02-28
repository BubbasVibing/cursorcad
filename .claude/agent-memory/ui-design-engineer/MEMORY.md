# CAD Cursor -- UI Design Engineer Memory

## Project Overview
- **Stack**: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, React Three Fiber + Drei
- **Purpose**: Natural language to 3D print file (STL/3MF) tool
- **Theme**: Futuristic white/violet -- glass-morphism floating island layout

## Design Tokens (v2 -- White/Violet Theme)
- **Body base**: bg #f7f7fb, text #1a1a2e (set in globals.css)
- **Backgrounds**: white/70 + backdrop-blur-xl (glass panels), gray-50 (inputs), gray-100 (assistant bubbles), gray-200 (viewport bg)
- **Borders**: gray-200 (subtle), gray-200/60 (panel dividers), white/50 (glass island border)
- **Text**: gray-800 (primary), gray-600 (secondary), gray-400 (muted/placeholder), gray-500 (chips)
- **Accent**: violet-500 (buttons/active/logo), violet-400 (hover), violet-600 (hover text)
- **Semantic**: emerald-500 (watertight status dot), amber-500 (not-watertight status dot)
- **Canvas bg**: #e5e5ea (light grey), white ground platform, #c0c0c0/#d5d5d5 grid lines
- **Border radius**: 8px (buttons/inputs) -> 12px (cards) -> 16px (large containers) -> rounded-2xl (island)
- **Grid**: 8px spacing system
- **Shadows**: shadow-2xl (floating island), shadow-lg (toggle button), shadow-sm (controls)

## Component Architecture
- **page.tsx**: Full-screen viewport bg + floating right-side chat island (no SplitPane)
  - Chat island: absolute positioned, rounded-2xl, glass-morphism, 20px edge margins
  - Toggle button: chevron pill on right edge, visible on hover zone
  - Drag-to-resize: thin handle on left edge of island (320-600px range, default 400px)
- **SplitPane**: DEPRECATED (still exists but not imported -- left as dead code)
- **ChatPanel**: "use client", flex-col full height, header/scroll-area/input-bar, calls /api/generate
- **Viewport**: dynamic import wrapper -> ViewportCanvas (ssr: false critical for R3F)
- **ViewportCanvas**: R3F Canvas + gridHelper + white platform + AxisLines + OrbitControls + HUD + grid controls

## Key Patterns
- R3F components MUST be client-side only: use `dynamic(() => import(...), { ssr: false })`
- Use `<gridHelper>` NOT Drei `<Grid>` (avoids z-fighting with white platform)
- Use `meshBasicMaterial` for white platform (meshStandardMaterial causes grey tint from lighting)
- Wrap grid elements in `<group key={gridSize}>` so they remount when size changes
- AxisLines component uses useMemo for Float32Array positions
- OrbitControls ref (three-stdlib type) for reset-view functionality
- ChatPanel calls /api/generate and passes code to parent via onCodeGenerated
- InputBar: textarea auto-resize via scrollHeight, Enter to send, Shift+Enter newline
- All icons are inline SVGs (no icon library dependency)

## Fonts
- Geist Sans: `--font-geist-sans` (UI text, via `font-sans` or direct class)
- Geist Mono: `--font-geist-mono` (code/HUD, via `font-mono`)
- Set on `<body>` in layout.tsx as CSS variable classes

## Files Reference
- Page: `app/page.tsx` (floating island layout, toggle, resize)
- Chat: `components/chat/{ChatPanel,InputBar,MessageBubble,TypingIndicator,QuickPromptChips}.tsx`
- Viewport: `components/viewport/{Viewport,ViewportCanvas,ViewportHUD,LoadingOverlay,GeometryMesh}.tsx`
- Layout: `components/layout/SplitPane.tsx` (DEPRECATED, unused)
- Backend: `lib/{jscad-runner,jscad-to-three,stl-export}.ts`, `app/api/generate/route.ts`

## Gotchas
- Tailwind CSS 4 uses `@import "tailwindcss"` (not v3 `@tailwind` directives)
- Path alias `@/*` maps to project root
- `box-sizing: border-box` is set globally in globals.css
- Next.js 16 static generation works with the current setup (build verified)
- OrbitControls type import: `import type { OrbitControls as OrbitControlsType } from "three-stdlib"`
- "use client" must appear at file top if hooks/events used -- never duplicate it
