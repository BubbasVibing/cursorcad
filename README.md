# CAD Cursor

**Natural language to 3D print file.** Describe a part in plain English, get a downloadable STL/3MF in seconds.

CAD Cursor is a full-stack web app that bridges conversational AI and parametric 3D modeling. Users type what they want — "make a pipe flange with bolt holes" — and Claude generates [JSCAD](https://openjscad.xyz/) code that's compiled, validated, and rendered in a live 3D viewport. The result can be exported directly to STL or 3MF for slicing and 3D printing.

---

## How It Works

```
User prompt
    │
    ▼
┌─────────────────────┐
│   ChatPanel (React)  │──── conversation history + current code
│                      │
└────────┬────────────┘
         │  POST /api/generate
         ▼
┌─────────────────────┐
│   API Route (Next)   │──── server-side only, API key never touches client
│   lib/claude.ts      │──── system prompt + optional code context
│                      │
└────────┬────────────┘
         │  JSCAD code string
         ▼
┌─────────────────────┐
│   Sandbox Validator  │──── new Function() wrapper, not eval()
│   lib/jscad-runner   │──── validates return is geom3
│                      │
│   ┌── FAIL ──────┐  │     Up to 3 retries with error feedback
│   │ Retry with   │  │     sent back to Claude
│   │ error context │◄─┘
│   └──────────────┘
│
│   ── SUCCESS ──
         │
         ▼
┌─────────────────────┐
│   jscad-to-three.ts  │──── Geom3 → Three.js BufferGeometry
│                      │──── fan-triangulation + flat-shaded normals
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│   React Three Fiber  │──── OrbitControls, three-point lighting
│   ViewportCanvas     │──── wireframe toggle, grid, axis lines
│                      │
│   Export → STL / 3MF │──── browser download with smart filename
└─────────────────────┘
```

---

## Features

### Core Pipeline
- **Conversational generation** — full conversation history is threaded to Claude, so "make it taller" and "add a hole through the center" work naturally
- **Context-aware editing** — current model code is injected into the system prompt so Claude edits rather than regenerates
- **Self-correcting retry loop** — if generated code fails sandbox validation, the error is fed back to Claude for up to 3 automatic retries
- **Sandboxed execution** — JSCAD code runs in a `new Function()` wrapper with only 11 whitelisted primitives passed as arguments

### 3D Viewport
- **Real-time rendering** via React Three Fiber with OrbitControls (rotate, zoom, pan)
- **Three-point lighting** for polished model presentation
- **Wireframe toggle** to inspect geometry structure
- **Adjustable grid** with +/- controls (10-100 units)
- **Reset view** button to snap back to default camera position
- **XYZ axis indicator** lines (red/green/blue)

### Export
- **STL export** (binary) — universal format for all slicers
- **3MF export** (binary) — modern format preferred by Bambu Studio, PrusaSlicer
- **Smart filenames** derived from the user's prompt (e.g., `pipe-flange-with-bolt-holes.stl`)
- **Format toggle** in the HUD — switch between STL and 3MF with one click

### UI/UX
- **Glass-morphism chat island** — floating panel on the right, resizable (320-600px), with show/hide toggle
- **Quick prompt chips** — 6 pre-tested example prompts for instant onboarding
- **Typing indicator** with animated dots during generation
- **Loading overlay** with cycling status messages ("Interpreting prompt..." → "Generating geometry..." → "Compiling model...")
- **Clean error states** — every failure path shows a user-friendly message, never raw errors or stack traces
- **Model info HUD** — face count, watertight status indicator

### Demo Safety
- **God Mode** (`Cmd+Shift+G` / `Ctrl+Shift+G`) — hidden shortcut that instantly loads a pre-validated mechanical bearing housing model, bypassing Claude entirely. Invisible to the audience; exists solely as a safety net for live demos.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS 4 |
| UI | React 19 |
| 3D Rendering | React Three Fiber + Drei + Three.js |
| Geometry Engine | @jscad/modeling (browser-only) |
| Export | @jscad/stl-serializer + @jscad/3mf-serializer |
| AI | Anthropic SDK (Claude Sonnet 4.5, server-side only) |
| Fonts | Geist Sans + Geist Mono |

---

## Getting Started

### Prerequisites

- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com/)

### Setup

```bash
# Clone the repo
git clone https://github.com/your-username/cursorcad.git
cd cursorcad

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local and add your Anthropic API key:
# ANTHROPIC_API_KEY=sk-ant-...

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | Run ESLint |

---

## Project Structure

```
cursorcad/
├── app/
│   ├── api/generate/
│   │   └── route.ts            # POST endpoint — Claude API (server-side only)
│   ├── page.tsx                # Root layout: viewport + chat island + god mode
│   ├── layout.tsx              # HTML shell, fonts, metadata
│   └── globals.css             # Tailwind import + base styles
│
├── components/
│   ├── chat/
│   │   ├── ChatPanel.tsx       # Message list, retry loop, conversation history
│   │   ├── InputBar.tsx        # Auto-expanding textarea, Enter to send
│   │   ├── MessageBubble.tsx   # User (violet) / assistant (gray) bubbles
│   │   ├── QuickPromptChips.tsx # 6 example prompt buttons
│   │   └── TypingIndicator.tsx # Animated dots
│   └── viewport/
│       ├── Viewport.tsx        # Dynamic import wrapper (ssr: false)
│       ├── ViewportCanvas.tsx  # R3F canvas, lighting, grid, controls
│       ├── GeometryMesh.tsx    # Mesh renderer (solid + wireframe)
│       ├── ViewportHUD.tsx     # Model info, export button, toggles
│       └── LoadingOverlay.tsx  # Cycling status messages
│
├── lib/
│   ├── claude.ts               # Anthropic SDK wrapper, system prompt injection
│   ├── jscad-runner.ts         # Sandbox executor (new Function + 11 primitives)
│   ├── jscad-to-three.ts       # Geom3 → Three.js BufferGeometry converter
│   ├── stl-export.ts           # Binary STL export + browser download
│   ├── 3mf-export.ts           # Binary 3MF export + browser download
│   └── types.ts                # ConversationMessage interface
│
├── prompts/
│   └── system.ts               # Full system prompt with constraints + examples
│
├── types/
│   └── jscad.d.ts              # TypeScript declarations for JSCAD serializers
│
└── .env.example                # ANTHROPIC_API_KEY=
```

---

## Architecture

### Client-Server Split

The app enforces a strict separation:

- **Server-side** — Claude API calls happen exclusively in `app/api/generate/route.ts`. The API key never reaches the client.
- **Client-side** — JSCAD code execution, geometry conversion, Three.js rendering, and file export all happen in the browser. JSCAD modules are never imported in server components.

### JSCAD Sandbox

Generated code is executed via `new Function()`, not `eval()`. The 11 allowed primitives are passed as function arguments — the generated code has no access to `import`, `require`, `window`, or `document`:

```
cuboid  sphere  cylinder  torus
union  subtract  intersect
translate  rotate  scale  mirror
```

The sandbox validates that the return value is a valid `geom3` object before passing it to the renderer.

### Conversation Context

The app maintains two parallel message tracks:

1. **UI messages** (`useState`) — what the user sees ("Model generated — check the viewport")
2. **Claude messages** (`useRef`) — what Claude sees (the actual JSCAD code as assistant turns)

This separation means Claude always has the real code context for follow-up edits, while the user sees clean status messages. The `conversationRef` is a ref (not state) to avoid unnecessary re-renders.

### Self-Correction Retry Loop

When Claude generates code that fails sandbox validation:

1. The error message and failed code are packaged into a retry prompt
2. This retry prompt is sent as a temporary message (not persisted to conversation history)
3. Claude generates a corrected version
4. This repeats up to 3 times
5. Only the final successful code (or failure message) is persisted to the conversation

### Export Pipeline

```
JSCAD Geom3 → @jscad/stl-serializer (binary) → Blob → URL.createObjectURL → <a> download
                                                  ↕
              @jscad/3mf-serializer (binary) → Blob → URL.createObjectURL → <a> download
```

Filenames are derived from the user's last prompt, slugified (lowercased, special chars replaced with hyphens, capped at 40 characters).

---

## JSCAD Primitives Reference

These are the only operations available to generated code:

| Primitive | Signature | Description |
|-----------|-----------|-------------|
| `cuboid` | `cuboid({ size: [w, h, d] })` | Box centered at origin |
| `sphere` | `sphere({ radius: r, segments?: n })` | Sphere centered at origin |
| `cylinder` | `cylinder({ radius: r, height: h, segments?: n })` | Cylinder along Z axis |
| `torus` | `torus({ innerRadius: r1, outerRadius: r2 })` | Torus in XY plane |
| `union` | `union(a, b, ...)` | Combine solids |
| `subtract` | `subtract(a, b, ...)` | Cut b from a |
| `intersect` | `intersect(a, b, ...)` | Keep overlap |
| `translate` | `translate([x, y, z], solid)` | Move |
| `rotate` | `rotate([rx, ry, rz], solid)` | Rotate (radians) |
| `scale` | `scale([sx, sy, sz], solid)` | Scale |
| `mirror` | `mirror({ normal: [x, y, z] }, solid)` | Mirror across plane |

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Your Anthropic API key (`sk-ant-...`) |

The app handles a missing key gracefully — the API route returns a clean 500 error ("Server is not configured — missing API key") and the chat shows the error without exposing internals.

---

## Error Handling

Every failure path produces a clean, user-facing message:

| Scenario | User Sees |
|----------|-----------|
| Missing API key | "Server is not configured — missing API key" |
| Claude API failure | "Failed to generate model — please try again" |
| Network timeout / HTML error page | "Server returned an unexpected response. Please try again." |
| Network unreachable | "Failed to reach the server. Is the dev server running?" |
| All 3 retries fail | "Sorry, I wasn't able to generate valid geometry for that description." |
| JSCAD compilation error | Error overlay with message (no stack traces) |
| Export serializer failure | Alert: "Export failed. Try the other format or regenerate the model." |
| Rapid double-click | Silently ignored (guard ref prevents duplicate sends) |
| Malformed request body | 400: "Invalid request body" |

---

## Deployment

### Production Build

```bash
npm run build   # Compiles and optimizes
npm run start   # Serves on port 3000
```

### Environment

Set `ANTHROPIC_API_KEY` in your hosting provider's environment variables. The app has no other external dependencies — no database, no Redis, no file storage.

### Hosting Requirements

- Node.js 18+ runtime
- Single environment variable (`ANTHROPIC_API_KEY`)
- No persistent storage needed
- All computation happens in the user's browser (JSCAD, Three.js) or via Anthropic's API

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Enter` | Send message |
| `Shift+Enter` | New line in message |
| `Cmd+Shift+G` (Mac) / `Ctrl+Shift+G` (Win) | God Mode — load pre-validated demo model |

---

## License

Private project.
