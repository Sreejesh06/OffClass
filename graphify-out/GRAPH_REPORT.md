# Graph Report - Cryptid  (2026-10-11)

## Corpus Check
- 274 files · ~872,593 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 92 file(s) not represented in the graph (top: .ttf 17, .eot 15, .woff 15)

## Summary
- 1410 nodes · 2434 edges · 98 communities (72 shown, 17 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 27 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `fc4be701`
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
- IERC1155Receiver
- client/tsconfig.json
- useAuth
- Cryptid — Project Context
- Installing Webfonts
- cc9e7343dc0eae1a2cf810ba2962241392502074.md
- React + TypeScript + Vite
- rules/graphify.md
- workflows/graphify.md
- factories/@openzeppelin/contracts/index.ts
- backup.sh
- init-db.sh
- Complaints.tsx
- ProfilePortfolio.tsx
- components.json
- dependencies
- integrations.ts
- AccountLinker.tsx
- SwapyFeatures.tsx
- react
- seedRubric.ts
- sticky-note-polaroid-frame.tsx
- user.ts
- api.ts
- TypedListener
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
- HousesShowcase.tsx
- factories/index.ts
- TypedContractEvent
- factories/@openzeppelin/contracts/token/ERC1155/index.ts
- TypedEventLog
- AuthContext.tsx
- blockchain/package.json
- IERC1155MetadataURI.ts
- common.ts
- IERC1155.ts
- typechain-types/index.ts
- db.ts
- admin.ts
- TypedContractMethod
- 3. Deployment Steps
- ERC165
- users.ts
- TypedDeferredTopicFilter
- CryptidRegistry.ts
- devDependencies
- CryptidRegistry__factory.ts
- contributors.ts
- Ownable.ts
- SafeCast__factory.ts
- Cryptid — Final Codebase Audit (V4)
- compilerOptions
- swapy-draggable-card.tsx
- Strings__factory.ts
- FoldText.tsx
- LogoLoop.tsx
- ScrollVelocity.tsx
- HardhatEthersHelpers
- scripts
- Cryptid Smart Contracts
- Cryptid — Pending Tasks & Roadmap
- Fonts Directory
- vite.config.ts
- deploy-check.sh
- ModernLanding.tsx
- Footer.tsx
- HeroLeaderboardMockup.tsx

## God Nodes (most connected - your core abstractions)
1. `react` - 60 edges
2. `TypedDeferredTopicFilter` - 53 edges
3. `TypedListener` - 53 edges
4. `api` - 32 edges
5. `TypedContractMethod` - 31 edges
6. `useAuth()` - 31 edges
7. `@tanstack/react-query` - 28 edges
8. `TypedEventLog` - 27 edges
9. `TypedContractEvent` - 25 edges
10. `react-router-dom` - 25 edges

## Surprising Connections (you probably didn't know these)
- `InterestedStudent` --references--> `House`  [EXTRACTED]
  client/src/components/InterestedStudentsModal.tsx → shared/src/schemas/user.ts
- `BadgeWallet()` --calls--> `useAuth()`  [EXTRACTED]
  client/src/components/BadgeWallet.tsx → client/src/contexts/AuthContext.tsx
- `Props` --references--> `OpportunityType`  [EXTRACTED]
  client/src/components/OpportunityCard.tsx → shared/src/schemas/opportunity.ts
- `Props` --references--> `House`  [EXTRACTED]
  client/src/components/OpportunityCard.tsx → shared/src/schemas/user.ts
- `HallOfFame()` --calls--> `useAuth()`  [EXTRACTED]
  client/src/pages/HallOfFame.tsx → client/src/contexts/AuthContext.tsx

## Import Cycles
- None detected.

## Communities (98 total, 17 thin omitted)

### Community 0 - "compilerOptions"
Cohesion: 0.09
Nodes (22): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, baseUrl, erasableSyntaxOnly, ignoreDeprecations, jsx, lib (+14 more)

### Community 1 - "server/package.json"
Cohesion: 0.06
Nodes (33): ioredis, pino, pino-pretty, prisma, tsup, tsx, @types/bcrypt, @types/cookie-parser (+25 more)

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
Nodes (31): bullmq, CodeforcesRaw, fetchCodeforces(), parseCodeforces(), fetchGfg(), GfgRaw, parseGfg(), fetchGithub() (+23 more)

### Community 8 - "server/src/index.ts"
Cohesion: 0.11
Nodes (24): cookie-parser, cors, express, express-rate-limit, helmet, pino-http, authLimiter, logAction() (+16 more)

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

### Community 13 - "IERC1155Receiver"
Cohesion: 0.13
Nodes (4): _abi, IERC1155Receiver__factory, IERC1155Receiver, IERC1155ReceiverInterface

### Community 15 - "useAuth"
Cohesion: 0.11
Nodes (26): OpportunityBoard, OpportunityCompose, ComposeOpportunityCard(), HOUSES, OPPORTUNITY_TYPES, HOUSE_COLORS, InterestedStudent, InterestedStudentsModal() (+18 more)

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

### Community 22 - "factories/@openzeppelin/contracts/index.ts"
Cohesion: 0.22
Nodes (6): access, interfaces, token, utils, draftIerc6093Sol, erc1155

### Community 27 - "Complaints.tsx"
Cohesion: 0.06
Nodes (49): Complaints, ForgotPassword, Redeem, ResetPassword, VerifyEmail, ManagePerkModal(), ManagePerkModalProps, Alert() (+41 more)

### Community 28 - "ProfilePortfolio.tsx"
Cohesion: 0.07
Nodes (24): ProfilePortfolio, AchievementCategory, AchievementModal(), AchievementModalProps, AVATAR_SEEDS, AvatarModal(), AvatarModalProps, CertificateUpload() (+16 more)

### Community 29 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 30 - "dependencies"
Cohesion: 0.09
Nodes (22): dependencies, axios, @base-ui/react, class-variance-authority, cn, ethers, @fontsource-variable/geist, framer-motion (+14 more)

### Community 31 - "integrations.ts"
Cohesion: 0.11
Nodes (20): @aws-sdk/client-s3, @aws-sdk/s3-request-presigner, file-type, anchorCertificateHash(), blockchainEnabled(), computeAchievementHash(), cryptidRegistry, mintAchievementSBT() (+12 more)

### Community 32 - "AccountLinker.tsx"
Cohesion: 0.31
Nodes (7): AccountLinker(), fetchSyncStatus(), getPlatformIcon(), PlatformLink, SyncState, IntegrationsModal(), IntegrationsModalProps

### Community 34 - "react"
Cohesion: 0.10
Nodes (20): AdminDashboard, App(), HallOfFame, Login, queryClient, Signup, SpotlightCompose, Verify (+12 more)

### Community 36 - "sticky-note-polaroid-frame.tsx"
Cohesion: 0.29
Nodes (3): StickyNotePolaroidFrame, StickyNotePolaroidFrameProps, toCssSize()

### Community 37 - "user.ts"
Cohesion: 0.11
Nodes (17): CreateOpportunityPayload, CreateOpportunitySchema, ToggleBookmarkPayload, ToggleBookmarkSchema, UpdateOpportunityPayload, UpdateOpportunitySchema, HouseEnum, LoginPayload (+9 more)

### Community 38 - "api.ts"
Cohesion: 0.11
Nodes (17): AdminDisciplineTab(), DisciplineRecord, AdminRubricTab(), RubricItem, BadgeWallet(), UserBadge, ContributorPayload, ContributorsResponse (+9 more)

### Community 39 - "TypedListener"
Cohesion: 0.10
Nodes (3): TypedListener, IERC1155, SafeCast

### Community 40 - "test-heatmap.cjs"
Cohesion: 0.25
Nodes (7): map, monthLabels, months, result, startDate, today, weeks

### Community 41 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, start, test

### Community 43 - "routes/auth.ts"
Cohesion: 0.15
Nodes (14): bcrypt, jsonwebtoken, nodemailer, otplib, qrcode, prisma, clearAuthCookies(), generateAccessToken() (+6 more)

### Community 50 - "HousesShowcase.tsx"
Cohesion: 0.29
Nodes (5): Houses, HouseData, HOUSES_DATA, HousesShowcase(), PILLARS

### Community 51 - "factories/index.ts"
Cohesion: 0.33
Nodes (3): contracts, openzeppelin, contracts

### Community 52 - "TypedContractEvent"
Cohesion: 0.08
Nodes (13): TypedContractEvent, ApprovalForAllEvent, ERC1155, Event, Filter, InputTuple, Log, LogDescription (+5 more)

### Community 53 - "factories/@openzeppelin/contracts/token/ERC1155/index.ts"
Cohesion: 0.07
Nodes (10): _abi, ERC1155__factory, _abi, IERC1155MetadataURI__factory, _abi, IERC1155__factory, extensions, ERC1155Interface (+2 more)

### Community 55 - "AuthContext.tsx"
Cohesion: 0.13
Nodes (19): Leaderboard, Layout(), House, ThemeContext, ThemeContextType, ThemeProvider(), useTheme(), AuthContext (+11 more)

### Community 56 - "blockchain/package.json"
Cohesion: 0.07
Nodes (24): config, author, description, devDependencies, chai, dotenv, hardhat, @nomicfoundation/hardhat-toolbox (+16 more)

### Community 57 - "IERC1155MetadataURI.ts"
Cohesion: 0.08
Nodes (12): ApprovalForAllEvent, Event, Filter, IERC1155MetadataURI, InputTuple, Log, LogDescription, OutputObject (+4 more)

### Community 58 - "common.ts"
Cohesion: 0.14
Nodes (13): BaseOverrides, ContractMethodArgs, DefaultReturnType, GetARGsTypeFromFactory, GetContractTypeFromFactory, MinEthersFactory, Overrides, PayableOverrides (+5 more)

### Community 59 - "IERC1155.ts"
Cohesion: 0.17
Nodes (11): ApprovalForAllEvent, Event, Filter, InputTuple, Log, LogDescription, OutputObject, OutputTuple (+3 more)

### Community 60 - "typechain-types/index.ts"
Cohesion: 0.12
Nodes (6): CryptidRegistry, _abi, IERC20Errors__factory, factories, IERC20Errors, IERC20ErrorsInterface

### Community 61 - "db.ts"
Cohesion: 0.29
Nodes (6): supertest, vitest, app, prisma, CATEGORY_WEIGHTS, recalculateHouseScores()

### Community 62 - "admin.ts"
Cohesion: 0.20
Nodes (14): main(), prisma, awardPoints(), getHouseKey(), getOverallKey(), getTopUsers(), getUserRank(), transferHouseLeaderboard() (+6 more)

### Community 63 - "TypedContractMethod"
Cohesion: 0.09
Nodes (5): TypedContractMethod, _abi, IERC165__factory, IERC165, IERC165Interface

### Community 64 - "3. Deployment Steps"
Cohesion: 0.05
Nodes (41): 1. System Architecture, 2. Server Node Prerequisites, 3. Deployment Steps, 4. Operational Maintenance, 5. Automated Midnight Database Backups, 6. Troubleshooting Common Issues, Applying Future Updates, Cryptid — Production Deployment Runbook (+33 more)

### Community 65 - "ERC165"
Cohesion: 0.13
Nodes (4): _abi, ERC165__factory, ERC165, ERC165Interface

### Community 66 - "users.ts"
Cohesion: 0.14
Nodes (13): notifyAdminsAndTeachers(), generateChallenge(), IMPORTANT: Use POW_TEST_MODE=true to lower difficulty, NOT MOCK_MINIO., verifyChallenge(), router, SubmitSchema, UpdateStatusSchema, AchievementSubmitSchema (+5 more)

### Community 67 - "TypedDeferredTopicFilter"
Cohesion: 0.09
Nodes (9): TypedDeferredTopicFilter, _abi, IERC1155Errors__factory, _abi, IERC721Errors__factory, IERC1155Errors, IERC1155ErrorsInterface, IERC721Errors (+1 more)

### Community 68 - "CryptidRegistry.ts"
Cohesion: 0.14
Nodes (13): ApprovalForAllEvent, Event, Filter, HashAnchoredEvent, InputTuple, Log, LogDescription, OutputObject (+5 more)

### Community 69 - "devDependencies"
Cohesion: 0.14
Nodes (14): devDependencies, autoprefixer, @axe-core/react, oxlint, @playwright/test, postcss, tailwindcss, @tailwindcss/vite (+6 more)

### Community 70 - "CryptidRegistry__factory.ts"
Cohesion: 0.18
Nodes (5): CryptidRegistryInterface, _abi, CryptidRegistry__factory, CryptidRegistryConstructorParams, isSuperArgs()

### Community 72 - "contributors.ts"
Cohesion: 0.25
Nodes (6): ContributorPayload, ContributorsResponse, ContributorWeek, FALLBACK_AGGREGATE, FALLBACK_CONTRIBUTORS, router

### Community 73 - "Ownable.ts"
Cohesion: 0.07
Nodes (13): TypedLogDescription, _abi, Ownable__factory, Event, Filter, InputTuple, Log, LogDescription (+5 more)

### Community 74 - "SafeCast__factory.ts"
Cohesion: 0.26
Nodes (6): NonPayableOverrides, _abi, isSuperArgs(), SafeCast__factory, SafeCastConstructorParams, SafeCastInterface

### Community 75 - "Cryptid — Final Codebase Audit (V4)"
Cohesion: 0.22
Nodes (8): 1. Backend Data & Stability, 2. Authentication & Auth UI, 3. Blockchain Anchoring, 🏗 Architecture Summary, 🛠 Bugs & Gaps Remediated in Final Sprint, Cryptid — Final Codebase Audit (V4), 🚫 Things Explicitly Omitted to Avoid Over-Engineering, 🛡 Things We Audited That Are Perfectly Fine

### Community 76 - "compilerOptions"
Cohesion: 0.22
Nodes (8): compilerOptions, esModuleInterop, module, outDir, strict, target, files, include

### Community 77 - "swapy-draggable-card.tsx"
Cohesion: 0.21
Nodes (11): AnimationType, cn(), Config, DragHandle(), dragOpacityClassMap, SwapMode, SwapyItem(), SwapyLayout() (+3 more)

### Community 78 - "Strings__factory.ts"
Cohesion: 0.20
Nodes (7): introspection, math, _abi, isSuperArgs(), Strings__factory, StringsConstructorParams, StringsInterface

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

### Community 99 - "ModernLanding.tsx"
Cohesion: 0.29
Nodes (5): Home, ModernLanding(), platformLogos, SwapyFeatures(), LogoItem

### Community 100 - "Footer.tsx"
Cohesion: 0.33
Nodes (5): Footer(), Particle, SpaceParticles(), SpaceParticlesProps, STAR_COLORS

### Community 103 - "HeroLeaderboardMockup.tsx"
Cohesion: 0.40
Nodes (5): getAvatarUrl(), HeroLeaderboardMockup(), HOUSE_CONFIG, HouseTab, LeaderboardEntry

## Knowledge Gaps
- **622 isolated node(s):** `config`, `name`, `version`, `description`, `main` (+617 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 785 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `AccountLinker.tsx`, `SwapyFeatures.tsx`, `ModernLanding.tsx`, `Footer.tsx`, `client/package.json`, `api.ts`, `sticky-note-polaroid-frame.tsx`, `HeroLeaderboardMockup.tsx`, `ActivityHeatmap.tsx`, `swapy-draggable-card.tsx`, `useAuth`, `FoldText.tsx`, `LogoLoop.tsx`, `HousesShowcase.tsx`, `ScrollVelocity.tsx`, `AuthContext.tsx`, `Complaints.tsx`, `ProfilePortfolio.tsx`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._
- **Why does `lucide-react` connect `useAuth` to `SwapyFeatures.tsx`, `ModernLanding.tsx`, `Footer.tsx`, `client/package.json`, `api.ts`, `HeroLeaderboardMockup.tsx`, `HousesShowcase.tsx`, `Complaints.tsx`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `client/package.json`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **What connects `config`, `name`, `version` to the rest of the system?**
  _622 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._
- **Should `server/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._
- **Should `shared/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._