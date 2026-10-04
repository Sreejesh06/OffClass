# Cryptid — Pending Tasks & Roadmap

The core functionality (Auth, Leaderboards, Sync Workers, MinIO Uploads, PoW Complaints, Redemptions, and Blockchain Anchoring) is **100% complete**. 

The following items are the remaining tasks required to take Cryptid from a "complete codebase" to a "live production application", along with the "Extras" defined in the original project spec.

---

## 🚀 1. Production Deployment (Immediate Next Steps)
These are required before students can actually start using the platform.

- [ ] **Deploy Blockchain Contract:** Manually deploy `contracts/AchievementAnchor.sol` via Remix to the Polygon Amoy testnet and retrieve the contract address.
- [ ] **Configure Production `.env`:** Generate secure passwords for PostgreSQL, Redis, and MinIO. Fill out the `.env` on the college server.
- [ ] **Real SMTP Integration:** Replace the Ethereal Email fallback with a real college SMTP server (or SendGrid/Resend) for password resets and email verification.
- [ ] **Worker Process Management:** Ensure the BullMQ `syncWorker` runs concurrently with the Express server in production. (If using Docker, ensure the `worker` runs on a separate container or via a process manager like PM2).
- [ ] **Reverse Proxy / HTTPS:** Configure Nginx or Caddy on the college server to route traffic to the Docker containers and attach a TLS/SSL certificate.

---

## 🎨 2. UI/UX Polish
Minor frontend cleanups to ensure the application feels premium.

- [ ] **Empty States:** Add beautiful, illustrative empty states for tables (e.g., "No complaints found", "No perks available", "Leaderboard is empty").
- [ ] **Toast Notifications:** Ensure all asynchronous actions (saving settings, redeeming perks, submitting complaints) trigger a non-intrusive success/error toast.
- [ ] **Responsive Audit:** Do a final manual pass on mobile devices (phones/tablets) to ensure complex tables (like the Admin Dashboard) scroll horizontally or collapse gracefully.

---

## 🔮 3. Phase 2 Features (The "Extras")
These were explicitly marked in `AGENTS.md` as features to build *after* the core was solid and deployed.

- [ ] **Teammate Finder:** We added `lookingForTeammate` to the DB schema for Opportunities. We need a UI on the Opportunity Board where students can see who else is looking for a team for a specific Hackathon or CTF.
- [ ] **Resume Export:** Add a "Generate Resume" button to the Student Profile that compiles their synced GitHub/HTB stats, certifications, and badges into a clean, college-branded PDF.
- [ ] **Skill Tracks / Learning Paths:** Add a UI section per House (Red, Blue, Green, Purple) that lists the recommended introductory resources and certifications for that specialization.
- [ ] **Mentorship Matching:** A system for juniors to request mentorship from seniors who are in the top 10% of the overall leaderboard.

---

## 🧹 4. Tech Debt & Maintenance
- [ ] **Cron Jobs for Cleanup:** Implement a scheduled task (e.g., via node-cron) to delete orphaned files in MinIO (certs stuck in `PENDING_VERIFICATION` for > 7 days).
- [ ] **Integration Tests:** Add a suite of end-to-end tests for the critical path (Points Awarded -> Leaderboard Z-Score Updated -> Snapshot Reset).
