<div align="center">

<img src="./assets/hero-banner.svg" alt="Calvary Porn Blocker" width="100%" style="border-radius: 16px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2); margin-bottom: 24px;" />

# 🛡️ Calvary Porn Blocker

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge&color=09090b)](#)
[![Privacy First](https://img.shields.io/badge/Privacy-100%25%20Local-success.svg?style=for-the-badge&color=10b981)](#)
[![Platform: Windows](https://img.shields.io/badge/Platform-Windows-0078d7.svg?style=for-the-badge&color=0078d7)](#)
[![ISO 27001 Ready](https://img.shields.io/badge/Compliance-ISO_27001-purple.svg?style=for-the-badge)](#)

<br/>

> **A free, open-source content filter built for individuals, families, ministries, and schools — designed to help people break free from pornography addiction and protect those they love.**

<br/>

[**⬇️ Download for Windows**](#-download--installation) &nbsp; | &nbsp; [**📖 Read Documentation**](#-getting-started) &nbsp; | &nbsp; [**💬 Join Community**](#-community--support)

</div>

<br/>

## 📖 The Vision

In a world where platforms use dark-pattern design to keep users engaged and addicted, **Calvary Porn Blocker** stands as a tool for freedom. We believe that technology should serve people, not enslave them. 

Pornography addiction is a widespread crisis that damages relationships, exploits the vulnerable, and corrupts the mind. This project exists to provide a ministry-grade, ISO-compliant safety net that enforces purity and accountability through uncompromised engineering.

<details>
<summary><kbd>✨ Click to read more about our core mission</kbd></summary>
<br>

From a Christian perspective, pornography is spiritually destructive. It corrupts the mind, damages families, and pulls people away from purity, truth, and faithfulness. People need both practical tools and spiritual support: accountability, honest community, content blockers, mentorship, counseling, and the Gospel. Recovery requires both truth and action.

> *"Flee from sexual immorality."* — 1 Corinthians 6:18

</details>

---

## ⚡ Download & Installation

Calvary Porn Blocker is designed to run everywhere you need protection. 

<div align="center">

| Platform | Status | Download Link | Instructions |
| :---: | :---: | :--- | :--- |
| **Windows** | 🟢 Active | [**Download .exe (v1.0.0)**](#) | Run installer & deploy via PowerShell |
| **macOS** | 🟡 Beta | [**Download .dmg (v1.0.0-beta)**](#) | Mount image & install to Applications |
| **Linux** | 🟡 Beta | [**Download .AppImage**](#) | Run `chmod +x` and execute |
| **iOS / iPadOS** | 🕒 Planned | *Coming Soon to App Store* | Mobile Safari Extension & MDM Profile |
| **Android** | 🕒 Planned | *Coming Soon to Play Store* | System-wide VPN service |

</div>

<br/>

> **Note:** For the highest level of security, we recommend running Calvary Porn Blocker on a dedicated system with standard user accounts, locking the Administrator PIN with your accountability partner.

---

## ⚙️ Core Features & Capabilities

Calvary Porn Blocker is engineered from the ground up to be resilient against tampering while remaining deeply respectful of your privacy. 

| Feature | Description |
| :--- | :--- |
| 🛡️ **DNS-Level Filtering** | Blocks explicit domains at the network level, preventing content from ever reaching your device. |
| 👨‍👩‍👧 **Multi-Profile System** | Choose from Individual, Family, Ministry, and School strictness presets based on your environment. |
| 🤝 **Accountability Alerts** | Automated, cryptographically secure email alerts sent to your trusted partner if the blocker is disabled or tampered with. |
| 🔍 **Heuristic Media Blurring** | Real-time page scanning to seamlessly blur potentially explicit imagery until manually verified. |
| 🚫 **App Executable Blocker** | Restricts local applications, browsers, and hidden executables that are known vectors for adult content. |
| 🔒 **100% Local-First** | All logs and settings remain entirely offline. No cloud telemetry, zero data harvesting. |

---

## 📥 Getting Started (For Developers & Admins)

If you wish to spin up the local ecosystem from source, follow these instructions:

### 1. The Calvary Dashboard

The central dashboard provides real-time monitoring, profile configuration, and accountability partner management.

```bash
cd AllyDashboard
npm install
npm run dev
```
*The dashboard will be available at `http://localhost:4000`.*

### 2. The Core Blocker Agent

The background agent that enforces rules, monitors network traffic, and communicates with the system level.

```bash
cd PornBlockerAgent
npm install
npm start
```

### 3. Deploy System Enforcement (Windows Only)

Run PowerShell as **Administrator** to enforce network-level DNS protection:

```powershell
.\Deploy-DNSBlocker.ps1
```

---

## 🌍 Community & Support

You don't have to fight this battle alone. Join a community of developers, ministers, and families dedicated to building a safer internet.

- 💬 **[GitHub Discussions](https://github.com/evgjohnmorris/calvary-porn-blocker/discussions)** — Technical support and feature requests
- 📰 **[Reddit (r/CalvaryPornBlocker)](https://reddit.com/r/CalvaryPornBlocker)** — News and updates
- 🤝 **[Facebook Group](https://facebook.com/groups/calvarypornblocker)** — Faith-based support and accountability

---

<div align="center">
  <i>Built with faith, for freedom.</i>
  <br><br>
  <p>If you or someone you know is struggling, please reach out to a trusted pastor, counselor, or accountability partner. Tools exist to help — but the deeper work is done in community, with truth, and by grace.</p>
</div>
