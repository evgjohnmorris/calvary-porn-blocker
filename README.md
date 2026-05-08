<div align="center">

<img src="./assets/hero-banner.png" alt="Calvary Porn Blocker" width="100%" style="border-radius: 16px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2); margin-bottom: 24px;" />

# 🛡️ Calvary Porn Blocker

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge&color=09090b)](#)
[![Privacy First](https://img.shields.io/badge/Privacy-100%25%20Local-success.svg?style=for-the-badge&color=10b981)](#)
[![Platform: Windows](https://img.shields.io/badge/Platform-Windows-0078d7.svg?style=for-the-badge&color=0078d7)](#)
[![React Integration](https://img.shields.io/badge/React-18.2-blue?style=for-the-badge&logo=react&color=0ea5e9)](#)
[![Modern JavaScript](https://img.shields.io/badge/JavaScript-ES2023-yellow?style=for-the-badge&logo=javascript&color=eab308)](#)

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

## 💻 Aesthetic UI & Unique React Engineering

Our application doesn't just block content; it does so with a **premium, glassmorphic UX/UI** that feels modern, safe, and beautiful. 

### ✨ The Glassmorphic React Dashboard

We leverage modern **React 18** features and unique CSS properties to deliver a stunning dashboard. Here is a glimpse of our UI source code for the animated Lockdown component:

```jsx
import React, { useState, useCallback } from 'react';
import { Shield, ShieldCheck, Lock } from 'lucide-react';
import './AestheticGlass.css';

/**
 * @component AestheticLockdownCard
 * @description A premium glassmorphic UI component for toggling system protection.
 */
export const AestheticLockdownCard = ({ initialStatus }) => {
  const [isLocked, setIsLocked] = useState(initialStatus);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = useCallback(async () => {
    setIsAnimating(true);
    // Unique Vanilla JS integration bridging React to local Windows Services
    try {
      const response = await fetch('http://localhost:4000/api/lockdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: !isLocked })
      });
      
      if (response.ok) setIsLocked(!isLocked);
    } catch (err) {
      console.error("Agent communication failed", err);
    }
    setTimeout(() => setIsAnimating(false), 600);
  }, [isLocked]);

  return (
    <div className={`calvary-card glass-panel ${isLocked ? 'glow-emerald' : 'glow-rose'}`}>
      <div className="card-header">
        {isLocked ? <ShieldCheck className="icon-pulse-safe" size={40} /> : <Shield className="icon-alert" size={40} />}
        <h2>Calvary Shield</h2>
      </div>
      
      <p className="status-text">
        {isLocked ? 'Ministry-Grade Protection is Active. Your network is secure.' : 'System Vulnerable. Protection Offline.'}
      </p>

      <button 
        className={`premium-btn ${isAnimating ? 'btn-pop' : ''}`} 
        onClick={handleToggle}
      >
        <Lock size={18} />
        <span>{isLocked ? 'Disable (PIN Required)' : 'Engage Lockdown'}</span>
      </button>
    </div>
  );
};
```

### 🧠 Real-Time Vanilla JS Heuristics

Under the hood, Calvary uses blazing fast **Vanilla JavaScript** to perform real-time DOM mutation observations, blurring explicit images before the browser even renders them:

```javascript
/**
 * Calvary Visual Engine - DOM Heuristic Scanner
 * Runs seamlessly in the background without impacting frame rate.
 */
const CalvaryObserver = new MutationObserver((mutations) => {
  requestAnimationFrame(() => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.tagName === 'IMG' || node.tagName === 'VIDEO') {
          // Instantly apply a gorgeous, frosted glass blur until verified
          node.style.filter = 'blur(40px) saturate(150%)';
          node.style.transition = 'filter 0.3s ease-in-out';
          
          analyzeMediaContent(node).then(isSafe => {
            if (isSafe) node.style.filter = 'none';
          });
        }
      });
    });
  });
});

CalvaryObserver.observe(document.documentElement, { 
  childList: true, subtree: true 
});
```

---

## ⚙️ Core Architecture

| Feature | Description |
| :--- | :--- |
| 🛡️ **DNS-Level Filtering** | Stops explicit content before it reaches your network card |
| 👨‍👩‍👧 **Multi-Profile** | Individual, Family, Ministry, and School presets |
| 🤝 **Accountability** | Automated, secure email alerts sent to your trusted partner |
| 🔍 **Heuristic Blurring** | Real-time DOM scanning to blur explicit imagery gracefully |
| 🚫 **App Blocker** | Restricts local applications and hidden executables |
| 🔒 **Local-First** | 100% offline logging. Cryptographically secure. No cloud telemetry |

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
