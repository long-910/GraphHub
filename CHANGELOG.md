# Changelog

All notable changes to GraphHub will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Changed
- Dependency updates: `next` → `^14.2.35`, `next-auth` → `^5.0.0-beta.30`
- Dependency updates: `@typescript-eslint/*` → `^8.x`, `@eslint/eslintrc` → `^3.x`
- Line-ending normalization (CRLF → LF) across source files

---

## [0.2.0] — 2026-02-23

Full rebuild of GraphHub from the T3 scaffold baseline.

### Added

#### Core Features
- Avatar image nodes using vis-network `circularImage` shape
- Mutual-follow detection with purple bidirectional edges (`⇔`)
- Following-only edges in green (`→`)
- Follower-only edges in blue (`←`)
- Edge filter UI: すべて / 相互 ⇔ / フォロー中 → / フォロワー ←
- Node click navigation — clicking a node navigates to that user's graph page
- Export: PNG (canvas snapshot), JSON (summary + edge list), CSV (`from,to,relationship`)
- Avatar proxy Route Handler (`/api/proxy/avatar`) for CORS-safe image loading
- `src/lib/graphUtils.ts` — extracted graph-building logic for testability

#### Auth & API
- Consolidated NextAuth config into single `src/server/auth.ts`
- 3 Route Handlers: `/api/github/user/:username`, `/followers/:username`, `/following/:username`
- Middleware (`src/middleware.ts`) — unauthenticated users redirected to `/login`

#### Visual Design (GitHub Dark Theme)
- Gradient logo text: blue→purple "Graph", green "Hub"
- Glowing filter buttons — each lights up in its relationship colour
- Glowing legend dots with relationship count badges
- Ambient glow blobs on home and login pages
- Dual-ring loading spinner
- Subtle dot-grid body texture (32px, 3% opacity)
- Node drop-shadows via vis-network shadow option

#### Tests (35 passing)
- Vitest + React Testing Library setup (`vitest.config.ts`, `src/__tests__/setup.ts`)
- `graphUtils` — 14 tests: edge type/colour/direction, node deduplication
- API route handlers — 10 tests: 401 guard, token forwarding, error passthrough
- `Navbar` — 6 tests: session states, avatar display, sign-out
- `UsernameForm` — 5 tests: submit, whitespace trim, empty-input guard
- All test fixtures use fictional usernames (`testuser`, `user-a`, `user-b`, `user-c`)

### Changed
- **Architecture**: replaced tRPC + TanStack Query with plain Next.js Route Handlers + SWR
- **Graph library**: replaced `force-graph` / `react-force-graph-2d` with `vis-network 9`
- **HTTP client**: replaced `axios` with native `fetch`
- **Config**: removed `ignoreBuildErrors: true` — typecheck and lint now enforced at build
- Removed all Webpack browser polyfills (crypto, buffer, stream, process, util)

### Removed
- tRPC router (`src/server/api/`)
- `@trpc/server`, `@trpc/client`, `@trpc/react-query`, `@tanstack/react-query`
- `force-graph`, `react-force-graph-2d`
- `axios`
- Webpack polyfill config in `next.config.js`

---

## [0.1.0] — 2025-05-05

### Added
- Project scaffold generated with `npm create t3-app@latest` (v7.39.3)
  - Next.js 14 (App Router), TypeScript 5, Tailwind CSS
  - NextAuth.js v5 (GitHub OAuth provider)
  - Zod + `@t3-oss/env-nextjs` for environment variable validation
  - ESLint, Prettier, PostCSS configuration
- `.env.example` with required environment variable placeholders
- Cursor AI rules (`.cursor/rules/`) — tech-stack constraints and task-tracking conventions
- MIT License

---

[Unreleased]: https://github.com/long-910/GraphHub/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/long-910/GraphHub/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/long-910/GraphHub/releases/tag/v0.1.0
