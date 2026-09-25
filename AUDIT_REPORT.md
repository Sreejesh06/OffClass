# Cryptid — Final Codebase Audit (V4)
**Scope:** College department tool, ~500 students, 4 houses, small dev team  
**Method:** Read every `.ts` file in `server/src/`, every route, every lib, the full schema, key frontend pages  

---

## 🏗 Architecture Summary

| Layer | Tech | Status |
|---|---|---|
| Auth | JWT httpOnly cookies + refresh token rotation + TOTP for admins | ✅ Solid |
| Database | Postgres via Prisma, proper transactions everywhere | ✅ Solid |
| Cache | Redis sorted sets for leaderboard, PoW seeds | ✅ Solid |
| Queue | BullMQ workers per platform (GitHub, CF, LC, GFG, HTB, THM) | ✅ Solid |
| Storage | MinIO presigned URLs + server-side file type sniffing | ✅ Solid |
| Email | Nodemailer with Ethereal fallback for dev | ✅ Solid |
| Complaints | PoW challenge, no FK, no IP, time-bucketed | ✅ Solid |
| Perks | Row-level locking (`FOR UPDATE`), idempotency keys | ✅ Solid |
| Blockchain | Deterministic SHA-256 hashing anchored on Polygon Amoy | ✅ Solid |

*Note: This is genuinely well-architected for a college project. The review below only highlights the minor bugs and gaps that were fixed in the final remediation sprint.*

---

## 🛠 Bugs & Gaps Remediated in Final Sprint

All of the following items were discovered in the final audit and **have been fully fixed and merged**.

### 1. Backend Data & Stability
- **BUG-1 (Export Crash):** The CSV export endpoint (`GET /export/students`) previously referenced `githubUsername` and `htbUsername` as direct table columns, which would cause a Prisma crash. **Fixed:** Updated the `select` to use `profileLinks` and flatten the output correctly.
- **BUG-2 (Audit Log Unhandled Rejections):** The `logAction` function calls in the approval flow were not wrapped in try/catches. **Fixed:** Wrapped them, preventing the parent transaction from crashing if the audit log failed.
- **GAP-4 (Snapshot Data Loss):** `admin/snapshot` previously wiped ALL user points, including admins and teachers. **Fixed:** Added a `where: { role: "STUDENT" }` constraint.
- **GAP-1 (Worker Typings):** The `syncWorker.ts` file had narrow TypeScript return types causing compilation noise. **Fixed:** Widened `ParseFn` to `Record<string, unknown>`.

### 2. Authentication & Auth UI
- **BUG-4 (Logout Silent Failure):** `clearAuthCookies` was not passing the `secure` and `sameSite` options. In production, this would cause browsers to ignore the cookie deletion. **Fixed:** Appended the correct environment-aware cookie options to ensure successful logout.
- **GAP-3 (Resend Verification):** Students could get permanently locked out if their verification email dropped. **Fixed:** Created the `POST /auth/resend-verification` endpoint and UI.
- **BUG-6 (Frontend Parsing):** Vite's bundler was throwing a parsing error on `Signup.tsx` due to improperly escaped backticks inside JSX literals. **Fixed:** Refactored the template literals.

### 3. Blockchain Anchoring
- **BUG-7 (EVM bytes32 Padding):** A UUID without hyphens is 16 bytes. Solidity's `bytes32` requires exactly 32 bytes. Ethers.js would crash aggressively if passed a 16-byte hex. **Fixed:** Implemented `.padEnd(64, '0')` on the UUID strings in both `blockchain.ts` and `Verify.tsx` before interacting with the RPC.

---

## 🛡 Things We Audited That Are Perfectly Fine
*(These were explicitly double-checked and require no changes)*

- **Refresh Token Rotation:** Accurately detects reuse and revokes the entire family.
- **PoW for Complaints:** Safely generates single-use seeds stored in Redis with a TTL.
- **Perk Race Conditions:** Correctly uses `SELECT ... FOR UPDATE` row locks and idempotency keys to prevent double-spending.
- **File Type Validation:** Properly uses `file-type` to inspect magic bytes, ignoring malicious file extensions.
- **Leaderboard Consistency:** Fast Redis z-set insertions accurately mirror Postgres as the source of truth, with a panic rebuild button for admins.

---

## 🚫 Things Explicitly Omitted to Avoid Over-Engineering
*(Do not implement these without a massive scale requirement)*

- **Request Validation Middleware:** Zod is already inline on every route. No need for a bulky middleware abstraction.
- **API Versioning:** It's an internal tool with a single consumer. 
- **Database Connection Pooling:** Prisma handles this inherently. 500 users does not require PgBouncer.
- **Redis Sentinel/Cluster:** A single Redis instance is entirely sufficient for this scale for years.
