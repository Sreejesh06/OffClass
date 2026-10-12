# Graph Report - Cryptid  (2026-10-12)

## Corpus Check
- 277 files · ~877,481 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 92 file(s) not represented in the graph (top: .ttf 17, .eot 15, .woff 15)

## Summary
- 1448 nodes · 2485 edges · 91 communities (65 shown, 17 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 27 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e413249d`
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
- react
- components.json
- dependencies
- integrations.ts
- Redeem.tsx
- SwapyFeatures.tsx
- App.tsx
- seedRubric.ts
- sticky-note-polaroid-frame.tsx
- user.ts
- B. OWASP Top 10 Verification
- TypedListener
- test-heatmap.cjs
- blockchain.ts
- ActivityHeatmap.tsx
- routes/auth.ts
- query.cjs
- seed-opportunities.ts
- test-bookmark.ts
- update-admin-avatar.ts
- server/seed.ts
- test-heatmap.js
- ModernLanding.tsx
- factories/index.ts
- TypedContractEvent
- factories/@openzeppelin/contracts/token/ERC1155/index.ts
- TypedDeferredTopicFilter
- restore.sh
- blockchain/package.json
- IERC1155MetadataURI.ts
- common.ts
- IERC1155.ts
- typechain-types/index.ts
- db.ts
- admin.ts
- TypedContractMethod
- 3. Deployment Steps
- users.ts
- IERC1155Errors
- CryptidRegistry.ts
- devDependencies
- CryptidRegistry__factory.ts
- Ownable__factory.ts
- contributors.ts
- Ownable.ts
- SafeCast__factory.ts
- Cryptid — Final Codebase Audit (V4)
- compilerOptions
- Strings__factory.ts
- HardhatEthersHelpers
- scripts
- Cryptid Smart Contracts
- Cryptid — Pending Tasks & Roadmap
- Fonts Directory
- vite.config.ts
- deploy-check.sh

## God Nodes (most connected - your core abstractions)
1. `react` - 60 edges
2. `TypedDeferredTopicFilter` - 53 edges
3. `TypedListener` - 53 edges
4. `api` - 32 edges
5. `TypedContractMethod` - 31 edges
6. `useAuth()` - 31 edges
7. `@tanstack/react-query` - 28 edges
8. `TypedEventLog` - 27 edges
9. `prisma` - 26 edges
10. `TypedContractEvent` - 25 edges

## Surprising Connections (you probably didn't know these)
- `InterestedStudent` --references--> `House`  [EXTRACTED]
  client/src/components/InterestedStudentsModal.tsx → shared/src/schemas/user.ts
- `Props` --references--> `OpportunityType`  [EXTRACTED]
  client/src/components/OpportunityCard.tsx → shared/src/schemas/opportunity.ts
- `Props` --references--> `House`  [EXTRACTED]
  client/src/components/OpportunityCard.tsx → shared/src/schemas/user.ts
- `HallOfFame()` --calls--> `useAuth()`  [EXTRACTED]
  client/src/pages/HallOfFame.tsx → client/src/contexts/AuthContext.tsx
- `Login()` --calls--> `useAuth()`  [EXTRACTED]
  client/src/pages/Login.tsx → client/src/contexts/AuthContext.tsx

## Import Cycles
- None detected.

## Communities (91 total, 17 thin omitted)

### Community 0 - "compilerOptions"
Cohesion: 0.09
Nodes (22): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, baseUrl, erasableSyntaxOnly, ignoreDeprecations, jsx, lib (+14 more)

### Community 1 - "server/package.json"
Cohesion: 0.05
Nodes (37): pino, pino-pretty, prisma, tsup, tsx, @types/bcrypt, @types/cookie-parser, @types/cors (+29 more)

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
Nodes (24): axios, ethers, @playwright/test, shared, @types/node, typescript, name, private (+16 more)

### Community 6 - "package.json"
Cohesion: 0.06
Nodes (31): puppeteer, author, dependencies, dotenv, node-fetch, puppeteer, description, dotenv (+23 more)

### Community 7 - "syncWorker.ts"
Cohesion: 0.07
Nodes (30): bullmq, CodeforcesRaw, fetchCodeforces(), parseCodeforces(), fetchGfg(), GfgRaw, parseGfg(), fetchGithub() (+22 more)

### Community 8 - "server/src/index.ts"
Cohesion: 0.11
Nodes (25): cookie-parser, cors, express, express-rate-limit, helmet, pino-http, apiLimiter, generateChallenge() (+17 more)

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
Cohesion: 0.14
Nodes (4): _abi, IERC1155Receiver__factory, IERC1155Receiver, IERC1155ReceiverInterface

### Community 15 - "useAuth"
Cohesion: 0.09
Nodes (30): OpportunityBoard, OpportunityCompose, SpotlightCompose, AchievementModal(), BadgeWallet(), ComposeOpportunityCard(), HOUSES, OPPORTUNITY_TYPES (+22 more)

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
Cohesion: 0.08
Nodes (33): Complaints, Alert(), AlertDescription(), AlertTitle(), alertVariants, Badge(), badgeVariants, Button() (+25 more)

### Community 28 - "react"
Cohesion: 0.07
Nodes (46): ProfilePortfolio, AccountLinker(), fetchSyncStatus(), getPlatformIcon(), PlatformLink, SyncState, AchievementCategory, AchievementModalProps (+38 more)

### Community 29 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 30 - "dependencies"
Cohesion: 0.10
Nodes (21): dependencies, axios, @base-ui/react, class-variance-authority, cn, ethers, @fontsource-variable/geist, framer-motion (+13 more)

### Community 31 - "integrations.ts"
Cohesion: 0.14
Nodes (16): @aws-sdk/client-s3, @aws-sdk/s3-request-presigner, file-type, deleteFile(), fetchFileHeaderBytes(), fetchObjectMetadata(), generatePresignedGet(), generatePresignedPut() (+8 more)

### Community 32 - "Redeem.tsx"
Cohesion: 0.16
Nodes (12): ManagePerkModal(), ManagePerkModalProps, Dialog(), DialogContent(), DialogDescription(), DialogFooter(), DialogHeader(), DialogTitle() (+4 more)

### Community 33 - "SwapyFeatures.tsx"
Cohesion: 0.10
Nodes (14): initialItems, Item, SwapyFeatures(), AnimationType, cn(), Config, DragHandle(), dragOpacityClassMap (+6 more)

### Community 34 - "App.tsx"
Cohesion: 0.06
Nodes (40): AdminDashboard, App(), ForgotPassword, HallOfFame, Leaderboard, Login, queryClient, Redeem (+32 more)

### Community 36 - "sticky-note-polaroid-frame.tsx"
Cohesion: 0.29
Nodes (3): StickyNotePolaroidFrame, StickyNotePolaroidFrameProps, toCssSize()

### Community 37 - "user.ts"
Cohesion: 0.11
Nodes (18): CreateOpportunityPayload, CreateOpportunitySchema, ToggleBookmarkPayload, ToggleBookmarkSchema, UpdateOpportunityPayload, UpdateOpportunitySchema, HouseEnum, LoginPayload (+10 more)

### Community 38 - "B. OWASP Top 10 Verification"
Cohesion: 0.10
Nodes (19): 10. Server-Side Request Forgery (SSRF), 1. Broken Access Control, 2. Cryptographic Failures, 3. Injection, 4. Insecure Design, 5. Security Misconfiguration, 6. Vulnerable and Outdated Components, 7. Identification and Authentication Failures (+11 more)

### Community 39 - "TypedListener"
Cohesion: 0.14
Nodes (3): TypedListener, SafeCast, Strings

### Community 40 - "test-heatmap.cjs"
Cohesion: 0.25
Nodes (7): map, monthLabels, months, result, startDate, today, weeks

### Community 41 - "blockchain.ts"
Cohesion: 0.38
Nodes (6): anchorCertificateHash(), blockchainEnabled(), computeAchievementHash(), cryptidRegistry, mintAchievementSBT(), provider

### Community 43 - "routes/auth.ts"
Cohesion: 0.14
Nodes (15): bcrypt, nodemailer, otplib, qrcode, prisma, clearAuthCookies(), generateAccessToken(), generateRefreshToken() (+7 more)

### Community 50 - "ModernLanding.tsx"
Cohesion: 0.05
Nodes (39): Home, Houses, ContributorPayload, ContributorsResponse, ContributorsSection(), FALLBACK_CONTRIBUTORS, Footer(), HouseData (+31 more)

### Community 51 - "factories/index.ts"
Cohesion: 0.33
Nodes (3): contracts, openzeppelin, contracts

### Community 52 - "TypedContractEvent"
Cohesion: 0.07
Nodes (14): TypedContractEvent, ApprovalForAllEvent, ERC1155, Event, Filter, InputTuple, Log, LogDescription (+6 more)

### Community 53 - "factories/@openzeppelin/contracts/token/ERC1155/index.ts"
Cohesion: 0.07
Nodes (10): _abi, ERC1155__factory, _abi, IERC1155MetadataURI__factory, _abi, IERC1155__factory, extensions, ERC1155Interface (+2 more)

### Community 56 - "blockchain/package.json"
Cohesion: 0.07
Nodes (24): config, author, description, devDependencies, chai, dotenv, hardhat, @nomicfoundation/hardhat-toolbox (+16 more)

### Community 57 - "IERC1155MetadataURI.ts"
Cohesion: 0.10
Nodes (12): ApprovalForAllEvent, Event, Filter, IERC1155MetadataURI, InputTuple, Log, LogDescription, OutputObject (+4 more)

### Community 58 - "common.ts"
Cohesion: 0.14
Nodes (13): BaseOverrides, ContractMethodArgs, DefaultReturnType, GetARGsTypeFromFactory, GetContractTypeFromFactory, MinEthersFactory, Overrides, PayableOverrides (+5 more)

### Community 59 - "IERC1155.ts"
Cohesion: 0.17
Nodes (11): ApprovalForAllEvent, Event, Filter, InputTuple, Log, LogDescription, OutputObject, OutputTuple (+3 more)

### Community 60 - "typechain-types/index.ts"
Cohesion: 0.11
Nodes (6): CryptidRegistry, _abi, IERC20Errors__factory, factories, IERC20Errors, IERC20ErrorsInterface

### Community 61 - "db.ts"
Cohesion: 0.23
Nodes (8): jsonwebtoken, supertest, vitest, app, logAction(), prisma, HouseFilterSchema, OpportunityTypeSchema

### Community 62 - "admin.ts"
Cohesion: 0.13
Nodes (21): ioredis, main(), prisma, awardPoints(), getHouseKey(), getOverallKey(), getTopUsers(), getUserRank() (+13 more)

### Community 63 - "TypedContractMethod"
Cohesion: 0.06
Nodes (9): TypedContractMethod, _abi, ERC165__factory, _abi, IERC165__factory, ERC165, ERC165Interface, IERC165 (+1 more)

### Community 64 - "3. Deployment Steps"
Cohesion: 0.04
Nodes (43): 1. System Architecture, 2. Server Node Prerequisites, 3. Deployment Steps, 4. Operational Maintenance, 5. Automated Database Backups & Disaster Recovery, 6. Troubleshooting Common Issues, Applying Future Updates, Automated Nightly Backups (+35 more)

### Community 66 - "users.ts"
Cohesion: 0.22
Nodes (7): notifyAdminsAndTeachers(), AchievementSubmitSchema, AvatarSchema, BioSchema, HouseTransferSchema, ProfileSchema, router

### Community 67 - "IERC1155Errors"
Cohesion: 0.09
Nodes (8): _abi, IERC1155Errors__factory, _abi, IERC721Errors__factory, IERC1155Errors, IERC1155ErrorsInterface, IERC721Errors, IERC721ErrorsInterface

### Community 68 - "CryptidRegistry.ts"
Cohesion: 0.14
Nodes (13): ApprovalForAllEvent, Event, Filter, HashAnchoredEvent, InputTuple, Log, LogDescription, OutputObject (+5 more)

### Community 69 - "devDependencies"
Cohesion: 0.14
Nodes (14): devDependencies, autoprefixer, @axe-core/react, oxlint, @playwright/test, postcss, tailwindcss, @tailwindcss/vite (+6 more)

### Community 70 - "CryptidRegistry__factory.ts"
Cohesion: 0.18
Nodes (5): CryptidRegistryInterface, _abi, CryptidRegistry__factory, CryptidRegistryConstructorParams, isSuperArgs()

### Community 71 - "Ownable__factory.ts"
Cohesion: 0.22
Nodes (3): _abi, Ownable__factory, OwnableInterface

### Community 72 - "contributors.ts"
Cohesion: 0.25
Nodes (6): ContributorPayload, ContributorsResponse, ContributorWeek, FALLBACK_AGGREGATE, FALLBACK_CONTRIBUTORS, router

### Community 73 - "Ownable.ts"
Cohesion: 0.09
Nodes (10): TypedLogDescription, Event, Filter, InputTuple, Log, LogDescription, OutputObject, OutputTuple (+2 more)

### Community 74 - "SafeCast__factory.ts"
Cohesion: 0.26
Nodes (6): NonPayableOverrides, _abi, isSuperArgs(), SafeCast__factory, SafeCastConstructorParams, SafeCastInterface

### Community 75 - "Cryptid — Final Codebase Audit (V4)"
Cohesion: 0.22
Nodes (8): 1. Backend Data & Stability, 2. Authentication & Auth UI, 3. Blockchain Anchoring, 🏗 Architecture Summary, 🛠 Bugs & Gaps Remediated in Final Sprint, Cryptid — Final Codebase Audit (V4), 🚫 Things Explicitly Omitted to Avoid Over-Engineering, 🛡 Things We Audited That Are Perfectly Fine

### Community 76 - "compilerOptions"
Cohesion: 0.22
Nodes (8): compilerOptions, esModuleInterop, module, outDir, strict, target, files, include

### Community 78 - "Strings__factory.ts"
Cohesion: 0.20
Nodes (7): introspection, math, _abi, isSuperArgs(), Strings__factory, StringsConstructorParams, StringsInterface

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
- **651 isolated node(s):** `config`, `name`, `version`, `description`, `main` (+646 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 816 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `Redeem.tsx`, `SwapyFeatures.tsx`, `App.tsx`, `sticky-note-polaroid-frame.tsx`, `client/package.json`, `ActivityHeatmap.tsx`, `useAuth`, `ModernLanding.tsx`, `Complaints.tsx`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **Why does `@tanstack/react-query` connect `react` to `Redeem.tsx`, `App.tsx`, `client/package.json`, `useAuth`, `ModernLanding.tsx`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Why does `lucide-react` connect `Redeem.tsx` to `SwapyFeatures.tsx`, `client/package.json`, `useAuth`, `ModernLanding.tsx`, `Complaints.tsx`, `react`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **What connects `config`, `name`, `version` to the rest of the system?**
  _651 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._
- **Should `server/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05128205128205128 - nodes in this community are weakly interconnected._
- **Should `shared/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._