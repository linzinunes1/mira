# Mira

Monorepo for the Mira platform — AI-powered makeup mirror and companion API.

## Structure

```
mira/
├── apps/
│   ├── mira-app/   # Expo (React Native) mobile app
│   └── mira-api/   # Next.js App Router backend
└── package.json    # Workspace root
```

### `apps/mira-app`

React Native mobile app built with [Expo](https://expo.dev). Handles the camera-based AR makeup overlay, user sessions, and in-app purchases.

### `apps/mira-api`

[Next.js](https://nextjs.org) App Router backend. Provides API routes, server actions, database access (Drizzle ORM), and Clerk auth integration.

## Getting started

```bash
# Install all workspace dependencies
yarn install

# Start the mobile app (Expo dev server)
yarn dev:app

# Start the API (Next.js dev server on :3000)
yarn dev:api
```

## Prerequisites

- Node ≥ 20
- Yarn (classic or Berry with `nodeLinker: node-modules`)
- For mobile: Expo CLI (`npm i -g expo-cli`) + iOS Simulator or Android Emulator
