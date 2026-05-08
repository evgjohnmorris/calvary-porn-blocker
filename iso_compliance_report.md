# ISO/IEC 27001 Alignment Summary

**Calvary Porn Blocker — Calvary Porn Blocker Project**
Version: 2.2.0 | Updated: 2026-05-08

> ⚠️ **This project is ISO 27001-aligned, not certified.**
> Controls are implemented with reference to ISO/IEC 27001:2022 principles.
> No formal certification audit has been conducted. Some controls have open
> remediation items. See the Outstanding Actions table below.

---

## Overview

This document provides a concise executive summary of the Calvary Porn Blocker project's security
posture as it relates to ISO/IEC 27001:2022. It is intended for ministry supervisors, pastoral
leadership, and technical stakeholders. The language used reflects actual implementation status
and does not imply certification.

For full detail, see:
- **[`docs/ISMS_POLICY.md`](./docs/ISMS_POLICY.md)** — Complete ISMS policy with control-by-control implementation mapping
- **[`docs/RISK_REGISTER.md`](./docs/RISK_REGISTER.md)** — Full risk register with likelihood/impact scoring and residual risk

---

## Control Alignment Status

| ISO/IEC 27001:2022 Domain | Status | Notes |
|---|---|---|
| A.5.15 — Access Control | 🔵 Aligned | JWT auth, bcrypt, rate limiting, NTFS ACL. JWT stored in `httpOnly` `Secure` cookie (migrated from `sessionStorage` in v2.2.0). CSRF double-submit protection on all mutating API routes. |
| A.8.2 — Privileged Access | 🔵 Aligned | SYSTEM account enforcement; Ministry Mode lock |
| A.8.24 — Cryptography | 🔵 Aligned | AES-256-GCM at rest; HTTPS/TLS in transit (self-signed in dev) |
| A.8.15 — Logging & Monitoring | 🔵 Aligned | HMAC-SHA256 audit chain; designed for tamper-evidence |
| A.8.20 — Network Security | 🔵 Aligned | DNS null-routing; VPN layer; process monitor; CSP headers now enabled |
| A.5.24 — Incident Management | 🔵 Aligned | Dual-channel ally alerts (SMS + email) |
| A.8.8 — Vulnerability Management | 🟡 In Progress | 16 Dependabot alerts open — tracked and being resolved |
| A.8.13 — Information Backup | 🟡 In Progress | Manual only; automated backup not yet implemented |

**Status key:**
- 🔵 **Aligned** — Control is implemented with reference to the ISO principle. Not certified.
- 🟡 **In Progress** — Partial implementation; open remediation items exist.
- 🔴 **Gap** — Control not yet implemented.

**ISO/IEC 29101 — Privacy Architecture:** 🔵 Local-first; no cloud telemetry; full admin data control.

**ISO/IEC 25010 — Software Quality:** 🔵 18/18 Playwright E2E tests passing (exit code 0).

**ISO 9241-210 — Human-Centered Design:** 🔵 Glassmorphism UI; WCAG 2.1 AA contrast target; 30+ language onboarding.

---

## Outstanding Actions

| Priority | Action | Owner |
|---|---|---|
| 🔴 HIGH | Resolve 16 Dependabot vulnerabilities (4 high, 9 moderate, 3 low) | Maintainer |
| 🔴 HIGH | Implement DNS-over-HTTPS interception to close DNS bypass gap | Maintainer |
| 🟡 MEDIUM | Add automated `settings.json` backup on each save | Maintainer |
| 🟡 MEDIUM | Add push notification as tertiary ally alert channel | Maintainer |
| 🟡 MEDIUM | Remove security-question recovery path (replace with recovery key only) | Maintainer |
| 🟢 LOW | Replace self-signed TLS cert with mkcert / Let's Encrypt in production | Maintainer |

---

## Review Schedule

| Review Type | Frequency | Responsible Party |
|---|---|---|
| Audit log review | Monthly | Ministry Supervisor |
| Risk register review | Quarterly | Project Maintainer |
| Full ISMS review | Annually | Project Maintainer |
| Security incident review | As needed | Maintainer + Ministry Supervisor |

---

*Alignment Summary Version: 2.2.0 | Built with faith, for freedom.*
