# 🛡️ CampusConnect Security Architecture & Threat Model

CampusConnect v3.0 enforces enterprise-grade security across authentication, authorization, multi-tenancy, cryptography, and attendance verification.

---

## 1. Authentication & Token Lifecycle
- **Dual-Token Architecture**:
  - Short-lived Access Tokens (**15 minutes**) sent in `Authorization: Bearer <token>` header.
  - Long-lived Refresh Tokens (**7 days**) stored in secure, `HttpOnly`, `SameSite=Strict` cookies.
- **Silent Token Rotation**: Every refresh cycle revokes the previous refresh token and writes a new hashed token to the database.
- **Account Lockout Protection**: 5 consecutive failed login attempts automatically trigger a 15-minute temporary lockout.
- **Global Session Revocation**: Incrementing `tokenVersion` on password reset or `/api/auth/logout-all` terminates all active sessions across devices.

---

## 2. Multi-Tenant Isolation
- **Tenant Middleware (`tenantMiddleware.js`)**: All database operations scope strictly to `req.user.collegeId`.
- **Cross-Tenant Access Defense**: Verified by automated test suites ensuring Tenant A students/admins cannot access Tenant B events, credentials, or student records.
- **Super-Admin Granularity**: Global management strictly isolated to the `SUPER_ADMIN` role.

---

## 3. Cryptographic Verifiable Credentials
- **SHA-256 Proof Generation**:
  $$\text{Hash} = \text{SHA256}(\text{credentialId} : \text{userId} : \text{collegeId} : \text{timestamp} : \text{SECRET})$$
- **Tamper-Proof Verification**: Any modification to certificate parameters invalidates the hash during registry verification.
- **Revocation Audit**: Revoked credentials preserve the administrative reason and timestamp.

---

## 4. Rotating HMAC-SHA256 Attendance Security
- **30-Second Dynamic Windows**: QR tokens expire within 30 seconds to prevent screenshot sharing.
- **Layered Validation**:
  1. Token HMAC verification
  2. Timestamp window validation
  3. Event status verification
  4. Student registration check
  5. Attendance duplication check
- **Anomaly Detection**: Repeated failed scans are flagged in the Admin Fraud Console with risk scores (0–100).