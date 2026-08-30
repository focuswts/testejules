# Architecture Overview

## Monorepo Structure (pnpm)

- `apps/client`: Frontend application built with Vite, TypeScript, Babylon.js, and Colyseus client.
- `apps/server`: Authoritative game server using Node.js, Express, and Colyseus.
- `packages/shared`: Shared types, schemas (GameState, Player), and game constants.

## Tech Stack

- Client: Babylon.js (3D rendering), Vite (Bundler), TypeScript.
- Server: Colyseus (Multiplayer WS framework), Node.js.
- Workspace: pnpm.

## Design Patterns

- **Entity Component System (inspired)**: The client logic will heavily rely on separating Data (State) from Rendering and Behaviours. Currently using a loose object-based encapsulation for entities (`PlayerEntity`, `LocalPlayerController`).
- **Server Authority**: The server holds the canonical `GameState`. The client sends interactions/inputs, and the server validates them and broadcasts state updates.
