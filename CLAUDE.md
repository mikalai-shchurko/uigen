# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UIGen is an AI-powered React component generator. Users describe UI in a chat interface, and Claude modifies a virtual file system in real time. A sandboxed iframe renders the result using Babel JSX transformation and ESM imports.

## Setup & Commands

```bash
npm run setup        # First-time setup: install deps, generate Prisma client, run migrations
npm run dev          # Dev server with Turbopack at localhost:3000
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Vitest unit tests
npm run db:reset     # Reset SQLite database
```

Set `ANTHROPIC_API_KEY` in `.env` for real AI generation. Without it, the app falls back to a mock provider automatically.

## Architecture

### Data Flow

1. User sends a prompt in `ChatInterface`
2. `ChatProvider` (using Vercel AI SDK's `useChat`) posts to `/api/chat` with messages and serialized virtual files
3. The API route streams Claude's response, which calls tools (`str_replace_editor`, `file_manager`) to mutate files
4. Updated files are serialized back to the client, saved to Prisma for authenticated users
5. `FileSystemProvider` updates state, triggering `PreviewFrame` to re-render

### Key Modules

- **`/src/app/api/chat/route.ts`** — streaming API endpoint; configures Claude with system prompt, tools, and prompt caching
- **`/src/lib/tools.ts`** — tool definitions (`str_replace_editor`, `file_manager`) and execution logic against `VirtualFileSystem`
- **`/src/lib/file-system.ts`** — in-memory virtual file tree; serializes to/from JSON for Prisma storage
- **`/src/lib/preview.ts`** — Babel JSX transform + ESM import map; produces blob URLs for iframe consumption
- **`/src/lib/auth.ts`** — JWT session management (httpOnly cookies, 7-day expiry, bcrypt)
- **`/src/lib/provider.ts`** — swaps between real Anthropic and mock AI provider

### Context Providers

Two React contexts coordinate the UI:
- `ChatProvider` — chat message state, streaming, tool results
- `FileSystemProvider` — virtual file tree state, selected file, dirty tracking

### Database

Prisma + SQLite (`prisma/dev.db`). Schema is at `prisma/schema.prisma` — reference it for the source of truth on data structure. Two models:
- `User` — email + hashed password
- `Project` — belongs to optional `User`; stores `messages` and `data` (virtual FS) as JSON blobs

### Auth

Anonymous users get session-scoped projects (stored in `sessionStorage`). Registered users get persistent projects. Middleware at `src/middleware.ts` handles JWT validation on protected routes.

### Preview Sandbox

The iframe preview (`PreviewFrame`) uses Babel Standalone for JSX transformation and an ESM import map that resolves `react`/`react-dom` to `esm.sh` CDN URLs and local component imports to blob URLs. The sandbox policy is `allow-scripts allow-same-origin`.

## AI Configuration

- Model: Claude Haiku 4.5 (`claude-haiku-4-5-20251001`)
- Max tool call steps: 40 (4 for mock provider)
- Prompt caching enabled via `ephemeral` cache control on system prompt
- Max function duration: 120s (Vercel)

## Path Alias

`@/*` maps to `./src/*` throughout the codebase.
