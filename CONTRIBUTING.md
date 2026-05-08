# Contributing to Calvary Blocker

First off, thank you for considering contributing to Calvary Blocker. This tool exists to help people break free from pornography addiction and protect families, ministries, and schools. Every contribution — from bug reports to features to documentation — matters.

---

## 🤝 How to Contribute

### 1. Reporting Bugs

- **Use the Issue Tracker**: Submit a bug report via the GitHub issue tracker.
- **Be specific**: Include steps to reproduce, expected vs. actual behavior, OS/browser version, and any relevant log output from `audit.log` or the Logs tab.
- **Check for duplicates**: Search existing issues before opening a new one.

### 2. Suggesting Enhancements

- **Open a Feature Request**: Describe the feature, the problem it solves, and how it aligns with the project mission (ISO security compliance, robust filtering, premium UX, faith-based accountability).
- **Be realistic**: Features must align with the local-first, privacy-preserving architecture.

### 3. Pull Requests

1. **Fork the repo** and create your branch from `master`.
2. **Write tests** for any new behavior. The test suite uses **Playwright** — add your test to `packages/qa-automation/tests/desktop/app.spec.ts`.
3. **Run the full test suite** before submitting:
   ```bash
   pnpm install
   pnpm test
   ```
   All **18 tests must pass** (exit code 0) before a PR will be reviewed.
4. **Lint your code** where applicable.
5. **Open the PR** with a clear description of what changed and why.

---

## 💻 Development Setup

```bash
# 1. Clone the repository
git clone https://github.com/evgjohnmorris/calvary-porn-blocker.git
cd calvary-porn-blocker

# 2. Install all workspace dependencies
pnpm install

# 3. Start the core agent server (leave running)
cd PornBlockerAgent
node server.js

# 4. In a separate terminal — run the E2E test suite
cd packages/qa-automation
pnpm exec playwright test
```

The dashboard will be available at `https://localhost:3456`.

**Default test credentials:**
- Username: `admin`
- Password: `admin1234`

> ⚠️ Change the default password immediately in any non-test deployment.

---

## 🏗️ Architectural Guidelines

When contributing code, keep these pillars in mind:

### Security First (ISO/IEC 27001)
- No hardcoded credentials anywhere in the codebase.
- All config must be encrypted at rest (AES-256-GCM).
- All audit-relevant events must be written to `audit.log` via the HMAC chain.
- JWT authentication is required for all `/api/` endpoints. Do not add unguarded routes.
- See [`docs/ISMS_POLICY.md`](./docs/ISMS_POLICY.md) for the full security policy.
- See [`docs/RISK_REGISTER.md`](./docs/RISK_REGISTER.md) for known risks and open mitigations.

### Ministry Mode Integrity
- Features that affect policy settings must respect the Ministry Mode lock.
- No local admin override is permitted when Ministry Mode is active.
- Any bypass attempt must trigger an ally notification and an audit log entry.

### Aesthetics (ISO 9241-112)
- The UI uses a **Glassmorphism** design language.
- Color palette: deep navy `#0b0f19` + violet `#8b5cf6` dark mode.
- Typography: **Inter** font family.
- All new UI components must maintain WCAG 2.1 AA contrast ratios.

### Testing
- All new backend behavior requires a corresponding Playwright E2E test.
- All new UI controls must be reachable and verifiable via `page.locator()`.
- Use `sessionStorage` (key: `calvary_jwt`) for JWT injection in test setup — not `localStorage`.

---

## 📦 Dependency Policy

- Use `pnpm` for all dependency management.
- No new dependencies with known HIGH or CRITICAL vulnerabilities may be introduced.
- All new dependencies must be justified in the PR description.
- Run `npm audit` and review the output before submitting.

---

## 📜 Code of Conduct

This project is released with a Contributor [Code of Conduct](./CODE_OF_CONDUCT.md). By participating you agree to abide by its terms. Interactions must reflect Christian principles of love, respect, and grace.

---

Thank you for contributing to a safer digital world. *Built with faith, for freedom.*
