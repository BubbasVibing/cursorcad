# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Natural language to 3D print file tool. Users describe parts, Claude generates JSCAD code, browser renders geometry, exports to STL/3MF.

## Stack

- Next.js 16 App Router + TypeScript + Tailwind CSS 4
- React 19 + React Three Fiber + Drei (3D viewport, always ssr: false)
- @jscad/modeling + @jscad/stl-serializer + @jscad/3mf-serializer (geometry engine, browser only)
- Anthropic SDK (server-side API routes only)

## Commands

- `npm run dev` — start dev server (localhost:3000)
- `npm run build` — production build
- `npm run lint` — run ESLint
- `npm run start` — serve production build

No test runner is configured yet.

## Critical Rules

- **JSCAD is browser-only** — never import @jscad/* in server components or API routes
- **All Claude API calls** go through `app/api/generate/route.ts` only — API key never touches the client
- **Viewport component** must use dynamic import with `ssr: false`
- **JSCAD eval** uses `new Function()` wrapper — never raw `eval()`
- **No JSCAD imports** inside generated geometry functions — primitives are passed in as arguments

## JSCAD Allowed Primitives

cuboid, sphere, cylinder, torus, union, subtract, intersect, translate, rotate, scale, mirror — nothing else.

## Architecture

```
app/            — Next.js App Router pages and API routes
components/     — ChatPanel, Viewport, InputBar
lib/            — jscad-runner, claude client, stl-export
prompts/        — system prompt for Claude
```

**Client-server split**: Claude generates JSCAD code server-side via API route, client executes it in a `new Function()` sandbox with JSCAD primitives passed as arguments, React Three Fiber renders the resulting geometry, and serializers handle STL/3MF export.

## Path Alias

`@/*` maps to the project root (configured in tsconfig.json).
