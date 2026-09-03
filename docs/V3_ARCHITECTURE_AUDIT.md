# 🔍 CampusConnect v3.0 — Architecture Audit & Modernization Roadmap

## 1. Current Architecture Overview
- **Frontend**: React 19.2.8 + Vite 8.2 + Tailwind CSS v4 + React Router v7 + Lucide React.
- **Backend**: Node.js + Express 5.1 + Prisma ORM v6.0 + PostgreSQL.
- **Security**: Dual-token JWT (15-min access token + 7-day HTTP-only refresh token rotation in database), bcrypt, Helmet, CORS, express-rate-limit, Zod validators.
- **Current Core Modules**:
  - Rotating HMAC-SHA256 QR Attendance Check-In (30s window).
  - Verifiable Digital Certificates with LinkedIn sharing URLs and public `/verify-certificate/:code` portal.
  - Student Dashboard 2.0 with XP bar, Level, badges, and `/leaderboard`.
  - Administrative Analytics with Student Engagement Score (0–100) and department breakdowns.
  - Background Event Reminder Scheduler (`node-cron` every 15 mins).
  - Public Student Digital Portfolio (`/portfolio/:username`) with zero PII leaks.
  - AI Campus Assistant & Recommendation Engine.
  - 5-Star Event Feedback Surveys.
  - OpenAPI 3.0 / Swagger UI documentation at `/api-docs`.
  - Jest / Supertest (25 passing tests) + Vitest / RTL frontend tests (1 passing test).

---

## 2. Current Database Model & Entity Graph
- `College` (id, name, email, address, events, users)
- `User` (id, collegeId, fullName, email, password, department, year, role, xp, level, username, bio, skills[], portfolioPublic, tokens, registrations, certificates)
- `Event` (id, title, description, venue, category, capacity, eventDate, status, collegeId, coordinatorId)
- `Registration` (id, attended, checkinMethod, deviceInfo, eventId, userId, attendanceMarkedAt)
- `Certificate` (id, certificateCode, issueDate, userId, eventId, registrationId)
- `Notification` (id, userId, title, message, type, isRead, link)
- `Announcement` (id, title, content, category, priority)
- `RefreshToken` & `AuthToken` (tokenHash, userId, expiresAt, revoked)
- `EventFeedback` (id, eventId, userId, rating, experience, comments)
- `EventMedia` (id, eventId, mediaUrl, mediaType)

---

## 3. Analysis & V3 Extension Points

| V3 Flagship System | Existing Foundation | Required V3 Extensions |
| :--- | :--- | :--- |
| **1. Multi-Tenant Architecture** | `College` & `collegeId` on User and Event | Upgrade `College` into full `Institution` entity with code, domain, logo, settings, status. Enforce strict tenant isolation middleware (`tenantMiddleware`) on all APIs. |
| **2. Campus Passport** | Basic `/portfolio/:username` with badges | Create full `/passport` and `/passport/:username` with verified skill graph, achievements, verifiable credentials, streak, privacy settings, and QR verification card. |
| **3. Student Skill Graph** | Basic array of string tags `skills[]` | Structured `Skill`, `StudentSkill` (proficiency, score, verification status), and `SkillEvidence` (linked to events, certificates, achievements, assessments). Transparent evidence score calculation. |
| **4. Competency & Achievement Engine** | Basic level badges | Database-backed `Achievement` & `StudentAchievement` engine with configurable criteria, automatic unlock upon event/cert triggers, XP rewards, and notifications. |
| **5. AI Campus Copilot 2.0 & Event Creator** | Simple regex keyword AI assistant & mock matcher | Upgraded context-aware AI assistant leveraging real database context (student skills, registered events, deadlines, achievements) + AI Event Creator Draft generator for Admins/Faculty. |
| **6. Advanced Attendance & Fraud Engine** | 30s HMAC-SHA256 rotating QR | Multi-layered validation + `AttendanceRisk` / `FraudEvent` anomaly detector (flagging rapid invalid attempts, impossible timing, duplicate bursts) with Admin review console. |
| **7. Verifiable Credentials & Recruiter Portal** | Public certificate code lookup | `Credential` model with cryptographic SHA-256 hash, issuer metadata, status (`VALID`, `REVOKED`, `NOT FOUND`), revocation APIs, and `/verify/student/:username` recruiter portal. |
| **8. Institutional Intelligence & Clubs** | Basic engagement score & stats | Deep AI Insights based on real attendance trends, Department KPIs, plus full `Club` / `ClubMember` community lifecycle. |

---

## 4. Problems & Technical Debt Discovered
1. **Tenant Isolation**: Some endpoints currently query all records across colleges rather than scoping strictly to `req.user.collegeId` / `institutionId`.
2. **Skills Verification**: Currently `skills` are stored as raw unverified strings `String[]` without evidence backing.
3. **Certificates vs. Credentials**: Existing certificates lack revocation status and cryptographic proof hashes.
4. **Event Lifecycle**: Currently only simple statuses (`UPCOMING`, `ONGOING`, `COMPLETED`, `CANCELLED`) exist; missing full multi-stage approval workflow (`DRAFT`, `SUBMITTED`, `APPROVED`, `PUBLISHED`, `REGISTRATION`, `LIVE`, `COMPLETED`, `ARCHIVED`).
5. **UI Consistency**: Need unified modern SaaS aesthetics across both student and admin experiences with sleek micro-interactions, dark/light contrast, and clean data visualizations.

---

## 5. Proposed Migration Strategy (Preserve & Extend)
- **Zero-Destructive Schema Extension**: Retain existing `College`, `User`, `Event`, `Registration`, `Certificate` tables and fields. Add new relation fields and models (`Institution`, `Skill`, `StudentSkill`, `SkillEvidence`, `Achievement`, `StudentAchievement`, `Credential`, `AttendanceRisk`, `Club`, `ClubMember`, `NotificationPreference`).
- **Backward Compatibility**: Keep existing endpoints active while layering new v3 endpoints (`/api/passport`, `/api/skills`, `/api/credentials`, `/api/achievements`, `/api/fraud`, `/api/clubs`, `/api/institutions`).
- **Comprehensive Testing**: Retain existing 25 Jest tests + 1 Vitest test, while adding dedicated v3 test suites for tenant isolation, skill evidence calculations, credential revocations, and fraud detection.
