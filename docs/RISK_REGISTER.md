# Risk Register
**Calvary Porn Blocker — Calvary Porn Blocker Project**
Version: 1.1.0 | Effective: 2026-05-08 | Owner: Project Maintainer

---

## How to Read This Register

| Column | Description |
|---|---|
| **ID** | Unique risk identifier |
| **Domain** | ISO/IEC 27001 Annex A domain |
| **Risk** | Description of the threat and its potential impact |
| **Likelihood** | 1 (Rare) → 5 (Almost Certain) |
| **Impact** | 1 (Negligible) → 5 (Critical) |
| **Raw Score** | Likelihood × Impact (before controls) |
| **Controls** | Mitigations currently in place |
| **Residual Score** | Likelihood × Impact (after controls) |
| **Status** | Open / Mitigated / Accepted / Transferred |

> **Risk Appetite:** Residual scores of 1–6 are accepted. Scores of 7–12 require documented mitigation plans. Scores of 13+ require immediate remediation before production deployment.

---

## Risk Register

### R-001 — Credential Brute Force Attack
| Field | Value |
|---|---|
| **Domain** | A.5.15 Access Control |
| **Risk** | An attacker makes repeated login attempts to guess the admin password, gaining full control of the filtering system and potentially disabling all protections. |
| **Likelihood** | 3 |
| **Impact** | 5 |
| **Raw Score** | 15 (CRITICAL) |
| **Controls** | `express-rate-limit` (10 req/15 min); bcrypt (cost 10+); JWT expiry; lockout on repeated failure |
| **Residual Score** | 4 (LOW) |
| **Status** | Mitigated |
| **Evidence** | `server.js` rate limiter config; `auth.js` bcrypt validation |

---

### R-002 — JWT Token Theft via XSS
| Field | Value |
|---|---|
| **Domain** | A.8.24 Cryptography / A.8.2 Access Control |
| **Risk** | A cross-site scripting vulnerability allows an attacker to steal the JWT from session storage, impersonating the admin and disabling filters. |
| **Likelihood** | 2 |
| **Impact** | 5 |
| **Raw Score** | 10 (HIGH) |
| **Controls** | **JWT migrated to `httpOnly` Secure cookie (v2.2.0)** — eliminates XSS token theft entirely; `helmet` CSP headers; no `innerHTML` from user input; HTTPS enforced |
| **Residual Score** | 2 (LOW) |
| **Status** | ✅ Mitigated (closed v2.2.0) |
| **Evidence** | `middleware/auth.js` httpOnly cookie; `routes/auth.js`; `middleware/csrf.js` Double-Submit Cookie CSRF protection |

---

### R-003 — Settings File Tampering (NTFS Bypass)
| Field | Value |
|---|---|
| **Domain** | A.8.3 Information Classification |
| **Risk** | A local user with elevated Windows privileges modifies `settings.json` directly on disk, bypassing the application layer and disabling content filters without logging. |
| **Likelihood** | 3 |
| **Impact** | 4 |
| **Raw Score** | 12 (HIGH) |
| **Controls** | AES-256-GCM encryption of `settings.json`; NTFS ACL restricts write to SYSTEM account; Ministry Mode rejects unsigned config |
| **Residual Score** | 4 (LOW) |
| **Status** | Mitigated |
| **Evidence** | `Deploy-DNSBlocker.ps1` NTFS config; encryption module in `server.js` |

---

### R-004 — Audit Log Tampering or Deletion
| Field | Value |
|---|---|
| **Domain** | A.8.15 Logging and Monitoring |
| **Risk** | A user deletes or modifies `audit.log` to conceal bypass attempts or prohibited activity, destroying accountability evidence. |
| **Likelihood** | 3 |
| **Impact** | 4 |
| **Raw Score** | 12 (HIGH) |
| **Controls** | HMAC-SHA256 append-only chain; broken chain detected and alerted on next read; ally notified of `LOG_TAMPER_DETECTED` event |
| **Residual Score** | 3 (LOW) |
| **Status** | Mitigated |
| **Evidence** | Audit subsystem; `audit.log` chain verification logic |

---

### R-005 — DNS Circumvention via Alternative Resolver
| Field | Value |
|---|---|
| **Domain** | A.8.20 Network Security |
| **Risk** | User manually changes DNS settings to a public resolver (e.g., 8.8.8.8), bypassing the embedded DNS proxy and regaining access to blocked content. |
| **Likelihood** | 4 |
| **Impact** | 4 |
| **Raw Score** | 16 (CRITICAL) |
| **Controls** | Three-layer DoH mitigation (v2.4.0): **Layer 1** — Windows Firewall outbound TCP+UDP/443 block to 30+ known DoH provider IPs (`system/doh-block.ps1`); **Layer 2** — DNS sinkhole answers 35+ DoH provider hostnames with `0.0.0.0` in the local resolver (`system/dns-server.js` `DOH_SINKHOLE_DOMAINS`); **Layer 3** — Browser Group Policy registry keys disable DoH in Chrome, Edge, Firefox, Brave. Re-applied automatically on filter level change and lockdown activation via `applyDoHBlock()`. |
| **Residual Score** | 3 (LOW) — A highly determined attacker using an unknown/private DoH provider IP not in the block list could still bypass. VPN circumvention (R-006) remains a separate risk. |
| **Status** | ✅ Mitigated (v2.4.0) |
| **Evidence** | `system/doh-block.ps1`; `system/dns-server.js` `DOH_SINKHOLE_DOMAINS`; `system/dns.js` `applyDoHBlock()`; `routes/settings.js` runtime re-apply |

---

### R-006 — Proxy/VPN Browser Circumvention (e.g., Tor Browser)
| Field | Value |
|---|---|
| **Domain** | A.8.20 Network Security |
| **Risk** | User installs Tor Browser or a VPN client to route traffic outside the filtering layer, bypassing all content controls. |
| **Likelihood** | 3 |
| **Impact** | 4 |
| **Raw Score** | 12 (HIGH) |
| **Controls** | Active process monitor (5-second polling) terminates known proxy browsers; application block list; ally notified on `BYPASS_ATTEMPT_DETECTED` |
| **Residual Score** | 6 (MEDIUM) |
| **Status** | ✅ Mitigated |
| **Open Action** | None |
| **Evidence** | Process monitor in `PornBlockerAgent/`; app blocking subsystem |

---

### R-007 — Dependency Vulnerability (Supply Chain Attack)
| Field | Value |
|---|---|
| **Domain** | A.8.8 Management of Technical Vulnerabilities |
| **Risk** | A malicious or vulnerable npm package introduces a security flaw into the application, compromising the server or exposing user data. |
| **Likelihood** | 2 |
| **Impact** | 4 |
| **Raw Score** | 8 (HIGH) |
| **Controls** | `pnpm` lockfile pins exact versions; Dependabot alerts monitored; `npm audit --omit=dev --audit-level=high` enforced in CI (no `continue-on-error`) |
| **Residual Score** | 3 (LOW) |
| **Status** | ✅ Mitigated — Production agent (PornBlockerAgent) has **0** high/critical vulnerabilities as of v2.3.0 |
| **Formal Risk Acceptance** | 52 Dependabot alerts exist in `packages/qa-automation` (Appium/Playwright transitive **dev** deps). These affect the automated test harness only — they are never shipped, never executed in production, and have no path to the running agent. Risk formally accepted 2026-05-08 by Project Maintainer. Remediation tracked as R-007-ACT. |
| **Evidence** | CI audit step (`ci.yml`); `npm audit` output: 0 production vulns; GitHub Dependabot alerts scoped to qa-automation workspace |

---

### R-008 — Unauthorized Account Creation
| Field | Value |
|---|---|
| **Domain** | A.5.15 Access Control |
| **Risk** | A user creates an additional admin account to regain access after the primary account is locked, circumventing accountability controls. |
| **Likelihood** | 2 |
| **Impact** | 4 |
| **Raw Score** | 8 (HIGH) |
| **Controls** | Account creation requires current admin JWT; Ministry Mode disables self-service account management |
| **Residual Score** | 3 (LOW) |
| **Status** | Mitigated |
| **Evidence** | `server.js` account creation guard; Ministry Mode policy enforcement |

---

### R-009 — Data Loss / Settings Corruption
| Field | Value |
|---|---|
| **Domain** | A.8.13 Information Backup |
| **Risk** | `settings.json` or `users.json` becomes corrupted or lost, causing the system to lose all configuration and credentials, requiring reinstallation. |
| **Likelihood** | 2 |
| **Impact** | 3 |
| **Raw Score** | 6 (MEDIUM) |
| **Controls** | Atomic write pattern for settings saves; onboarding wizard recreates baseline on corruption detection |
| **Residual Score** | 3 (LOW) |
| **Status** | Accepted |
| **Open Action** | Implement automated local backup of `settings.json` on each save |
| **Evidence** | Settings write logic in `server.js` |

---

### R-010 — Notification Delivery Failure (Ally Alert Gap)
| Field | Value |
|---|---|
| **Domain** | A.5.24 Incident Management |
| **Risk** | SMS or email alert to accountability ally fails (e.g., Twilio outage, misconfigured SMTP) during a bypass event, leaving the ally unaware. |
| **Likelihood** | 2 |
| **Impact** | 3 |
| **Raw Score** | 6 (MEDIUM) |
| **Controls** | Dual-channel notification (SMS + email); delivery failure logged in `audit.log`; admin UI shows notification status |
| **Residual Score** | 3 (LOW) |
| **Status** | Accepted |
| **Open Action** | Add push notification as tertiary channel; implement retry-with-backoff for failed deliveries |
| **Evidence** | Notification subsystem; audit log delivery events |

---

### R-011 — Self-Signed TLS Certificate (Local Trust Issues)
| Field | Value |
|---|---|
| **Domain** | A.8.24 Cryptography |
| **Risk** | The self-signed certificate (`cert.cer`) triggers browser security warnings, leading users to accept or bypass certificate errors habitually, weakening their security posture. |
| **Likelihood** | 3 |
| **Impact** | 2 |
| **Raw Score** | 6 (MEDIUM) |
| **Controls** | Self-signed cert generated at runtime by `selfsigned` library (never committed to git as of v2.3.0); onboarding wizard guides user through trust; cert pinned to localhost only |
| **Residual Score** | 3 (LOW) |
| **Status** | Accepted |
| **Open Action** | Investigate `mkcert` for development and LetsEncrypt/ACME for hosted deployments to eliminate self-signed certs |
| **Evidence** | `server.js` selfsigned generation; `.gitignore` excludes `cert.cer` |

---

## Open Actions Summary

| Action ID | Risk | Action | Priority | Status |
|---|---|---|---|---|
| R-002-ACT | JWT Token Theft | ~~Migrate JWT from `sessionStorage` to `httpOnly` cookie~~ | HIGH | ✅ **Closed v2.2.0** |
| R-005-ACT | DNS Circumvention | Implement DNS-over-HTTPS interception | HIGH | Open |
| R-006-ACT | Proxy Circumvention | Expand process blocklist with hash-based detection | HIGH | Open |
| R-007-ACT | Supply Chain (QA) | Upgrade or remove Appium/Playwright transitive dev deps causing 52 Dependabot alerts in `packages/qa-automation` | MEDIUM | Open — formally accepted, no production impact |
| R-009-ACT | Data Loss | Implement automated backup of `settings.json` | MEDIUM | Open |
| R-010-ACT | Ally Alert Gap | Add push notification channel + delivery retry logic | MEDIUM | Open |
| R-011-ACT | TLS Certificate | Evaluate `mkcert` / LetsEncrypt for cert management | LOW | Open |

---

## Review History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0.0 | 2026-05-08 | Project Maintainer | Initial risk register created |
| 1.1.0 | 2026-05-08 | Project Maintainer | Close R-002-ACT (httpOnly cookie shipped v2.2.0); formally accept R-007 QA dev-dep alerts (0 production vulns); update R-011 (cert.cer removed from git); correct stale Open Actions table |

---

*Risk Register Version: 1.1.0 | Built with faith, for freedom.*
