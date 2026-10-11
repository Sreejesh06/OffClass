# Graph Report - Cryptid  (2026-10-11)

## Corpus Check
- 268 files · ~705,772 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 91 file(s) not represented in the graph (top: .ttf 17, .eot 15, .woff 15)

## Summary
- 1366 nodes · 2357 edges · 96 communities (66 shown, 21 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 27 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `13c2b72d`
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
- TypedDeferredTopicFilter
- client/tsconfig.json
- useAuth
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
- seedRubric.ts
- sticky-note-polaroid-frame.tsx
- user.ts
- api.ts
- typechain-types/index.ts
- test-heatmap.cjs
- scripts
- ActivityHeatmap.tsx
- routes/auth.ts
- query.cjs
- seed-opportunities.ts
- test-bookmark.ts
- update-admin-avatar.ts
- server/seed.ts
- test-heatmap.js
- tsup
- prisma
- TypedContractEvent
- factories/@openzeppelin/contracts/token/ERC1155/index.ts
- Strings
- AuthContext.tsx
- blockchain/package.json
- IERC1155MetadataURI.ts
- common.ts
- IERC1155.ts
- IERC721Errors
- db.ts
- perks.ts
- TypedContractMethod
- 3. Deployment Steps
- TypedListener
- users.ts
- IERC1155Errors
- CryptidRegistry.ts
- devDependencies
- CryptidRegistry__factory.ts
- AccountLinker.tsx
- contributors.ts
- Ownable__factory.ts
- swapy-draggable-card.tsx
- Cryptid — Final Codebase Audit (V4)
- compilerOptions
- mailer.ts
- FoldText.tsx
- LogoLoop.tsx
- ScrollVelocity.tsx
- HardhatEthersHelpers
- scripts
- Cryptid Smart Contracts
- Cryptid — Pending Tasks & Roadmap
- Fonts Directory
- vite.config.ts
- bcrypt
- deploy-check.sh

## God Nodes (most connected - your core abstractions)
1. `react` - 55 edges
2. `TypedDeferredTopicFilter` - 53 edges
3. `TypedListener` - 53 edges
4. `TypedContractMethod` - 31 edges
5. `useAuth()` - 31 edges
6. `api` - 31 edges
7. `TypedEventLog` - 27 edges
8. `@tanstack/react-query` - 27 edges
9. `TypedContractEvent` - 25 edges
10. `prisma` - 25 edges

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

## Communities (96 total, 21 thin omitted)

### Community 0 - "compilerOptions"
Cohesion: 0.09
Nodes (22): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, baseUrl, erasableSyntaxOnly, ignoreDeprecations, jsx, lib (+14 more)

### Community 1 - "server/package.json"
Cohesion: 0.06
Nodes (35): cookie-parser, cors, express-rate-limit, helmet, ioredis, pino, pino-http, pino-pretty (+27 more)

### Community 2 - "shared/package.json"
Cohesion: 0.11
Nodes (18): author, dependencies, zod, description, devDependencies, typescript, typescript, zod (+10 more)

### Community 3 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 4 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, declaration, declarationMap, exactOptionalPropertyTypes, isolatedModules, jsx, module, moduleDetection (+9 more)

### Community 5 - "client/package.json"
Cohesion: 0.08
Nodes (25): axios, ethers, @playwright/test, shared, @types/node, typescript, name, private (+17 more)

### Community 6 - "package.json"
Cohesion: 0.08
Nodes (22): puppeteer, author, dependencies, dotenv, node-fetch, puppeteer, description, dotenv (+14 more)

### Community 7 - "syncWorker.ts"
Cohesion: 0.07
Nodes (30): bullmq, CodeforcesRaw, fetchCodeforces(), parseCodeforces(), fetchGfg(), GfgRaw, parseGfg(), fetchGithub() (+22 more)

### Community 8 - "server/src/index.ts"
Cohesion: 0.13
Nodes (18): authLimiter, Express, Request, requireAuth(), requireRole(), router, router, AwardBadgeSchema (+10 more)

### Community 9 - ".oxlintrc.json"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 10 - "dependencies"
Cohesion: 0.09
Nodes (23): dependencies, @aws-sdk/client-s3, @aws-sdk/s3-request-presigner, axios, bcrypt, bullmq, cookie-parser, cors (+15 more)

### Community 11 - "devDependencies"
Cohesion: 0.11
Nodes (18): devDependencies, dotenv, pino-pretty, prisma, supertest, tsup, tsx, @types/bcrypt (+10 more)

### Community 12 - "e2e/package.json"
Cohesion: 0.07
Nodes (25): dependencies, server, devDependencies, bcryptjs, dotenv, @playwright/test, @prisma/client, @types/bcryptjs (+17 more)

### Community 13 - "TypedDeferredTopicFilter"
Cohesion: 0.14
Nodes (4): TypedDeferredTopicFilter, TypedEventLog, ERC165, IERC165

### Community 15 - "useAuth"
Cohesion: 0.13
Nodes (25): OpportunityBoard, OpportunityCompose, ComposeOpportunityCard(), HOUSES, OPPORTUNITY_TYPES, HOUSE_COLORS, InterestedStudent, InterestedStudentsModal() (+17 more)

### Community 16 - "Cryptid — Project Context"
Cohesion: 0.15
Nodes (12): 1. What this is, 2. Who uses it, and what they actually do here, 3. Features, explained plainly, 4. Security — sensible for a college project, not enterprise paranoia, 5. What this project is *not* trying to be, 6. Key Architectural Decisions (ADR), 7. Rough build order, Admins (a couple of trusted students/faculty) (+4 more)

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
Cohesion: 0.07
Nodes (44): ManagePerkModal(), ManagePerkModalProps, Alert(), AlertDescription(), AlertTitle(), alertVariants, Badge(), badgeVariants (+36 more)

### Community 28 - "ProfilePortfolio.tsx"
Cohesion: 0.08
Nodes (26): ProfilePortfolio, AVATAR_SEEDS, AvatarModal(), AvatarModalProps, CertificateUpload(), UploadStatus, CertificateUploadModal(), CertificateUploadModalProps (+18 more)

### Community 29 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 30 - "dependencies"
Cohesion: 0.09
Nodes (22): dependencies, axios, @base-ui/react, class-variance-authority, cn, ethers, @fontsource-variable/geist, framer-motion (+14 more)

### Community 31 - "integrations.ts"
Cohesion: 0.11
Nodes (20): @aws-sdk/client-s3, @aws-sdk/s3-request-presigner, file-type, anchorCertificateHash(), blockchainEnabled(), computeAchievementHash(), cryptidRegistry, mintAchievementSBT() (+12 more)

### Community 32 - "ModernLanding.tsx"
Cohesion: 0.12
Nodes (13): Home, ContributorPayload, ContributorsResponse, ContributorsSection(), ContributorWeek, FALLBACK_AGGREGATE, FALLBACK_CONTRIBUTORS, ModernLanding() (+5 more)

### Community 34 - "react"
Cohesion: 0.09
Nodes (21): App(), Complaints, ForgotPassword, HallOfFame, Login, queryClient, Redeem, ResetPassword (+13 more)

### Community 36 - "sticky-note-polaroid-frame.tsx"
Cohesion: 0.29
Nodes (3): StickyNotePolaroidFrame, StickyNotePolaroidFrameProps, toCssSize()

### Community 37 - "user.ts"
Cohesion: 0.11
Nodes (17): CreateOpportunityPayload, CreateOpportunitySchema, ToggleBookmarkPayload, ToggleBookmarkSchema, UpdateOpportunityPayload, UpdateOpportunitySchema, HouseEnum, LoginPayload (+9 more)

### Community 38 - "api.ts"
Cohesion: 0.13
Nodes (12): AdminDashboard, AchievementCategory, AchievementModal(), AchievementModalProps, DisciplineRecord, RubricItem, BadgeWallet(), UserBadge (+4 more)

### Community 39 - "typechain-types/index.ts"
Cohesion: 0.13
Nodes (7): _abi, ERC165__factory, _abi, IERC165__factory, factories, ERC165Interface, IERC165Interface

### Community 40 - "test-heatmap.cjs"
Cohesion: 0.25
Nodes (7): map, monthLabels, months, result, startDate, today, weeks

### Community 41 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, start, test

### Community 43 - "routes/auth.ts"
Cohesion: 0.33
Nodes (8): express, otplib, qrcode, clearAuthCookies(), generateAccessToken(), generateRefreshToken(), hashToken(), setAuthCookies()

### Community 52 - "TypedContractEvent"
Cohesion: 0.08
Nodes (13): TypedContractEvent, ApprovalForAllEvent, ERC1155, Event, Filter, InputTuple, Log, LogDescription (+5 more)

### Community 53 - "factories/@openzeppelin/contracts/token/ERC1155/index.ts"
Cohesion: 0.06
Nodes (12): _abi, ERC1155__factory, _abi, IERC1155MetadataURI__factory, _abi, IERC1155__factory, IERC1155Receiver__factory, extensions (+4 more)

### Community 55 - "AuthContext.tsx"
Cohesion: 0.14
Nodes (18): Leaderboard, Layout(), House, ThemeContext, ThemeContextType, ThemeProvider(), useTheme(), AuthContext (+10 more)

### Community 56 - "blockchain/package.json"
Cohesion: 0.07
Nodes (24): config, author, description, devDependencies, chai, dotenv, hardhat, @nomicfoundation/hardhat-toolbox (+16 more)

### Community 57 - "IERC1155MetadataURI.ts"
Cohesion: 0.09
Nodes (12): ApprovalForAllEvent, Event, Filter, IERC1155MetadataURI, InputTuple, Log, LogDescription, OutputObject (+4 more)

### Community 58 - "common.ts"
Cohesion: 0.09
Nodes (22): BaseOverrides, ContractMethodArgs, DefaultReturnType, GetARGsTypeFromFactory, GetContractTypeFromFactory, MinEthersFactory, Overrides, PayableOverrides (+14 more)

### Community 59 - "IERC1155.ts"
Cohesion: 0.17
Nodes (11): ApprovalForAllEvent, Event, Filter, InputTuple, Log, LogDescription, OutputObject, OutputTuple (+3 more)

### Community 60 - "IERC721Errors"
Cohesion: 0.16
Nodes (4): _abi, IERC721Errors__factory, IERC721Errors, IERC721ErrorsInterface

### Community 61 - "db.ts"
Cohesion: 0.19
Nodes (8): jsonwebtoken, supertest, vitest, app, logAction(), prisma, CATEGORY_WEIGHTS, NOTE: The canonical /export/students route is defined above (line ~10).

### Community 62 - "perks.ts"
Cohesion: 0.22
Nodes (14): main(), prisma, awardPoints(), getHouseKey(), getOverallKey(), getTopUsers(), getUserRank(), transferHouseLeaderboard() (+6 more)

### Community 63 - "TypedContractMethod"
Cohesion: 0.08
Nodes (4): TypedContractMethod, _abi, IERC1155, IERC1155Receiver

### Community 64 - "3. Deployment Steps"
Cohesion: 0.11
Nodes (17): 1. System Architecture, 2. Server Node Prerequisites, 3. Deployment Steps, 4. Operational Maintenance, 5. Automated Midnight Database Backups, 6. Troubleshooting Common Issues, Applying Future Updates, Cryptid — Production Deployment Runbook (+9 more)

### Community 65 - "TypedListener"
Cohesion: 0.12
Nodes (3): TypedListener, Ownable, SafeCast

### Community 66 - "users.ts"
Cohesion: 0.15
Nodes (12): notifyAdminsAndTeachers(), generateChallenge(), verifyChallenge(), router, SubmitSchema, UpdateStatusSchema, AchievementSubmitSchema, AvatarSchema (+4 more)

### Community 67 - "IERC1155Errors"
Cohesion: 0.08
Nodes (8): _abi, IERC1155Errors__factory, _abi, IERC20Errors__factory, IERC1155Errors, IERC1155ErrorsInterface, IERC20Errors, IERC20ErrorsInterface

### Community 68 - "CryptidRegistry.ts"
Cohesion: 0.09
Nodes (14): ApprovalForAllEvent, CryptidRegistry, Event, Filter, HashAnchoredEvent, InputTuple, Log, LogDescription (+6 more)

### Community 69 - "devDependencies"
Cohesion: 0.14
Nodes (14): devDependencies, autoprefixer, @axe-core/react, oxlint, @playwright/test, postcss, tailwindcss, @tailwindcss/vite (+6 more)

### Community 70 - "CryptidRegistry__factory.ts"
Cohesion: 0.05
Nodes (26): NonPayableOverrides, CryptidRegistryInterface, _abi, CryptidRegistry__factory, CryptidRegistryConstructorParams, isSuperArgs(), contracts, openzeppelin (+18 more)

### Community 71 - "AccountLinker.tsx"
Cohesion: 0.31
Nodes (7): AccountLinker(), fetchSyncStatus(), getPlatformIcon(), PlatformLink, SyncState, IntegrationsModal(), IntegrationsModalProps

### Community 72 - "contributors.ts"
Cohesion: 0.25
Nodes (6): ContributorPayload, ContributorsResponse, ContributorWeek, FALLBACK_AGGREGATE, FALLBACK_CONTRIBUTORS, router

### Community 73 - "Ownable__factory.ts"
Cohesion: 0.22
Nodes (3): _abi, Ownable__factory, OwnableInterface

### Community 74 - "swapy-draggable-card.tsx"
Cohesion: 0.21
Nodes (11): AnimationType, cn(), Config, DragHandle(), dragOpacityClassMap, SwapMode, SwapyItem(), SwapyLayout() (+3 more)

### Community 75 - "Cryptid — Final Codebase Audit (V4)"
Cohesion: 0.22
Nodes (8): 1. Backend Data & Stability, 2. Authentication & Auth UI, 3. Blockchain Anchoring, 🏗 Architecture Summary, 🛠 Bugs & Gaps Remediated in Final Sprint, Cryptid — Final Codebase Audit (V4), 🚫 Things Explicitly Omitted to Avoid Over-Engineering, 🛡 Things We Audited That Are Perfectly Fine

### Community 76 - "compilerOptions"
Cohesion: 0.22
Nodes (8): compilerOptions, esModuleInterop, module, outDir, strict, target, files, include

### Community 77 - "mailer.ts"
Cohesion: 0.67
Nodes (3): nodemailer, getTransporter(), sendEmail()

### Community 79 - "FoldText.tsx"
Cohesion: 0.32
Nodes (7): clamp(), FoldText(), FoldTextProps, HINGE_CONFIG, HingeType, renderWhitespace(), gsap

### Community 80 - "LogoLoop.tsx"
Cohesion: 0.39
Nodes (7): ANIMATION_CONFIG, LogoLoop, LogoLoopProps, toCssLength(), useAnimationLoop(), useImageLoader(), useResizeObserver()

### Community 81 - "ScrollVelocity.tsx"
Cohesion: 0.29
Nodes (5): ScrollVelocity(), VelocityText(), ScrollVelocityProps, useElementWidth(), VelocityTextProps

### Community 85 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, build, dev, lint, preview, test:a11y

### Community 86 - "Cryptid Smart Contracts"
Cohesion: 0.33
Nodes (5): Backend (`server/.env`), Cryptid Smart Contracts, Deployment Instructions, Environment Variables, Frontend (`client/.env`)

### Community 87 - "Cryptid — Pending Tasks & Roadmap"
Cohesion: 0.33
Nodes (5): 🚀 1. Production Deployment (Immediate Next Steps), 🎨 2. UI/UX Polish, 🔮 3. Phase 2 Features (The "Extras"), 🧹 4. Tech Debt & Maintenance, Cryptid — Pending Tasks & Roadmap

### Community 88 - "Fonts Directory"
Cohesion: 0.50
Nodes (3): Fonts Directory, Note, Required Font Files

### Community 89 - "vite.config.ts"
Cohesion: 0.50
Nodes (3): @tailwindcss/vite, vite, @vitejs/plugin-react

## Knowledge Gaps
- **595 isolated node(s):** `config`, `name`, `version`, `description`, `main` (+590 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 761 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `ModernLanding.tsx`, `SwapyFeatures.tsx`, `sticky-note-polaroid-frame.tsx`, `client/package.json`, `api.ts`, `AccountLinker.tsx`, `ActivityHeatmap.tsx`, `swapy-draggable-card.tsx`, `useAuth`, `FoldText.tsx`, `LogoLoop.tsx`, `ScrollVelocity.tsx`, `AuthContext.tsx`, `Complaints.tsx`, `ProfilePortfolio.tsx`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **Why does `@tanstack/react-query` connect `api.ts` to `ModernLanding.tsx`, `react`, `client/package.json`, `AccountLinker.tsx`, `useAuth`, `AuthContext.tsx`, `Complaints.tsx`, `ProfilePortfolio.tsx`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Why does `express` connect `routes/auth.ts` to `server/package.json`, `users.ts`, `server/src/index.ts`, `contributors.ts`, `db.ts`, `perks.ts`, `integrations.ts`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **What connects `config`, `name`, `version` to the rest of the system?**
  _595 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._
- **Should `server/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05555555555555555 - nodes in this community are weakly interconnected._
- **Should `shared/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._