# Graph Report - Cryptid  (2026-09-25)

## Corpus Check
- 140 files · ~416,245 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 75 file(s) not represented in the graph (top: .ttf 14, .eot 12, .woff 12)

## Summary
- 839 nodes · 1388 edges · 56 communities (39 shown, 15 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 25 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `26d85993`
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
- AuthContext.tsx
- client/tsconfig.json
- OpportunityBoard.tsx
- Cryptid — Project Context
- Installing Webfonts
- cc9e7343dc0eae1a2cf810ba2962241392502074.md
- React + TypeScript + Vite
- rules/graphify.md
- workflows/graphify.md
- README.md
- backup.sh
- init-db.sh
- Complaints.tsx
- ProfilePortfolio.tsx
- components.json
- dependencies
- integrations.ts
- ModernLanding.tsx
- SwapyFeatures.tsx
- react
- prisma/seed.ts
- sticky-note-polaroid-frame.tsx
- user.ts
- api.ts
- ResetPassword.tsx
- test-heatmap.cjs
- scripts
- ActivityHeatmap.tsx
- mailer.ts
- query.cjs
- seed-opportunities.ts
- test-bookmark.ts
- update-admin-avatar.ts
- server/seed.ts
- test-heatmap.js
- tsup
- prisma
- Redeem.tsx
- alert.tsx
- useAuth
- Leaderboard.tsx

## God Nodes (most connected - your core abstractions)
1. `react` - 48 edges
2. `api` - 26 edges
3. `useAuth()` - 23 edges
4. `compilerOptions` - 21 edges
5. `prisma` - 21 edges
6. `@tanstack/react-query` - 20 edges
7. `@phosphor-icons/react` - 19 edges
8. `react-router-dom` - 19 edges
9. `compilerOptions` - 16 edges
10. `compilerOptions` - 15 edges

## Surprising Connections (you probably didn't know these)
- `InterestedStudent` --references--> `House`  [EXTRACTED]
  client/src/components/InterestedStudentsModal.tsx → shared/src/schemas/user.ts
- `BadgeWallet()` --calls--> `useAuth()`  [EXTRACTED]
  client/src/components/BadgeWallet.tsx → client/src/contexts/AuthContext.tsx
- `Props` --references--> `OpportunityType`  [EXTRACTED]
  client/src/components/OpportunityCard.tsx → shared/src/schemas/opportunity.ts
- `Props` --references--> `House`  [EXTRACTED]
  client/src/components/OpportunityCard.tsx → shared/src/schemas/user.ts
- `AdminDashboard()` --calls--> `useAuth()`  [EXTRACTED]
  client/src/pages/AdminDashboard.tsx → client/src/contexts/AuthContext.tsx

## Import Cycles
- None detected.

## Communities (56 total, 15 thin omitted)

### Community 0 - "compilerOptions"
Cohesion: 0.09
Nodes (22): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, baseUrl, erasableSyntaxOnly, ignoreDeprecations, jsx, lib (+14 more)

### Community 1 - "server/package.json"
Cohesion: 0.07
Nodes (29): ioredis, pino, pino-pretty, prisma, tsx, @types/bcrypt, @types/cookie-parser, @types/cors (+21 more)

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
Cohesion: 0.04
Nodes (45): devDependencies, autoprefixer, @axe-core/react, oxlint, postcss, tailwindcss, @tailwindcss/vite, @types/node (+37 more)

### Community 6 - "package.json"
Cohesion: 0.10
Nodes (18): puppeteer, author, dependencies, puppeteer, description, keywords, license, main (+10 more)

### Community 7 - "syncWorker.ts"
Cohesion: 0.07
Nodes (31): bullmq, CodeforcesRaw, fetchCodeforces(), parseCodeforces(), fetchGfg(), GfgRaw, parseGfg(), fetchGithub() (+23 more)

### Community 8 - "server/src/index.ts"
Cohesion: 0.06
Nodes (60): cookie-parser, cors, express, express-rate-limit, helmet, jsonwebtoken, otplib, pino-http (+52 more)

### Community 9 - ".oxlintrc.json"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 10 - "dependencies"
Cohesion: 0.09
Nodes (22): dependencies, @aws-sdk/client-s3, @aws-sdk/s3-request-presigner, axios, bcrypt, bullmq, cookie-parser, cors (+14 more)

### Community 11 - "devDependencies"
Cohesion: 0.11
Nodes (18): devDependencies, dotenv, pino-pretty, prisma, supertest, tsup, tsx, @types/bcrypt (+10 more)

### Community 12 - "e2e/package.json"
Cohesion: 0.06
Nodes (25): dependencies, server, devDependencies, bcryptjs, dotenv, @playwright/test, @prisma/client, @types/bcryptjs (+17 more)

### Community 13 - "AuthContext.tsx"
Cohesion: 0.21
Nodes (12): Layout(), House, ThemeContext, ThemeContextType, ThemeProvider(), useTheme(), AuthContext, AuthContextType (+4 more)

### Community 15 - "OpportunityBoard.tsx"
Cohesion: 0.15
Nodes (17): OpportunityBoard, HOUSES, OPPORTUNITY_TYPES, HOUSE_COLORS, InterestedStudent, InterestedStudentsModal(), Props, HOUSE_COLORS (+9 more)

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

### Community 27 - "Complaints.tsx"
Cohesion: 0.13
Nodes (15): Input(), Label(), SelectContent(), SelectItem(), SelectTrigger(), SelectValue(), Tabs(), TabsContent() (+7 more)

### Community 28 - "ProfilePortfolio.tsx"
Cohesion: 0.06
Nodes (36): ProfilePortfolio, AccountLinker(), fetchSyncStatus(), getPlatformIcon(), PlatformLink, SyncState, AchievementModal(), AchievementModalProps (+28 more)

### Community 29 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 30 - "dependencies"
Cohesion: 0.10
Nodes (21): dependencies, axios, @base-ui/react, class-variance-authority, cn, @fontsource-variable/geist, framer-motion, gsap (+13 more)

### Community 31 - "integrations.ts"
Cohesion: 0.16
Nodes (14): @aws-sdk/client-s3, @aws-sdk/s3-request-presigner, file-type, deleteFile(), fetchFileHeaderBytes(), generatePresignedGet(), generatePresignedPut(), s3Client (+6 more)

### Community 32 - "ModernLanding.tsx"
Cohesion: 0.08
Nodes (26): Home, ModernLanding(), platformLogos, SwapyFeatures(), clamp(), FoldText(), FoldTextProps, HINGE_CONFIG (+18 more)

### Community 33 - "SwapyFeatures.tsx"
Cohesion: 0.11
Nodes (13): initialItems, Item, AnimationType, cn(), Config, DragHandle(), dragOpacityClassMap, SwapMode (+5 more)

### Community 34 - "react"
Cohesion: 0.10
Nodes (15): App(), Complaints, ForgotPassword, HallOfFame, queryClient, Redeem, ResetPassword, Signup (+7 more)

### Community 35 - "prisma/seed.ts"
Cohesion: 0.28
Nodes (4): bcrypt, rubricData, prisma, prisma

### Community 36 - "sticky-note-polaroid-frame.tsx"
Cohesion: 0.29
Nodes (3): StickyNotePolaroidFrame, StickyNotePolaroidFrameProps, toCssSize()

### Community 37 - "user.ts"
Cohesion: 0.11
Nodes (17): CreateOpportunityPayload, CreateOpportunitySchema, ToggleBookmarkPayload, ToggleBookmarkSchema, UpdateOpportunityPayload, UpdateOpportunitySchema, HouseEnum, LoginPayload (+9 more)

### Community 38 - "api.ts"
Cohesion: 0.16
Nodes (12): AdminDashboard, AdminDisciplineTab(), DisciplineRecord, AdminRubricTab(), RubricItem, UploadStatus, api, AdminDashboard() (+4 more)

### Community 39 - "ResetPassword.tsx"
Cohesion: 0.29
Nodes (8): Button(), buttonVariants, Card(), CardContent(), CardDescription(), CardFooter(), CardHeader(), CardTitle()

### Community 40 - "test-heatmap.cjs"
Cohesion: 0.25
Nodes (7): map, monthLabels, months, result, startDate, today, weeks

### Community 41 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, start, test

### Community 43 - "mailer.ts"
Cohesion: 0.67
Nodes (3): nodemailer, getTransporter(), sendEmail()

### Community 52 - "Redeem.tsx"
Cohesion: 0.18
Nodes (10): Dialog(), DialogContent(), DialogDescription(), DialogFooter(), DialogHeader(), DialogTitle(), HOUSE_ACCENTS, HOUSE_GRADIENTS (+2 more)

### Community 53 - "alert.tsx"
Cohesion: 0.24
Nodes (7): Alert(), AlertDescription(), AlertTitle(), alertVariants, Badge(), badgeVariants, class-variance-authority

### Community 54 - "useAuth"
Cohesion: 0.28
Nodes (7): Login, ComposeOpportunityCard(), ProtectedRoute(), useAuth(), Login(), ProfilePortfolio(), Redeem()

### Community 55 - "Leaderboard.tsx"
Cohesion: 0.38
Nodes (6): Leaderboard, getAvatar(), houseColors, houseGradients, Leaderboard(), PodiumCard()

## Knowledge Gaps
- **413 isolated node(s):** `$schema`, `plugins`, `react/rules-of-hooks`, `react/only-export-components`, `$schema` (+408 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 482 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `ModernLanding.tsx`, `SwapyFeatures.tsx`, `sticky-note-polaroid-frame.tsx`, `client/package.json`, `api.ts`, `ResetPassword.tsx`, `ActivityHeatmap.tsx`, `AuthContext.tsx`, `OpportunityBoard.tsx`, `Redeem.tsx`, `alert.tsx`, `useAuth`, `Leaderboard.tsx`, `Complaints.tsx`, `ProfilePortfolio.tsx`?**
  _High betweenness centrality (0.163) - this node is a cross-community bridge._
- **Why does `express` connect `server/src/index.ts` to `server/package.json`, `integrations.ts`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Why does `lucide-react` connect `Redeem.tsx` to `ModernLanding.tsx`, `SwapyFeatures.tsx`, `react`, `client/package.json`, `OpportunityBoard.tsx`, `Complaints.tsx`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **What connects `$schema`, `plugins`, `react/rules-of-hooks` to the rest of the system?**
  _413 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._
- **Should `server/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.06666666666666667 - nodes in this community are weakly interconnected._
- **Should `shared/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._