# Testing Guide
**Calvary Porn Blocker — Calvary Porn Blocker Project**
Version: 2.0.0 | Updated: 2026-05-08

> This guide describes how to run the automated E2E test suite, perform manual smoke checks, and verify ISO compliance through testing.
> For the formal security policy, see [`docs/ISMS_POLICY.md`](./docs/ISMS_POLICY.md).
> For the risk register, see [`docs/RISK_REGISTER.md`](./docs/RISK_REGISTER.md).

---

## 1. Prerequisites

Before running any tests, ensure the following are in place:

```bash
# Install all dependencies (from repo root)
pnpm install

# Start the PornBlockerAgent server (leave running in a separate terminal)
cd PornBlockerAgent
node server.js
```

The server must be running at `https://localhost:3456` before executing any test suite.

**Test fixture credentials:**
- Username: `admin`
- Password: `admin1234`

> ⚠️ **These are test fixture credentials only.** They exist solely so the automated E2E suite
> can authenticate without a live interactive setup. `users.json` is listed in `.gitignore`
> and is **never** committed to the repository.
>
> In production, `users.json` is created during the first-run onboarding wizard and contains
> the admin's chosen credentials. There is no default password shipped with the product.
>
> If you need to run the E2E suite against a fresh server, create a test `users.json` via:
> ```bash
> # From PornBlockerAgent/
> node -e "
>   const bcrypt = require('bcrypt');
>   bcrypt.hash('admin1234', 10).then(h => {
>     const fs = require('fs');
>     fs.writeFileSync('users.json', JSON.stringify({ adminUsername: 'admin', adminHash: h }, null, 2));
>     console.log('Test users.json created.');
>   });
> "
> ```

---

## 2. Automated E2E Test Suite (Playwright)

The primary test suite covers the full 18-step user journey: authentication, dashboard, settings, scan, logs, and account management.

### Run all tests

```bash
# From repo root
pnpm test
```

or equivalently:

```bash
cd packages/qa-automation
pnpm exec playwright test
```

### Run with UI (interactive mode)

```bash
cd packages/qa-automation
pnpm exec playwright test --ui
```

### Run a specific test file

```bash
cd packages/qa-automation
pnpm exec playwright test tests/desktop/app.spec.ts
```

### View the test report

```bash
cd packages/qa-automation
pnpm exec playwright show-report
```

### Expected output (all passing)

```
18 passed (2.2m)
Exit code: 0
```

---

## 3. What the E2E Suite Validates

| Test # | Area | What is Checked |
|---|---|---|
| 01 | Authentication | Login form renders; valid credentials accepted |
| 02 | Dashboard | Dashboard loads after login |
| 03 | Filtering | Filter controls render and respond |
| 04 | Accountability | Ally/partner config section visible |
| 05–13 | Settings | All setting controls (DNS, app block, lockdown, family, ministry, etc.) render |
| 14 | Scanner | Scan trigger is accessible and initiates |
| 15 | Logs | Audit log section renders with entries |
| 16–17 | Account | Profile and recovery fields render |
| 18 | Stability | App is responsive after full journey |

---

## 4. Manual Smoke Check

Run this after any significant code change to verify the UI and key flows manually.

### 4.1 Authentication

1. Open `https://localhost:3456` in Chrome.
2. Confirm the login form renders with Glassmorphism styling (dark navy + violet).
3. Submit incorrect credentials → verify inline error message appears (no native browser alert).
4. Submit correct credentials → verify redirect to dashboard.
5. Reload the page → verify dashboard remains (session persists via `sessionStorage`).

### 4.2 Filtering Controls

1. Navigate to the **Filtering** tab.
2. Verify filter level selector or toggle is visible and operable.
3. Toggle family mode and ministry mode → verify state is saved.

### 4.3 Lockdown Mode

1. Navigate to **Settings**.
2. Toggle Lockdown Mode → verify the UI reflects the locked state.
3. Attempt to change a locked setting → verify the change is rejected (Ministry Mode).

### 4.4 Audit Log

1. Navigate to the **Logs** tab.
2. Verify log entries are present and timestamped.
3. Confirm the HMAC chain indicator shows as valid (not broken).

### 4.5 Account Management

1. Navigate to the **Account** tab.
2. Verify profile fields (username, email) render.
3. Verify password change fields and recovery options are present.

---

## 5. ISO 27001 Compliance Verification Checklist

Run these checks before any production deployment.

| Control | Verification Method | Pass Criteria |
|---|---|---|
| A.5.15 — Access Control | Run E2E suite test 01; attempt unauthenticated API call | 401 returned; login required |
| A.8.15 — Audit Logging | Navigate to Logs tab after E2E run | Entries present; chain intact |
| A.8.24 — Cryptography | Inspect `settings.json` on disk | File is encrypted (not plaintext JSON) |
| A.8.20 — Network Security | Attempt to resolve a blocked domain | DNS returns `0.0.0.0` |
| A.5.24 — Incident Management | Trigger a failed login × 11 | Rate limiter returns 429; ally notified |
| ISO 25010 — Software Quality | Run full E2E suite | 18/18 pass, exit code 0 |

---

## 6. Recommended Additional Testing (Roadmap)

These tests are planned but not yet automated:

| Area | Method | Priority |
|---|---|---|
| **DNS load testing** | Simulate 10,000 queries/sec against embedded proxy | HIGH |
| **JWT penetration** | Test token expiry enforcement and replay attacks | HIGH |
| **Process rename bypass** | Rename Tor Browser binary; confirm process monitor catches it | HIGH |
| **Cross-browser UI** | Run Playwright suite against Firefox and WebKit | MEDIUM |
| **Chaos / crash recovery** | Kill the Node.js process; confirm OS service restarts it cleanly | MEDIUM |
| **DNS-over-HTTPS bypass** | Test DoH resolver override; verify VPN layer intercepts | MEDIUM |

---

*Testing Guide Version: 2.0.0 | Built with faith, for freedom.*
