# Information Security Management System (ISMS) Policy
**Calvary Blocker — Calvary Sexual Immorality Blocker Project**
Version: 1.1.0 | Effective: 2026-05-08 | Review: Annually or after material change

---

## 1. Purpose and Scope

This document defines the Information Security Management System (ISMS) for the Calvary Blocker software project. It establishes the security controls, responsibilities, and review processes that govern how the system protects user data, system integrity, and administrative access.

**Scope:** All components of the Calvary Blocker system, including:
- The local Node.js/Express server (`PornBlockerAgent/`)
- The SPA web dashboard (`public/`)
- DNS-level content filtering subsystem
- Audit logging subsystem
- Browser extension (`apps/extension/`)
- Ally/accountability notification subsystem
- The QA automation suite (`packages/qa-automation/`)
- All deployment scripts and infrastructure tooling

**Out of scope:** Third-party services accessed by the user (e.g., external DNS resolvers, Twilio, SMTP providers).

---

## 2. Governing Standards

| Standard | Domain |
|---|---|
| ISO/IEC 27001:2022 | Information Security Management |
| ISO/IEC 27002:2022 | Security Controls (implementation guidance) |
| ISO/IEC 29101:2018 | Privacy Architecture |
| ISO/IEC 25010:2023 | Software Product Quality |
| ISO 9241-210:2019 | Human-Centered Design (Usability) |

---

## 3. Information Security Policy Statement

The Calvary Blocker project is committed to:
- Protecting the confidentiality, integrity, and availability of all system components and user data.
- Operating with full transparency — no hidden data collection, no undisclosed transmission.
- Maintaining audit trails that are tamper-evident and independently verifiable.
- Providing a trustworthy tool for individuals, families, ministries, and schools.

All contributors, maintainers, and deployers of this software are bound by this policy.

---

## 4. Control Domains (ISO/IEC 27001 Annex A Mapping)

### 4.1 Access Control (Annex A.5.15 / A.8.2 — formerly A.9)

| Control | Implementation | Evidence |
|---|---|---|
| Authentication | JWT issued on successful login; `bcrypt` password hashing (cost factor 10+) | `auth.js`, `server.js` |
| Session Management | JWT stored in `sessionStorage`; expires after configurable TTL | `auth.js` |
| Brute-Force Protection | `express-rate-limit` on `/api/login` (max 10 req/15 min) | `server.js` |
| Role-Based Access | Admin vs. read-only roles enforced at API layer | `server.js` route guards |
| Ministry Lockdown | When Ministry Mode is active, settings mutations are cryptographically rejected | `settings.js` |
| NTFS Permissions | `settings.json` write-protected for standard Windows users; requires SYSTEM account | `Deploy-DNSBlocker.ps1` |

**Policy:** Credentials must never be stored in plaintext. Shared passwords are prohibited. Each deployment must generate a unique admin credential during onboarding.

---

### 4.2 Cryptography (Annex A.8.24 — formerly A.10)

| Control | Implementation | Evidence |
|---|---|---|
| Data at Rest | `settings.json` encrypted with AES-256-GCM | `server.js` encryption module |
| Transport Security | All dashboard traffic served over HTTPS/TLS (self-signed cert for local; CA-signed for hosted) | `cert.cer`, `server.js` |
| Log Integrity | `audit.log` uses HMAC-SHA256 append-only chain; broken chain = tamper evidence | Audit subsystem |
| Password Hashing | `bcrypt` with minimum cost factor 10 | `server.js`, `users.json` |

**Policy:** No MD5 or SHA-1 for any security purpose. AES-256 minimum for symmetric encryption. RSA-2048 or ECDSA P-256 minimum for asymmetric operations.

---

### 4.3 Operations Security (Annex A.8 — formerly A.12)

| Control | Implementation | Evidence |
|---|---|---|
| Dependency Management | `pnpm` with lockfile; Dependabot alerts monitored on GitHub | `pnpm-lock.yaml`, `.github/` |
| HTTP Security Headers | `helmet` middleware applied to all responses | `server.js` |
| XSS Prevention | Content Security Policy via helmet; no `innerHTML` from untrusted input | `public/js/` audit |
| CSRF Protection | JWT-based stateless auth eliminates CSRF surface | `auth.js` |
| Process Hardening | Active process monitor terminates proxy browsers (e.g., Tor Browser) every 5 seconds | `PornBlockerAgent/` |
| Vulnerability Scanning | GitHub Dependabot; manual `npm audit` before releases | CI/CD pipeline |

**Policy:** No release shall be published with known HIGH or CRITICAL npm vulnerabilities unmitigated. Moderate vulnerabilities must be documented in the risk register with a remediation timeline.

---

### 4.4 Network Security (Annex A.8.20 — formerly A.13)

| Control | Implementation | Evidence |
|---|---|---|
| DNS Null-Routing | Explicit CDNs and domains resolved to `0.0.0.0` via embedded DNS proxy | `infrastructure/` |
| SafeSearch Enforcement | DNS forced to Google/Bing SafeSearch endpoints | DNS blocklist config |
| VPN Layer | Optional WireGuard VPN blocks circumvention at network layer | `Deploy-LocalVPN.ps1` |
| Application Blocking | Process-level blocking prevents launching blocked applications | App blocklist subsystem |

---

### 4.5 Logging and Monitoring (Annex A.8.15 — formerly A.12.4)

| Control | Implementation | Evidence |
|---|---|---|
| Audit Logging | All auth events, config changes, scan results, bypass attempts logged | `audit.log` |
| Tamper Evidence | HMAC-SHA256 chain; any deletion or modification breaks chain integrity | Audit subsystem |
| Real-Time Review | Logs accessible via admin dashboard Logs tab | `public/js/logs.js` |
| Accountability Alerts | Bypass attempts trigger SMS (Twilio) and email (SMTP) to designated ally | Notification subsystem |
| Retention | Logs retained indefinitely locally; no automatic purge without admin action | Policy default |

---

### 4.6 Incident Management (Annex A.5.24 — formerly A.16)

**Incident Classification:**

| Severity | Examples | Response Time |
|---|---|---|
| Critical | Lockdown disabled without authorization; mass bypass attempt | Immediate — ally notified within 60 seconds |
| High | Repeated failed login attempts; tamper-evidence chain broken | Alert within 5 minutes |
| Medium | Configuration changed outside maintenance window | Log entry + email within 1 hour |
| Low | Single failed login; non-critical scan finding | Log entry; review at next scheduled audit |

**Incident Response Process:**
1. Detection via audit log or automated alert
2. Accountability partner or ministry supervisor notified
3. System state preserved for review (log snapshot)
4. Root cause identified
5. Remediation applied
6. Post-incident entry added to audit log
7. Policy updated if systemic gap identified

---

### 4.7 Privacy and Data Minimization (ISO/IEC 29101)

| Principle | Implementation |
|---|---|
| Data minimization | Only username and hashed password stored; no PII beyond what admin provides |
| Local-first | All data stored locally; no cloud sync unless explicitly enabled by admin |
| No third-party telemetry | Zero analytics, tracking pixels, or usage telemetry |
| Transparency | Full audit log accessible to admin at all times |
| User rights | Admin can delete account and all data via the Account tab |

---

## 5. Human-Centered Design (ISO 9241-210 / ISO 9241-112)

| Principle | Implementation |
|---|---|
| Aesthetic & Visual Hierarchy | Glassmorphism dark-mode UI; navy `#0b0f19` + violet `#8b5cf6` palette |
| Typography | Inter (geometric sans-serif) for legibility at all sizes |
| Feedback | All long operations (scan, save) show animated progress indicators |
| Error Recovery | Auth/config failures shown as inline alerts; never native browser dialogs |
| Accessibility | WCAG 2.1 AA contrast ratios enforced; keyboard-navigable controls |
| Internationalization | Onboarding wizard available in 30+ languages; 195+ country presets |

---

## 6. Software Quality (ISO/IEC 25010)

| Quality Characteristic | Evidence |
|---|---|
| Functional Suitability | 18/18 E2E Playwright tests pass (QA suite) |
| Reliability | Non-blocking try/catch guards; graceful degradation on subsystem failure |
| Security | See Section 4 above |
| Usability | See Section 5 above |
| Maintainability | Modular JS architecture; separation of auth, app, settings, logs |
| Portability | Runs on Windows; VPN and DNS scripts support macOS/Linux variants |

---

## 7. Roles and Responsibilities

| Role | Responsibility |
|---|---|
| Project Maintainer | Owns this policy; approves changes; conducts annual review |
| Ministry Supervisor | Reviews audit logs quarterly; approves Ministry Mode deployments |
| Accountability Ally | Receives bypass and lockdown alerts; provides pastoral accountability |
| End User / Admin | Responsible for keeping credentials secure; reports incidents |
| Contributor | Must follow CONTRIBUTING.md and CODE_OF_CONDUCT.md |

---

## 8. Policy Review

This policy shall be reviewed:
- **Annually** — on or before the effective date anniversary
- **After any material security incident**
- **After any major feature addition** affecting authentication, data handling, or logging

Changes must be committed to the repository with a version bump and dated changelog entry.

---

## 9. Acceptance

By deploying, operating, or contributing to the Calvary Blocker system, you acknowledge that you have read and agree to operate within the bounds of this policy.

---

*Policy Version: 1.1.0 | Effective: 2026-05-08 | Built with faith, for freedom.*
