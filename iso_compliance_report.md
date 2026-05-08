# ISO/IEC 27001 Compliance Summary
**Calvary Blocker — Calvary Sexual Immorality Blocker Project**
Version: 2.0.0 | Updated: 2026-05-08

---

## Overview

This document provides a concise executive summary of the Calvary Blocker project's compliance posture against ISO/IEC 27001:2022. It is intended as a high-level overview for ministry supervisors, pastoral leadership, and technical stakeholders.

For full detail, see:
- **[`docs/ISMS_POLICY.md`](./docs/ISMS_POLICY.md)** — Complete ISMS policy with control-by-control implementation mapping
- **[`docs/RISK_REGISTER.md`](./docs/RISK_REGISTER.md)** — Full risk register with likelihood/impact scoring and residual risk

---

## Compliance Status Summary

| ISO/IEC 27001:2022 Domain | Status | Notes |
|---|---|---|
| A.5.15 — Access Control | ✅ Implemented | JWT auth, bcrypt, rate limiting, NTFS ACL |
| A.8.2 — Privileged Access | ✅ Implemented | SYSTEM account enforcement; Ministry Mode lock |
| A.8.24 — Cryptography | ✅ Implemented | AES-256-GCM at rest; HTTPS/TLS in transit |
| A.8.15 — Logging & Monitoring | ✅ Implemented | HMAC-SHA256 audit chain; tamper-evident |
| A.8.20 — Network Security | ✅ Implemented | DNS null-routing; VPN layer; process monitor |
| A.5.24 — Incident Management | ✅ Implemented | Dual-channel ally alerts (SMS + email) |
| A.8.8 — Vulnerability Management | 🟡 Partial | 16 Dependabot alerts open — resolve before release |
| A.8.13 — Information Backup | 🟡 Partial | Manual only; automated backup not yet implemented |

**ISO/IEC 29101 — Privacy Architecture:** ✅ Local-first; no cloud telemetry; full admin data control.

**ISO/IEC 25010 — Software Quality:** ✅ 18/18 Playwright E2E tests passing (exit code 0).

**ISO 9241-210 — Human-Centered Design:** ✅ Glassmorphism UI; WCAG 2.1 AA contrast; 30+ language onboarding.

---

## Outstanding Actions Before Full Compliance

| Priority | Action | Owner |
|---|---|---|
| 🔴 HIGH | Resolve 16 Dependabot vulnerabilities (4 high, 9 moderate, 3 low) | Maintainer |
| 🔴 HIGH | Migrate JWT from `sessionStorage` to `httpOnly` cookie | Maintainer |
| 🔴 HIGH | Implement DNS-over-HTTPS interception to close DNS bypass gap | Maintainer |
| 🟡 MEDIUM | Add automated `settings.json` backup on each save | Maintainer |
| 🟡 MEDIUM | Add push notification as tertiary ally alert channel | Maintainer |
| 🟢 LOW | Evaluate `mkcert` / LetsEncrypt to replace self-signed TLS cert | Maintainer |

---

## Review Schedule

| Review Type | Frequency | Responsible Party |
|---|---|---|
| Audit log review | Monthly | Ministry Supervisor |
| Risk register review | Quarterly | Project Maintainer |
| Full ISMS review | Annually | Project Maintainer |
| Security incident review | As needed | Maintainer + Ministry Supervisor |

---

*Compliance Summary Version: 2.0.0 | Built with faith, for freedom.*
