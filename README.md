<div align="center">
  <img src="https://raw.githubusercontent.com/evgjohnmorris/calvary-blocker/master/apps/browser-ext/src/assets/hero.png" width="140" alt="Calvary Blocker Logo" />
  <h1>🛡️ Calvary Sexual Immorality Blocker</h1>
  <p><strong>A Ministry-Grade, ISO 27001 Compliant Ecosystem for Pure, Uncompromised Internet Access</strong></p>

  <p>
    <a href="https://github.com/evgjohnmorris/calvary-blocker/actions/workflows/ci.yml">
      <img src="https://github.com/evgjohnmorris/calvary-blocker/actions/workflows/ci.yml/badge.svg" alt="CI Status" />
    </a>
    <a href="https://opensource.org/licenses/MIT">
      <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square" alt="License: MIT" />
    </a>
    <a href="https://github.com/evgjohnmorris/calvary-blocker/issues">
      <img src="https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat-square" alt="Contributions Welcome" />
    </a>
    <a href="https://github.com/evgjohnmorris/calvary-blocker/pulls">
      <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square" alt="PRs Welcome" />
    </a>
  </p>
</div>

---

## 🌟 The Vision: Absolute Purity, Zero Compromise

**Calvary Blocker** is an aggressively engineered, beautifully designed, multi-platform system built to eradicate illicit content from digital environments. Going far beyond traditional browser extensions, this architecture employs deeply integrated **local DNS proxying**, **real-time background process termination**, and **tamper-evident cryptographic security** to ensure absolute compliance and peace of mind.

Whether you're deploying this in a household to protect your family or securing infrastructure at an institutional level (**Ministry Mode**), Calvary Blocker provides uncompromising defense paired with a premium, sleek user experience.

---

## ✨ Features that Set Us Apart

### 🔒 Ministry-Grade Security (ISO 27001 & ISO 9241 Compliant)
- **Ministry Mode Lockdown:** Cryptographically signed centralized policies that reject unauthenticated local overrides. Once it's locked, it's locked.
- **Tamper-Evident Audits:** A strict HMAC-SHA256 append-only logging chain guarantees that all configuration changes, overrides, and administrative actions are permanently and provably recorded.
- **JWT Authentication:** Strict authorization enforcement for all dashboard and API operations.

### 🌐 Universal Network Defense
- **Embedded DNS Proxy:** Automatically intercepts resolving requests, dynamically null-routing explicit domains and highly-evasive CDNs (such as Reddit Media networks: `i.redd.it`, `v.redd.it`) to `0.0.0.0` at the OS layer.
- **Active Process Interdiction:** The background scanner actively monitors and terminates circumvention tools (like the Tor Browser proxy daemon) in real-time, shutting down backdoors before they open.

### 🔍 Deep System Scanner & Sanitization
- Not just a network filter—the internal scanner hunts for local illicit files, flags compromised Wi-Fi networks, and deeply sanitizes explicit browser histories.
- **Remediation 1-Click Dashboard:** Quarantine files, purge histories, and manage subscription cancellations natively from the sleek UI.

### 💎 Gorgeous, Premium Interface
- Featuring an ultra-modern **Glassmorphism** design architecture.
- Deep navy (`#0b0f19`) and violet (`#8b5cf6`) high-contrast themes optimized to reduce eye strain, complete with sophisticated micro-animations, gradients, and professional typography.

---

## 🏗️ System Architecture

Calvary Blocker is built as a highly modular monorepo containing everything from the core engine to the browser extensions and mobile clients.

- `apps/` - Final compiled applications (Browser Extension, Desktop Client, Mobile Client)
- `packages/` - Shared computational libraries (Core Engine, ML Vision API)
- `PornBlockerAgent/` - The Node.js embedded DNS server and background scanner daemon
- `infrastructure/` - Deployment and networking pipelines

---

## 🚀 Quick Start Guide

Get the core server up and running in seconds. Ensure you have [Node.js](https://nodejs.org/) installed:

```bash
# 1. Clone the repository
git clone https://github.com/evgjohnmorris/calvary-blocker.git
cd calvary-blocker/PornBlockerAgent

# 2. Install the backend dependencies
npm install

# 3. Start the embedded DNS & background proxy scanner
npm start
```

Navigate to `http://127.0.0.1:3000` to access the Glassmorphism Dashboard and authenticate to customize your network policies.

---

## 🤝 Open for Contributions

We strongly believe in community collaboration to build the ultimate safety ecosystem. **This project is fully open source and public contributions are warmly welcomed!** 

### How you can help:
1. **Fork the Repository** and branch off `master`.
2. **Improve the Engine**: Add new blocklist sources, improve our Tor-termination logic, or optimize the ML-Vision package.
3. **Enhance the UI**: Help us push the boundaries of our sleek, Glassmorphism aesthetic.
4. **Submit a PR**: Make sure your code passes our CI suite (`npm run test:smoke` and `npm run lint`).

Please refer to our [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines, and review our [ISO_POLICY.md](./ISO_POLICY.md) for architectural and compliance constraints. We also enforce a welcoming [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).

---

## 📄 License & Compliance

Calvary Sexual Immorality Blocker is open-source and released under the [MIT License](./LICENSE). 

The architectural designs comply with **ISO/IEC 27001** for Information Security and **ISO 9241** for Ergonomic User Interaction. See our `ISO_POLICY.md` for full formal policy definitions.

