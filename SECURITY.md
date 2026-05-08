# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| Latest (`master`) | ✅ Active development |
| All prior releases | ❌ No security fixes backported |

Calvary Blocker is currently pre-1.0. Only the `master` branch receives security attention.

---

## Reporting a Vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

Report security issues by emailing:

> **security@calvary-blocker.org** *(or open a private GitHub Security Advisory)*

If you do not receive a response within **72 hours**, follow up via a GitHub issue
referencing that you sent a security report.

### What to Include

- A clear description of the vulnerability
- Steps to reproduce (proof of concept if possible)
- The potential impact
- Any suggested mitigations

---

## Disclosure Policy

We follow a **coordinated disclosure** model:

1. You report the issue privately.
2. We acknowledge receipt within **72 hours**.
3. We investigate and develop a fix — target **14 days** for critical, **90 days** for others.
4. We release the fix and credit you (unless you prefer anonymity).
5. You may disclose publicly **90 days** after initial report, regardless of fix status.

We will not pursue legal action against researchers who act in good faith under this policy.

---

## Scope

**In scope:**
- Authentication bypass in `server.js` (JWT, bcrypt, rate limiting)
- DNS filter circumvention in `system/dns.js`
- Audit log tampering in `system/logger.js`
- Settings encryption weaknesses in `system/crypto.js`
- XSS, CSRF, or injection vulnerabilities in the web UI
- Privilege escalation in Ministry or Family Mode enforcement

**Out of scope:**
- Self-signed TLS certificate warnings (by design for local deployment)
- Denial-of-service via resource exhaustion on localhost
- Issues requiring physical machine access (this is local-only software)
- Social engineering attacks

---

## Bug Bounty

There is **no financial bug bounty** at this time. We are a non-profit, faith-based open-source project. We will credit contributors publicly in release notes and the README.

---

## Safe Harbor

We support responsible security research. If you conduct research in good faith:

- We will not pursue civil or criminal action for the research
- We will work with you to understand and resolve the issue
- We will acknowledge your contribution

This safe harbor applies to research conducted under this policy only. It does not extend to attacks on users or production systems.

---

*Built with faith, for freedom.*
