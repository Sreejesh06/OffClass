# Graph Report - Cryptid  (2026-09-13)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 164 nodes · 162 edges · 15 communities (13 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `10aee8ed`
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
- devDependencies
- server/src/index.ts
- .oxlintrc.json
- dependencies
- devDependencies
- scripts
- App.tsx
- client/tsconfig.json

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 18 edges
2. `compilerOptions` - 16 edges
3. `compilerOptions` - 15 edges
4. `scripts` - 5 edges
5. `scripts` - 3 edges
6. `react` - 3 edges
7. `typescript` - 3 edges
8. `rules` - 3 edges
9. `App()` - 2 edges
10. `scripts` - 2 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (15 total, 2 thin omitted)

### Community 0 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+11 more)

### Community 1 - "server/package.json"
Cohesion: 0.11
Nodes (18): cors, dotenv, shared, tsx, @types/cors, @types/express, author, description (+10 more)

### Community 2 - "shared/package.json"
Cohesion: 0.11
Nodes (17): typescript, author, dependencies, zod, description, devDependencies, typescript, zod (+9 more)

### Community 3 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 4 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, declaration, declarationMap, exactOptionalPropertyTypes, isolatedModules, jsx, module, moduleDetection (+8 more)

### Community 5 - "client/package.json"
Cohesion: 0.13
Nodes (14): dependencies, react, react-dom, @types/node, name, private, type, version (+6 more)

### Community 6 - "package.json"
Cohesion: 0.17
Nodes (11): author, description, keywords, license, main, name, packageManager, private (+3 more)

### Community 7 - "devDependencies"
Cohesion: 0.25
Nodes (8): devDependencies, oxlint, @types/node, @types/react, @types/react-dom, typescript, vite, @vitejs/plugin-react

### Community 8 - "server/src/index.ts"
Cohesion: 0.33
Nodes (4): express, app, CreateUserInput, createUserSchema

### Community 9 - ".oxlintrc.json"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 10 - "dependencies"
Cohesion: 0.33
Nodes (6): dependencies, cors, dotenv, express, shared, zod

### Community 11 - "devDependencies"
Cohesion: 0.33
Nodes (6): devDependencies, tsx, @types/cors, @types/express, @types/node, typescript

### Community 12 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, preview

## Knowledge Gaps
- **127 isolated node(s):** `CreateUserInput`, `allowArbitraryExtensions`, `allowImportingTsExtensions`, `erasableSyntaxOnly`, `jsx` (+122 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 128 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `typescript` connect `shared/package.json` to `server/package.json`, `client/package.json`?**
  _High betweenness centrality (0.137) - this node is a cross-community bridge._
- **Why does `@types/node` connect `client/package.json` to `server/package.json`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `client/package.json`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **What connects `CreateUserInput`, `allowArbitraryExtensions`, `allowImportingTsExtensions` to the rest of the system?**
  _127 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `server/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `shared/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._