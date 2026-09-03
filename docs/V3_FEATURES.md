# 🌟 CampusConnect v3.0 — Flagship Features Specification

CampusConnect v3.0 transforms college event management into an **AI-Powered Digital Campus Engagement & Credential Platform**.

---

## 1. 🎓 Campus Passport (`/passport` & `/passport/:username`)
- **Digital Academic Identity**: Student bio, department, verified year, level, XP, and streak.
- **Evidence-Based Skills**: Integrated with the Student Skill Graph.
- **Achievements & Badges**: Verified badges with rarity tiers (`LEGENDARY`, `EPIC`, `RARE`, `COMMON`).
- **Verifiable Credentials**: Direct links to cryptographic credentials with 1-click LinkedIn export.
- **Campus Involvement**: Verified event attendance records and club memberships.
- **Zero-PII Public Sharing**: Strictly protects sensitive student data (passwords, emails, phone numbers, tokens).

---

## 2. 🎯 Student Skill Graph (`/skills`)
- **Transparent Evidence-Based Scoring**: Scores are mathematically computed from verified workshops (+15 pts), hackathons (+20 pts), and credentials (+20 pts):
  $$\text{Score} = \min(100, 35 + \text{EvidenceCount} \times 15 + \text{Bonus})$$
- **Proficiency Tiers**: `EXPERT` (90%+), `ADVANCED` (75-89%), `INTERMEDIATE` (55-74%), `BEGINNER` (<55%).
- **Interactive Project Evidence Submission**: Allows students to submit personal capstone and coding assessment proof.

---

## 3. 🏆 Automated Competency & Achievement Engine
- Evaluates student criteria automatically upon event check-in, certificate issuance, or hackathon participation.
- Default Achievements:
  - `FIRST_STEP`: Attended first verified event (+50 XP).
  - `TECH_EXPLORER`: Attended 3 technical workshops across different domains (+100 XP).
  - `HACKATHON_HERO`: Checked into an official campus Hackathon (+150 XP).
  - `CREDENTIAL_HUNTER`: Earned 2+ verified cryptographic credentials (+200 XP).
  - `CAMPUS_LEGEND`: Reached Level 5 with 10+ verified events (+500 XP).

---

## 4. 🧠 AI Campus Copilot 2.0 & AI Event Creator
- **Copilot 2.0 (`/api/ai/copilot`)**: Context-aware academic assistant querying real database records to recommend events, analyze skills, and summarize semester achievements.
- **AI Event Creator (`/api/ai/event-draft`)**: Faculty/admin drafting tool generating comprehensive blueprints (title, description, category, prerequisites, learning outcomes, and proposed agenda).

---

## 5. 🚨 Attendance Fraud & Anomaly Detection Engine (`/admin-fraud`)
- Real-time risk detection monitoring:
  - Rapid failed QR attempts (3+ failures in 2 mins $\rightarrow$ `HIGH` risk, score 85).
  - Duplicate scan bursts.
  - Check-in attempts outside authorized event status.
- Admin Review Console with 1-click resolution actions (`CONFIRM FRAUD` / `DISMISS FLAG`).

---

## 6. 📜 Cryptographic Verifiable Credentials (`/verify/credential/:id`)
- Unique identifier format: `CRED-2026-XXXX-YYYY`.
- SHA-256 integrity hash: `sha256(credentialId + userId + collegeId + issueDate + SECRET)`.
- Public registry lookup with instant status verification (`VALID`, `REVOKED`, `NOT_FOUND`).
- Instant revocation support with administrative audit reason.

---

## 7. 💼 Recruiter Verification Portal (`/verify/student/:username`)
- High-speed, distraction-free candidate verification console for employers.
- Real-time validation of verified competencies, credentials, and institutional accreditation.

---

## 8. 📊 Institutional Intelligence & Clubs Hub
- **Executive Intelligence (`/admin-intelligence`)**: Real AI trend insights, department engagement rates, and capacity utilization metrics.
- **Clubs Hub (`/clubs`)**: Community discovery, membership roles, and leadership tracking.