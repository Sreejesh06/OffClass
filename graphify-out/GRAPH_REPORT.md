# Graph Report - Cryptid  (2026-09-13)

## Corpus Check
- 84 files · ~41,912 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 68 file(s) not represented in the graph (top: .ttf 14, .eot 12, .woff 12)

## Summary
- 514 nodes · 798 edges · 27 communities (19 shown, 6 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 21 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1a84a0b8`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- compilerOptions
- server/package.json
- shared/package.json
- compilerOptions
- compilerOptions
- client/package.json
- package.json
- syncWorker.ts
- server/src/index.ts
- .oxlintrc.json
- dependencies
- devDependencies
- e2e/package.json
- App.tsx
- client/tsconfig.json
- user.ts
- Cryptid — Project Context
- Installing Webfonts
- cc9e7343dc0eae1a2cf810ba2962241392502074.md
- React + TypeScript + Vite
- rules/graphify.md
- workflows/graphify.md
- README.md
- backup.sh
- init-db.sh

## God Nodes (most connected - your core abstractions)
1. `prisma` - 19 edges
2. `compilerOptions` - 18 edges
3. `useAuth()` - 17 edges
4. `compilerOptions` - 16 edges
5. `react` - 15 edges
6. `compilerOptions` - 15 edges
7. `@phosphor-icons/react` - 13 edges
8. `api` - 13 edges
9. `express` - 13 edges
10. `react-router-dom` - 11 edges

## Surprising Connections (you probably didn't know these)
- `processSyncJob()` --calls--> `awardPoints()`  [EXTRACTED]
  server/src/workers/syncWorker.ts → server/src/lib/leaderboard.ts
- `User` --references--> `House`  [EXTRACTED]
  client/src/contexts/AuthContext.tsx → client/src/components/ThemeProvider.tsx
- `LeaderboardEntry` --references--> `House`  [EXTRACTED]
  client/src/pages/Leaderboard.tsx → client/src/components/ThemeProvider.tsx
- `AdminDashboard()` --calls--> `useAuth()`  [EXTRACTED]
  client/src/pages/AdminDashboard.tsx → client/src/contexts/AuthContext.tsx
- `Login()` --calls--> `useAuth()`  [EXTRACTED]
  client/src/pages/Login.tsx → client/src/contexts/AuthContext.tsx

## Import Cycles
- None detected.

## Communities (27 total, 6 thin omitted)

### Community 0 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+11 more)

### Community 1 - "server/package.json"
Cohesion: 0.05
Nodes (37): bcrypt, ioredis, otplib, pino, pino-pretty, prisma, qrcode, tsx (+29 more)

### Community 2 - "shared/package.json"
Cohesion: 0.11
Nodes (18): author, dependencies, zod, description, devDependencies, typescript, typescript, zod (+10 more)

### Community 3 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 4 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, declaration, declarationMap, exactOptionalPropertyTypes, isolatedModules, jsx, module, moduleDetection (+8 more)

### Community 5 - "client/package.json"
Cohesion: 0.05
Nodes (40): dependencies, axios, motion, @phosphor-icons/react, react, react-dom, react-router-dom, shared (+32 more)

### Community 6 - "package.json"
Cohesion: 0.13
Nodes (14): author, description, keywords, license, main, name, deepmerge-ts@<8.0.0, packageManager (+6 more)

### Community 7 - "syncWorker.ts"
Cohesion: 0.06
Nodes (40): @aws-sdk/client-s3, @aws-sdk/s3-request-presigner, bullmq, file-type, deleteFile(), fetchFileHeaderBytes(), generatePresignedPut(), s3Client (+32 more)

### Community 8 - "server/src/index.ts"
Cohesion: 0.08
Nodes (45): cookie-parser, cors, express, helmet, jsonwebtoken, pino-http, supertest, vitest (+37 more)

### Community 9 - ".oxlintrc.json"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 10 - "dependencies"
Cohesion: 0.10
Nodes (20): dependencies, @aws-sdk/client-s3, @aws-sdk/s3-request-presigner, axios, bcrypt, bullmq, cookie-parser, cors (+12 more)

### Community 11 - "devDependencies"
Cohesion: 0.12
Nodes (16): devDependencies, dotenv, pino-pretty, prisma, supertest, tsx, @types/bcrypt, @types/cookie-parser (+8 more)

### Community 12 - "e2e/package.json"
Cohesion: 0.06
Nodes (25): dependencies, server, devDependencies, bcryptjs, dotenv, @playwright/test, @prisma/client, @types/bcryptjs (+17 more)

### Community 13 - "App.tsx"
Cohesion: 0.05
Nodes (63): AdminDashboard, App(), Complaints, HallOfFame, Leaderboard, Login, Profile, ProfilePortfolio (+55 more)

### Community 15 - "user.ts"
Cohesion: 0.14
Nodes (12): House, HouseEnum, LoginPayload, LoginPayloadSchema, Role, RoleEnum, SignupPayload, SignupPayloadSchema (+4 more)

### Community 16 - "Cryptid — Project Context"
Cohesion: 0.17
Nodes (11): 1. What this is, 2. Who uses it, and what they actually do here, 3. Features, explained plainly, 4. Security — sensible for a college project, not enterprise paranoia, 5. What this project is *not* trying to be, 6. Rough build order, Admins (a couple of trusted students/faculty), Cryptid — Project Context (+3 more)

### Community 17 - "Installing Webfonts"
Cohesion: 0.25
Nodes (7): 1., 2., 3. (Optional), 4., 5., 6. (Optional), Installing Webfonts

### Community 18 - "cc9e7343dc0eae1a2cf810ba2962241392502074.md"
Cohesion: 0.33
Nodes (5): Error details, Instructions, Page snapshot, Test info, Test source

### Community 19 - "React + TypeScript + Vite"
Cohesion: 0.50
Nodes (3): Expanding the Oxlint configuration, React Compiler, React + TypeScript + Vite

## Knowledge Gaps
- **291 isolated node(s):** `$schema`, `plugins`, `react/rules-of-hooks`, `react/only-export-components`, `name` (+286 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 319 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `server/package.json`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `express` connect `server/src/index.ts` to `server/package.json`, `syncWorker.ts`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `server/package.json`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **What connects `$schema`, `plugins`, `react/rules-of-hooks` to the rest of the system?**
  _291 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `server/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `shared/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._