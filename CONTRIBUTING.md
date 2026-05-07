# Contributing to Calvary Blocker

First off, thank you for considering contributing to Calvary Blocker! It's people like you that make Calvary Blocker such a great tool for digital purity and network safety.

We welcome all contributions, from bug reports to new features, documentation improvements, and architectural advice.

## 🤝 How to Contribute

### 1. Reporting Bugs
This section guides you through submitting a bug report. Following these guidelines helps maintainers and the community understand your report, reproduce the behavior, and find related reports.
- **Use the Issue Tracker**: Submit a bug report via the GitHub issue tracker.
- **Use the Bug Report Template**: Fill out the provided `bug_report.md` template completely.
- **Check for Duplicates**: Before submitting, please check if the issue has already been reported.

### 2. Suggesting Enhancements
This section guides you through submitting an enhancement suggestion, including completely new features and minor improvements to existing functionality.
- **Use the Feature Request Template**: Submit your suggestion using the `feature_request.md` template.
- **Be Descriptive**: Explain how the feature should work, why it's needed, and how it aligns with the vision of Calvary Blocker (ISO compliance, robust security, sleek UX).

### 3. Pull Requests
The process for submitting a Pull Request is as follows:
1. **Fork the repo** and create your branch from `master`.
2. **If you've added code**, add tests. Run `npm run test:smoke` to ensure nothing is broken.
3. **Ensure the test suite passes**. We use Jest for automated testing.
4. **Make sure your code lints** (if applicable).
5. **Issue that PR!**

## 💻 Development Setup

1. Clone your fork of the repository:
   ```bash
   git clone https://github.com/YOUR-USERNAME/calvary-blocker.git
   ```
2. Navigate to the core agent:
   ```bash
   cd calvary-blocker/PornBlockerAgent
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm start
   ```

## 🏗️ Architectural Guidelines

When contributing code, please keep in mind the core architectural pillars:
- **Ministry Mode (ISO 27001)**: Features that affect policy must respect the central "Ministry Mode" lock. No local overrides when locked.
- **Security First**: All new processes must be resilient. No hardcoded credentials. Use HMAC-SHA256 for audit logging where applicable.
- **Aesthetics**: The UI is built on a **Glassmorphism** design language. Please ensure any frontend contributions match the deep navy (`#0b0f19`) and violet (`#8b5cf6`) palette.

Please refer to the `ISO_POLICY.md` for our formal security requirements.

## 📜 Code of Conduct
Please note that this project is released with a Contributor Code of Conduct. By participating in this project you agree to abide by its terms. See `CODE_OF_CONDUCT.md`.

Thank you for contributing to a safer digital world!
