# Cryptid — Project Context

This is the reference doc for what this project actually is, who uses it, and what each part is supposed to do. Read this before making any change so the project doesn't drift into something it wasn't meant to be.

---

## 1. What this is

**Cryptid** is a website for a college cybersecurity department (roughly 500 students now, built to comfortably handle up to ~10,000). Students are split into 4 houses — Red, Blue, Green, Purple — each representing a different specialization. The site gives every student a profile that shows their real skill (GitHub, Codeforces, HackTheBox, certifications, CTF results), a points system tied to real achievements, a leaderboard per house and overall, a way to redeem points for real perks, an anonymous way to raise complaints, and tools for teachers to manage all of this without spreadsheets and email chains.

It's a department tool, not a startup product — built and maintained by students, with a few teachers involved for approvals and oversight. Keep decisions sized for that: a small team, a closed audience, and a college's actual resources, not a company shipping to the public internet.

---

## 2. Who uses it, and what they actually do here

### Students (the main users)
- Sign up with their college email, get placed in a house
- Build a profile: link GitHub/Codeforces/HTB, upload certificates, log CTF wins
- Check their own rank and their house's rank on the leaderboard
- Earn points automatically (from linked accounts) and manually (from teacher-approved submissions)
- Redeem points for perks — priority slots, badges, academic perks, placement priority, merch
- Submit an anonymous complaint if something's wrong — unfair grading, harassment, a dispute about points
- Browse the public Hall of Fame, find teammates, see house resources

### Teachers / faculty
- Approve or reject point submissions (certs, CTF wins, workshop attendance)
- Approve redemptions that need sign-off (academic perks like OD, bonus marks)
- See at-risk students (no activity in weeks) so they can check in
- Export reports for department records/accreditation
- Review anonymous complaints routed to them, and act on them

### Admins (a couple of trusted students/faculty)
- Manage house assignments, the points rubric, and the redemption catalogue
- Handle account issues, review flagged content, keep the platform running

### The public (anyone, no login)
- Can view the Hall of Fame — this is meant to be shown off, to parents, recruiters, other departments

---

## 3. Features, explained plainly

**Student profile** — a page per student showing their house, bio, linked accounts, synced stats (commits, competitive programming rating, HTB progress), certifications, and badges earned. This is the "proof of work" page — the whole point is that effort becomes visible.

**Leaderboards** — one per house, plus one overall ranking every student in the department. Points reset each term so new students aren't stuck permanently behind seniors.

**Points system** — every action (CTF solve, cert earned, workshop attended, consistent GitHub activity) has a fixed, published point value everyone can see. No one gets points arbitrarily — there's always a reason logged against every point given.

**Redemption / perks** — students spend earned points on things that matter: priority for CTF team slots or workshop seats, a digital badge collection on their profile, being featured on the Hall of Fame, small academic perks (like an on-duty pass) that need teacher sign-off, priority for placement/internship referrals, and small merch. Every redemption is recorded — what was given, to whom, approved by whom — so there's never a dispute about who got what and why.

**Anonymous complaints** — a separate way to flag problems (grading disputes, house/point unfairness, harassment, bugs) without the student's identity being attached anywhere in the system. This only works if it's actually built to not know who submitted it — not just hidden from the normal UI. Complaints get a category so they reach the right person, and a tracking code so the student can check on it later without logging in.

**Teacher/admin tools** — a simple approval queue for point submissions, a way to flag inactive students, and exportable reports. This should save teachers time compared to what they do now (spreadsheets, email), not add more work.

**Skill tracks / resources per house** — turning the "key skillsets" for each house into an actual learning path, so students have somewhere to start instead of always asking a senior or teacher.

---

## 4. Security — sensible for a college project, not enterprise paranoia

Don't over-build this. The goal is "a reasonably careful developer would be comfortable putting this in front of 10,000 students," not "bank-grade infrastructure." Keep these basics in mind:

- Passwords are hashed properly, never stored as plain text — this one's non-negotiable regardless of scale.
- Only college email addresses can sign up.
- Teachers/admins have real permission checks on the backend — not just a hidden button in the UI, since anyone can call the underlying request directly.
- Rate-limit login attempts so it's not trivial to brute-force accounts.
- Validate what people upload (certificates, images) — check the file type and size before accepting it. Storing the actual files in a normal folder on the server (not literally inside the database as blobs) is completely fine at this scale — no need for anything fancier than that.
- Points and redemptions should be handled carefully enough that two requests happening at the same moment can't accidentally give someone double points or let them redeem something twice — a normal database transaction covers this, nothing exotic needed.
- The anonymous complaints feature is the one place worth extra care: don't store anything (login session, IP, precise timestamp) that could be used to trace a submission back to a person, since that's the entire point of the feature.
- Basic HTTPS, regular backups, and keeping dependencies reasonably up to date is enough — this doesn't need a dedicated security team's threat model, just normal good practice.

---

## 5. What this project is *not* trying to be

- Not a public product — closed to one college's students and staff
- Not trying to replace a real CTF-hosting platform (use an existing one like CTFd if you actually need to run CTFs — don't build that from scratch here)
- Not monetized, no ads, no payments
- Not built for massive scale — comfortably handling a few thousand concurrent users on modest infrastructure is the actual target, not millions of users
- Not meant to store more personal data than it needs to, especially anywhere near the complaints feature

If a new idea doesn't clearly help a student get recognized for real skill, help a teacher manage the department more easily, or give someone a safe way to raise a concern — it's probably outside what this project is for.

---

## 6. Rough build order

1. Student accounts + profiles
2. Leaderboards (house + overall)
3. Points system + redemption/perks
4. Linking GitHub/Codeforces/HTB and certificate uploads
5. Anonymous complaints
6. Teacher/admin tools
7. Polish, deploy on the college's own server, make sure it's solid and accessible
8. Extras later — mentorship matching, resume export, teammate finder, and anything else that comes up once the core is actually being used

Don't jump ahead to later features before the earlier ones are solid — a shaky foundation is what turns a good idea into an abandoned student project.