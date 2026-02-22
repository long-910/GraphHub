# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**GraphHub** is a GitHub follow-relationship visualizer. Users authenticate via GitHub OAuth, enter any GitHub username, and see an interactive force-directed graph of that user's followers and following relationships.

## Commands

```bash
npm run dev          # Start dev server with Turbo mode (http://localhost:3000)
npm run build        # Production build
npm run check        # Run lint + typecheck together
npm run lint         # ESLint only
npm run typecheck    # TypeScript check only
npm run format:write # Format with Prettier
```

No test suite is currently configured.

## Environment Variables

Copy `.env.example` to `.env` and fill in:

```
AUTH_SECRET=          # Generate with: npx auth secret
GITHUB_CLIENT_ID=     # GitHub OAuth App client ID
GITHUB_CLIENT_SECRET= # GitHub OAuth App client secret
NEXTAUTH_URL=         # e.g. http://localhost:3000
```

The env schema is validated at startup via `src/env.js` using `@t3-oss/env-nextjs`.

## Architecture

This is a **T3 Stack** app (Next.js 14 + tRPC + NextAuth + Tailwind).

### Request Flow

1. User logs in via GitHub OAuth → NextAuth stores the GitHub access token in a JWT session
2. The access token is forwarded through `ctx.session.user.accessToken` in every tRPC call
3. The tRPC `githubRouter` calls GitHub REST API (`/users/:username`, `/followers`, `/following`) using that token (5000 req/h rate limit)
4. `NetworkGraph` component renders a force-directed graph with `force-graph` / `ForceGraph2D`

### Key Files

| Path | Role |
|------|------|
| `src/server/auth/config.ts` | NextAuth config — GitHub provider, JWT callbacks that attach `accessToken` to session |
| `src/server/api/trpc.ts` | tRPC context factory — reads session, enforces auth via `protectedProcedure` |
| `src/server/api/routers/github.ts` | `getUser`, `getFollowers`, `getFollowing` procedures |
| `src/server/api/root.ts` | Combines routers into `AppRouter` |
| `src/trpc/react.ts` | Client-side tRPC hook (`api`) |
| `src/app/_components/NetworkGraph.tsx` | Force-graph canvas component (shared) |
| `src/app/graph/[username]/page.tsx` | Graph page — redirects to `/login` if unauthenticated |
| `src/app/page.tsx` | Home page with `UsernameForm` — navigates to `/graph/:username` |

### Auth Pattern

All tRPC procedures use `protectedProcedure`. The middleware reads `ctx.token` (the GitHub OAuth access token), and throws `UNAUTHORIZED` if absent. The token is extracted from the JWT session in `createTRPCContext`.

### Graph Rendering

`NetworkGraph` uses `force-graph` (imperative canvas API via `ForceGraph2D()`). It is initialized inside `useEffect` after all three tRPC queries resolve. On cleanup or re-render, `graph.destroy()` is called. Node colors: blue = target user, green = followers, red = following.

### Important Config Notes

- `next.config.js` has `ignoreBuildErrors: true` and `ignoreDuringBuilds: true` for TypeScript and ESLint — builds won't fail on type errors.
- Webpack polyfills are added for `crypto`, `buffer`, `stream`, `process`, `util` (required by some dependencies in the browser).
- GitHub avatar images are whitelisted in `next.config.js` under `images.remotePatterns`.

## Constraints (from `.cursor/rules/`)

- Do not change library versions without explicit approval.
- Do not modify UI/UX design (layout, colors, fonts, spacing) without approval.
- Do not add unrequested features; propose first and wait for approval.
- Keep `todo.md` updated after each feature implementation (the project uses a task-tracking file).
