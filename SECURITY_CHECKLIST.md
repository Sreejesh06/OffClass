# Cryptid — Security Verification & Compliance Checklist

This document tracks the technical verification of security controls and OWASP Top 10 mitigations implemented in **Cryptid**.

---

## Summary of Remediations Completed

| Item | Requirement Area | Status | Remediated Implementation Details |
| :--- | :--- | :---: | :--- |
| **1** | A.1 Password Policy | ✅ Enforced | `PasswordSchema` added to `shared/src/schemas/user.ts` and `Signup.tsx` requiring min 8 chars, uppercase, lowercase, numbers, and symbols. |
| **2** | A.4 & F.1 Seed Credentials | ✅ Hardened | `server/prisma/seed.ts` guarded against production execution (`NODE_ENV === 'production'`) and requires explicit `SEED_ADMIN_PASSWORD`. |
| **3** | B.5.2 Error Messages & Stacks | ✅ Sanitized | Raw `error.message` concatenation removed; centralized Express error-handling middleware registered in `server/src/index.ts`. |
| **4** | B.6.3 Outdated/Vulnerable Deps | ✅ Resolved | `pnpm audit` cleaned up to 0 vulnerabilities via dependency overrides and removal of unused CLI tool `shadcn`. |
| **5** | B.7.1 & B.9.1 Account Lockout & Audit | ✅ Implemented | Added `failedLoginAttempts` & `lockedUntil` on `User` model; locks account for 15 mins after 5 failed attempts; logs all auth events to `AuditLog`. |
| **6** | C.5 Upload Size Limits | ✅ Enforced | Added `fetchObjectMetadata` in `server/src/lib/minio.ts`; rejects & purges uploads exceeding 10MB in `server/src/routes/integrations.ts`. |
| **7** | E.4 Disaster Recovery & Restore | ✅ Verified | Created executable `scripts/restore.sh` with `age` decryption pipeline; documented recovery steps in `DEPLOYMENT.md`. |
| **8** | F.4 Search Engine Robots Policy | ✅ Created | Created `client/public/robots.txt` disallowing crawlers on administrative, private, and internal API paths. |

---

## Detailed Security Checklist

### A. Authentication and Access Control

| Sl. No. | Requirement | Yes | No | Implementation & Verification Evidence |
| :---: | :--- | :---: | :---: | :--- |
| 1. | Strong password policy enforced | [x] | [ ] | **Enforced:** `PasswordSchema` in [`shared/src/schemas/user.ts`](file:///Users/sreejesh/Documents/Projects/Cryptid/shared/src/schemas/user.ts) and [`client/src/pages/Signup.tsx`](file:///Users/sreejesh/Documents/Projects/Cryptid/client/src/pages/Signup.tsx) enforces minimum 8 characters, at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special symbol with explicit user feedback. |
| 2. | Multi-factor authentication enabled (if applicable) | [x] | [ ] | **Enforced:** TOTP 2FA (RFC 6238) implemented using `otplib` and QR code provisioning for administrative roles in [`server/src/routes/auth.ts`](file:///Users/sreejesh/Documents/Projects/Cryptid/server/src/routes/auth.ts#L259-L369). |
| 3. | Passwords stored using secure hashing algorithms | [x] | [ ] | **Enforced:** Passwords hashed with bcrypt (salt rounds = 10) in [`server/src/routes/auth.ts`](file:///Users/sreejesh/Documents/Projects/Cryptid/server/src/routes/auth.ts#L56). |
| 4. | Default accounts removed or disabled | [x] | [ ] | **Enforced:** [`server/prisma/seed.ts`](file:///Users/sreejesh/Documents/Projects/Cryptid/server/prisma/seed.ts) aborts in production (`NODE_ENV === "production"`) unless `ALLOW_PROD_SEED=true` with a non-default `SEED_ADMIN_PASSWORD` is supplied. Default credentials cannot be seeded to production. |
| 5. | Role-based access control implemented | [x] | [ ] | **Enforced:** Strict `Role` enum (`STUDENT`, `TEACHER`, `ADMIN`) validated by [`requireRole` middleware](file:///Users/sreejesh/Documents/Projects/Cryptid/server/src/middlewares/requireAuth.ts#L62-L76). |
| 6. | Unauthorized users cannot access restricted pages | [x] | [ ] | **Enforced:** Authenticated and role-protected routes return HTTP 401 Unauthorized or 403 Forbidden via [`requireAuth`](file:///Users/sreejesh/Documents/Projects/Cryptid/server/src/middlewares/requireAuth.ts#L17-L40) and [`requireRole`](file:///Users/sreejesh/Documents/Projects/Cryptid/server/src/middlewares/requireAuth.ts#L62-L76). |
| 7. | Session timeout configured | [x] | [ ] | **Enforced:** Short-lived access JWTs expire in 15 minutes (`expiresIn: "15m"`) in [`server/src/lib/auth.ts`](file:///Users/sreejesh/Documents/Projects/Cryptid/server/src/lib/auth.ts#L9-L32). |
| 8. | Logout invalidates active sessions | [x] | [ ] | **Enforced:** [`POST /api/auth/logout`](file:///Users/sreejesh/Documents/Projects/Cryptid/server/src/routes/auth.ts#L226-L239) revokes the refresh token in Postgres (`isRevoked: true`) and clears `httpOnly`, `secure`, `sameSite: "strict"` cookies. |

---

### B. OWASP Top 10 Verification

#### 1. Broken Access Control

| Sl. No. | Requirement | Yes | No | Implementation & Verification Evidence |
| :---: | :--- | :---: | :---: | :--- |
| 1. | Users cannot access other users’ data | [x] | [ ] | **Enforced:** Protected mutation endpoints in [`server/src/routes/users.ts`](file:///Users/sreejesh/Documents/Projects/Cryptid/server/src/routes/users.ts) scope queries by `userId: req.user!.userId`. Internal fields (such as 2FA secrets) are explicitly excluded from public queries. |
| 2. | Administrative functions protected | [x] | [ ] | **Enforced:** All administrative routes in [`server/src/routes/admin.ts`](file:///Users/sreejesh/Documents/Projects/Cryptid/server/src/routes/admin.ts) and admin complaints require `requireAuth` + `requireRole(["ADMIN", "TEACHER"])`. |
| 3. | Direct object references validated | [x] | [ ] | **Enforced:** Object ownership is validated before access (e.g. certificate viewing in [`server/src/routes/integrations.ts`](file:///Users/sreejesh/Documents/Projects/Cryptid/server/src/routes/integrations.ts#L236) checks `cert.userId === req.user!.userId || role === "ADMIN" || role === "TEACHER"`). |

#### 2. Cryptographic Failures

| Sl. No. | Requirement | Yes | No | Implementation & Verification Evidence |
| :---: | :--- | :---: | :---: | :--- |
| 1. | HTTPS enforced | [x] | [ ] | **Enforced:** TLS automatic provisioning and HTTPS redirection managed by Caddy in [`Caddyfile`](file:///Users/sreejesh/Documents/Projects/Cryptid/Caddyfile#L8) with HSTS preload. |
| 2. | Sensitive data encrypted in transit | [x] | [ ] | **Enforced:** End-to-end TLS encryption enforced by Caddy; cookies configured with `secure: true` in production in [`server/src/lib/auth.ts`](file:///Users/sreejesh/Documents/Projects/Cryptid/server/src/lib/auth.ts#L30). |
| 3. | Sensitive data encrypted at rest where applicable | [x] | [ ] | **Enforced:** Passwords (`bcrypt`), refresh tokens (`SHA-256`), verification tokens (`SHA-256`), and database backups ([`scripts/backup.sh`](file:///Users/sreejesh/Documents/Projects/Cryptid/scripts/backup.sh) via `age` asymmetric public key encryption) are encrypted at rest. |
| 4. | Secrets not stored in source code | [x] | [ ] | **Enforced:** Runtime secrets (`JWT_SECRET`, database passwords, RPC endpoints, private keys) are loaded from environment variables in [`docker-compose.yml`](file:///Users/sreejesh/Documents/Projects/Cryptid/docker-compose.yml) and `.env`. |

#### 3. Injection

| Sl. No. | Requirement | Yes | No | Implementation & Verification Evidence |
| :---: | :--- | :---: | :---: | :--- |
| 1. | Parameterized queries used | [x] | [ ] | **Enforced:** Prisma Client uses parameterized queries across all database operations. Raw row-locking queries in [`server/src/routes/perks.ts`](file:///Users/sreejesh/Documents/Projects/Cryptid/server/src/routes/perks.ts#L53-L57) use Prisma tagged templates (`$queryRaw\`... WHERE id = ${userId} ...\``) compiling to parameterized SQL. |
| 2. | SQL injection tested | [x] | [ ] | **Enforced:** Integration test suite (`server/src/__tests__`) executes queries with malicious strings without syntax or execution anomalies. |
| 3. | No command injection possibilities | [x] | [ ] | **Enforced:** No `child_process.exec`, `execSync`, or `spawn` invocations accept or process user input. |
| 4. | No unsanitized user input executed | [x] | [ ] | **Enforced:** No `eval()`, dynamic `Function()`, or unescaped string-to-code execution in application runtimes. |

#### 4. Insecure Design

| Sl. No. | Requirement | Yes | No | Implementation & Verification Evidence |
| :---: | :--- | :---: | :---: | :--- |
| 1. | Security requirements documented | [x] | [ ] | **Enforced:** Documented in [`AGENTS.md`](file:///Users/sreejesh/Documents/Projects/Cryptid/AGENTS.md) (threat model, anonymous complaint zero-identification requirements, ADR on blockchain verification). |
| 2. | Input validation implemented | [x] | [ ] | **Enforced:** Every request payload is parsed and validated using Zod schemas across shared types and API endpoints. |
| 3. | Business logic reviewed for abuse scenarios | [x] | [ ] | **Enforced:** Points redemption uses serializable transactions with row-level locks (`SELECT ... FOR UPDATE`) and idempotency keys to prevent race condition double-spending ([`server/src/routes/perks.ts`](file:///Users/sreejesh/Documents/Projects/Cryptid/server/src/routes/perks.ts#L50-L65)). Refresh token family reuse detection invalidates hijacked token families. |

#### 5. Security Misconfiguration

| Sl. No. | Requirement | Yes | No | Implementation & Verification Evidence |
| :---: | :--- | :---: | :---: | :--- |
| 1. | Debug mode disabled | [x] | [ ] | **Enforced:** Production mode disables `pino-pretty` development formatting in [`server/src/index.ts`](file:///Users/sreejesh/Documents/Projects/Cryptid/server/src/index.ts#L33-L36) in favor of structured JSON logging. |
| 2. | Error messages do not expose stack traces | [x] | [ ] | **Enforced:** Centralized Express error handler in [`server/src/index.ts`](file:///Users/sreejesh/Documents/Projects/Cryptid/server/src/index.ts) logs errors server-side via Pino and returns generic `{ error: "Internal server error" }` without leaking stack traces or internal schema information. |
| 3. | Directory listing disabled | [x] | [ ] | **Enforced:** Handled by Caddy's `file_server` (which disables directory browsing by default) with single-page application fallback in [`Caddyfile`](file:///Users/sreejesh/Documents/Projects/Cryptid/Caddyfile#L20-L25). |
| 4. | Security headers configured | [x] | [ ] | **Enforced:** Configured via `helmet({ frameguard: { action: "deny" } })` on the API in [`server/src/index.ts`](file:///Users/sreejesh/Documents/Projects/Cryptid/server/src/index.ts#L29) and Caddy proxy headers (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Content-Security-Policy`, and `HSTS`). |
| 5. | Unused services removed | [x] | [ ] | **Enforced:** Database, Redis, and PgBouncer are bound to an isolated internal Docker bridge network without exposed public host ports in [`docker-compose.yml`](file:///Users/sreejesh/Documents/Projects/Cryptid/docker-compose.yml). |

#### 6. Vulnerable and Outdated Components

| Sl. No. | Requirement | Yes | No | Implementation & Verification Evidence |
| :---: | :--- | :---: | :---: | :--- |
| 1. | Dependencies reviewed | [x] | [ ] | **Enforced:** Monorepo dependencies locked with `pnpm-lock.yaml` and verified with `--frozen-lockfile` in CI. |
| 2. | Outdated libraries updated | [x] | [ ] | **Enforced:** Transitive sub-dependencies updated via `pnpm` overrides in [`package.json`](file:///Users/sreejesh/Documents/Projects/Cryptid/package.json). |
| 3. | Known vulnerable packages removed | [x] | [ ] | **Enforced:** `pnpm audit` reports **0 vulnerabilities** across all workspace projects after applying patch overrides and removing unused CLI tooling. |

#### 7. Identification and Authentication Failures

| Sl. No. | Requirement | Yes | No | Implementation & Verification Evidence |
| :---: | :--- | :---: | :---: | :--- |
| 1. | Account lockout configured | [x] | [ ] | **Enforced:** Per-account lockout tracked via `failedLoginAttempts` and `lockedUntil` on the `User` model in [`server/src/routes/auth.ts`](file:///Users/sreejesh/Documents/Projects/Cryptid/server/src/routes/auth.ts). Consecutive incorrect passwords (5 attempts) lock the account for 15 minutes with remaining attempt feedback. |
| 2. | Password reset securely implemented | [x] | [ ] | **Enforced:** Secure 32-byte cryptographic token (`crypto.randomBytes(32)`), stored as a SHA-256 hash in DB, 1-hour expiration, revoking all existing sessions upon password reset in [`server/src/routes/auth.ts`](file:///Users/sreejesh/Documents/Projects/Cryptid/server/src/routes/auth.ts#L470-L541). |
| 3. | Session IDs are random and secure | [x] | [ ] | **Enforced:** Access JWT signed using HMAC-SHA256 with high-entropy `JWT_SECRET`; refresh tokens generate 32 cryptographically secure random bytes in [`server/src/lib/auth.ts`](file:///Users/sreejesh/Documents/Projects/Cryptid/server/src/lib/auth.ts#L14). |

#### 8. Software and Data Integrity Failures

| Sl. No. | Requirement | Yes | No | Implementation & Verification Evidence |
| :---: | :--- | :---: | :---: | :--- |
| 1. | Trusted package repositories used | [x] | [ ] | **Enforced:** Official npm package registry with sha512 integrity hashes verified in `pnpm-lock.yaml`. |
| 2. | CI/CD pipeline protected | [x] | [ ] | **Enforced:** GitHub Actions CI workflow in [`.github/workflows/ci.yml`](file:///Users/sreejesh/Documents/Projects/Cryptid/.github/workflows/ci.yml) and staging deployment gating in [`.github/workflows/deploy.yml`](file:///Users/sreejesh/Documents/Projects/Cryptid/.github/workflows/deploy.yml). |
| 3. | Code integrity verified before deployment | [x] | [ ] | **Enforced:** TypeScript compiler checks (`tsc --noEmit`), client and server builds, and migration verification run before deployment. |

#### 9. Security Logging and Monitoring Failures

| Sl. No. | Requirement | Yes | No | Implementation & Verification Evidence |
| :---: | :--- | :---: | :---: | :--- |
| 1. | Login events logged | [x] | [ ] | **Enforced:** Authentication events (`LOGIN_SUCCESS`, `LOGIN_FAILED`, `ACCOUNT_LOCKED`) are written to the persistent `AuditLog` table via `logAction` in [`server/src/routes/auth.ts`](file:///Users/sreejesh/Documents/Projects/Cryptid/server/src/routes/auth.ts). |
| 2. | Administrative actions logged | [x] | [ ] | **Enforced:** Administrative approvals, rejections, student exports, discipline records, rubric adjustments, and term resets write audit records via `logAction` in [`server/src/routes/admin.ts`](file:///Users/sreejesh/Documents/Projects/Cryptid/server/src/routes/admin.ts). |
| 3. | Error logs monitored | [x] | [ ] | **Enforced:** Centralized Pino structured logger tracks all HTTP errors with threaded `reqId` and request contexts in [`server/src/index.ts`](file:///Users/sreejesh/Documents/Projects/Cryptid/server/src/index.ts). |
| 4. | Audit logs retained | [x] | [ ] | **Enforced:** Retained in dedicated immutable `AuditLog` Postgres table ([`schema.prisma:198`](file:///Users/sreejesh/Documents/Projects/Cryptid/server/prisma/schema.prisma#L198)). |

#### 10. Server-Side Request Forgery (SSRF)

| Sl. No. | Requirement | Yes | No | Implementation & Verification Evidence |
| :---: | :--- | :---: | :---: | :--- |
| 1. | External URL inputs validated | [x] | [ ] | **Enforced:** Platform integration handles are verified with strict RegEx patterns in [`server/src/routes/integrations.ts`](file:///Users/sreejesh/Documents/Projects/Cryptid/server/src/routes/integrations.ts#L17-L24); external opportunity links validated via Zod `url()`. |
| 2. | Internal network resources protected | [x] | [ ] | **Enforced:** The backend does not fetch arbitrary URLs provided by clients; platform synchronizers only request predefined upstream domains (GitHub, Codeforces, LeetCode, TryHackMe). |
| 3. | Outbound requests restricted where possible | [x] | [ ] | **Enforced:** Outbound network requests are isolated to designated background queue workers ([`server/src/workers/syncWorker.ts`](file:///Users/sreejesh/Documents/Projects/Cryptid/server/src/workers/syncWorker.ts)). |

---

### C. Input Validation

| Sl. No. | Requirement | Yes | No | Implementation & Verification Evidence |
| :---: | :--- | :---: | :---: | :--- |
| 1. | Server-side validation implemented | [x] | [ ] | **Enforced:** Every API endpoint validates input structures and data types using Zod schemas before processing. |
| 2. | Client-side validation not solely relied upon | [x] | [ ] | **Enforced:** All server routes independently parse payloads using Zod, returning 400 Bad Request on failure. |
| 3. | File upload validation implemented | [x] | [ ] | **Enforced:** Certificates are inspected after upload by reading header magic bytes via `file-type` in [`server/src/routes/integrations.ts`](file:///Users/sreejesh/Documents/Projects/Cryptid/server/src/routes/integrations.ts#L201). |
| 4. | File type restrictions enforced | [x] | [ ] | **Enforced:** Strict MIME whitelist (`["application/pdf", "image/jpeg", "image/png"]`). Invalid files are deleted immediately from MinIO/S3. |
| 5. | File size limits enforced | [x] | [ ] | **Enforced:** Certificate verification fetches object metadata (`fetchObjectMetadata`) from MinIO/S3 and rejects any file exceeding 10MB (`MAX_CERT_SIZE = 10 * 1024 * 1024`) with automatic purge in [`server/src/routes/integrations.ts`](file:///Users/sreejesh/Documents/Projects/Cryptid/server/src/routes/integrations.ts). Avatar payload limits enforce 50KB string cap. |

---

### D. API Security (if applicable)

| Sl. No. | Requirement | Yes | No | Implementation & Verification Evidence |
| :---: | :--- | :---: | :---: | :--- |
| 1. | Authentication required for APIs | [x] | [ ] | **Enforced:** Protected API endpoints enforce [`requireAuth`](file:///Users/sreejesh/Documents/Projects/Cryptid/server/src/middlewares/requireAuth.ts). |
| 2. | Authorization validated | [x] | [ ] | **Enforced:** Role checks (`requireRole(["ADMIN", "TEACHER"])`) and object ownership verification protect state-changing operations. |
| 3. | Rate limiting implemented | [x] | [ ] | **Enforced:** Global rate limiter (300 req/15m) in [`server/src/index.ts`](file:///Users/sreejesh/Documents/Projects/Cryptid/server/src/index.ts#L45); strict auth limiter (15 req/15m) in [`server/src/routes/auth.ts`](file:///Users/sreejesh/Documents/Projects/Cryptid/server/src/routes/auth.ts#L24); Proof-of-Work computational challenge on complaints. |
| 4. | CORS configured securely | [x] | [ ] | **Enforced:** CORS explicitly restricts origins to `process.env.CLIENT_URL` with `credentials: true` in [`server/src/index.ts`](file:///Users/sreejesh/Documents/Projects/Cryptid/server/src/index.ts#L38-L39). No wildcard `*` with credentials. |
| 5. | API keys protected | [x] | [ ] | **Enforced:** Integration tokens (HTB, blockchain private keys) are kept in server environment variables and never sent to clients. |

---

### E. Deployment Security

| Sl. No. | Requirement | Yes | No | Implementation & Verification Evidence |
| :---: | :--- | :---: | :---: | :--- |
| 1. | Production environment separated from development | [x] | [ ] | **Enforced:** Dedicated compose configurations (`docker-compose.yml` for production, `docker-compose.dev.yml` for dev) and CI staging deployment pipeline in [`.github/workflows/deploy.yml`](file:///Users/sreejesh/Documents/Projects/Cryptid/.github/workflows/deploy.yml#L40). |
| 2. | Environment variables used for secrets | [x] | [ ] | **Enforced:** Secrets injected via `.env`; production server refuses to start if `JWT_SECRET` is unset ([`server/src/index.ts:80`](file:///Users/sreejesh/Documents/Projects/Cryptid/server/src/index.ts#L80)). |
| 3. | Backup mechanism available | [x] | [ ] | **Enforced:** Automated database dump script in [`scripts/backup.sh`](file:///Users/sreejesh/Documents/Projects/Cryptid/scripts/backup.sh) piping `pg_dump` directly to `age` asymmetric encryption so unencrypted data never touches disk. |
| 4. | Restore procedure verified | [x] | [ ] | **Enforced:** Executable restore script in [`scripts/restore.sh`](file:///Users/sreejesh/Documents/Projects/Cryptid/scripts/restore.sh) with decryption pipeline and confirmation safeguards; disaster recovery testing documented in [`DEPLOYMENT.md`](file:///Users/sreejesh/Documents/Projects/Cryptid/DEPLOYMENT.md). |

---

### F. General Security

| Sl. No. | Requirement | Yes | No | Implementation & Verification Evidence |
| :---: | :--- | :---: | :---: | :--- |
| 1. | No hardcoded credentials | [x] | [ ] | **Enforced:** Production credentials must be supplied via environment variables. Seed script ([`server/prisma/seed.ts`](file:///Users/sreejesh/Documents/Projects/Cryptid/server/prisma/seed.ts)) halts if executed in production without explicit configuration. |
| 2. | No exposed configuration files | [x] | [ ] | **Enforced:** `.env` is ignored by `.gitignore`. Caddy serves static assets and blocks direct folder exposure. |
| 3. | No publicly accessible admin panels without protection | [x] | [ ] | **Enforced:** Frontend route guards and backend API role enforcement (`requireRole(["ADMIN"])`) prevent unauthenticated and student access. |
| 4. | Robots.txt reviewed | [x] | [ ] | **Enforced:** Configured in [`client/public/robots.txt`](file:///Users/sreejesh/Documents/Projects/Cryptid/client/public/robots.txt), disallowing web crawlers from indexing private paths (`/admin`, `/api/`, `/complaints/admin`, `/settings`) while allowing public showcase pages. |
| 5. | Third-party integrations verified | [x] | [ ] | **Enforced:** Platform syncs use regex handle validation; blockchain contract anchors deterministic SHA-256 hashes without storing student PII on-chain. |
