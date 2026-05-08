# Calvary Blocker 🛡️

<div align="center">
  <img src="./assets/hero-banner.png" alt="Calvary Blocker Hero Banner" width="100%" />
</div>

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Privacy First](https://img.shields.io/badge/Privacy-100%25%20Local-success.svg)
![Open Source](https://img.shields.io/badge/Open_Source-%E2%9D%A4-red.svg)
![Platform: Windows](https://img.shields.io/badge/Platform-Windows-0078d7.svg)
![DNS Filtering](https://img.shields.io/badge/Filtering-DNS--Level-orange.svg)
![GitHub stars](https://img.shields.io/github/stars/evgjohnmorris/calvary-porn-blocker?style=social)
![GitHub forks](https://img.shields.io/github/forks/evgjohnmorris/calvary-porn-blocker?style=social)

> **A free, open-source content filter built for individuals, families, ministries, and schools — designed to help people break free from pornography addiction and protect those they love.**

---

## Why This Exists

Some platforms intentionally make it difficult to delete accounts, cancel subscriptions, or unsubscribe from services and marketing emails. This is not accidental — it is a design choice. **Dark-pattern design** is common across much of the tech industry because user retention generates profit. The longer people stay engaged, the more money companies make through advertising, subscriptions, and data collection.

This raises a deeper question: **who benefits from keeping people trapped in compulsive behavior, and why are so many industries built on addiction-driven systems?**

---

## The Scale of the Problem

Pornography addiction has become widespread and destructive. Research and recovery organizations have documented increasing rates of compulsive pornography use, especially with the rise of smartphones, social media, and algorithm-driven content. Before COVID-19, researchers were already warning about escalating addiction rates and serious mental health consequences — and many believe the problem deepened during and after the pandemic.

The issue is not limited to pornography websites alone. **Sexualized content, provocative marketing, exploitative entertainment, and hypersexual media culture are deeply embedded across advertising, social media, Hollywood, gaming, music, and online platforms.** Constant exposure conditions people from a young age to seek increasingly explicit material.

Children are not born searching for pornography. Curiosity is often awakened through repeated exposure, normalization, peer pressure, and cultural messaging. What is promoted publicly eventually shapes private behavior.

---

## The Darker Side

There is a side to this industry that cannot be ignored. **Human trafficking, coercion, exploitation, abuse, and manipulation exist throughout parts of the sex industry.** Some individuals are trapped through threats, addiction, financial dependency, or psychological control. Many people are suffering silently and need real help, protection, and restoration.

Pornography does not promote faithfulness, self-control, love, or healthy relationships. It trains people to objectify others and disconnect intimacy from commitment and responsibility.

---

## A Christian Perspective

From a Christian perspective, pornography is spiritually destructive. It corrupts the mind, damages families, and pulls people away from purity, truth, and faithfulness. Modesty, discipline, repentance, and accountability matter. Leading others into temptation through exploitation, immodesty, or sexualized marketing also carries moral responsibility.

> *"But I say to you that everyone who looks at a woman with lustful intent has already committed adultery with her in his heart."*
> — Matthew 5:28

> *"Flee from sexual immorality."*
> — 1 Corinthians 6:18

People need **both practical tools and spiritual support**: accountability, honest community, content blockers, mentorship, counseling, and the Gospel. Recovery requires both truth and action.

---

## What Calvary Blocker Does

Calvary Blocker is a local, privacy-first content filtering tool with:

- 🛡️ **DNS-level blocking** — stops explicit content before it reaches your device
- 👨‍👩‍👧 **Multi-profile support** — Individual, Family, Ministry, and School presets
- 🤝 **Accountability system** — optional ally/partner notifications
- 🔍 **Extension-based blur** — blurs explicit images at the browser level
- 🌍 **Onboarding wizard** — available in 30+ languages, supports 195+ nations
- 🚫 **Application-level blocking** — restrict access to specific apps
- 📋 **Audit logging** — transparent record of activity for accountability
- 🔒 **No cloud data collection** — everything runs locally on your machine

### Built With Modern Tech 💻

- **Backend**: Node.js, Express, Socket.io
- **Frontend**: Vanilla JS, Glassmorphism UI, Dark Mode
- **Security**: Content Security Policy (CSP), Strict Rate Limiting, Local-First Architecture
- **Automation**: Playwright End-to-End Testing
- **System**: PowerShell DNS Management

### Supported Profiles

| Profile | Description |
| --- | --- |
| 🙋 Individual | Personal accountability, strict filtering |
| 👨‍👩‍👧 Family | Safe environment for children and spouses |
| ⛪ Ministry | Church, pastoral, and counseling contexts |
| 🏫 School | Educational institutions and youth groups |

---

## Installation & Specific Instructions

Calvary Blocker consists of multiple components that work together to protect your device. Follow these specific instructions to get everything running.

### 1. Setting up the Ally Dashboard

The Ally Dashboard provides real-time monitoring, alerts, and settings configuration.

```bash
# Navigate to the dashboard directory
cd AllyDashboard

# Install dependencies and start the dashboard
npm install
node index.js
```

The dashboard will run locally at `http://localhost:4000`.

### 2. Running the Blocker Agent

The Blocker Agent enforces rules and communicates with the dashboard.

```bash
# Navigate to the agent directory
cd PornBlockerAgent

# Install dependencies and start the agent
npm install
node server.js
```

### 3. Deploying the DNS Blocker (Windows Only)

To enforce system-wide DNS blocking, you need to run the PowerShell deployment script as an Administrator.

1. Open PowerShell as **Administrator**.
2. Navigate to the root directory of the project.
3. Run the deployment script:

   ```powershell
   .\Deploy-DNSBlocker.ps1
   ```

4. Follow the prompts to configure your primary and secondary filtered DNS servers.

> **First run:** You will be guided through a setup wizard to create your admin account and configure your filtering profile.

---

## Contributing

Contributions are welcome. Please open an issue or submit a pull request. All contributions must align with the mission and purpose of this project.

---

## License

This project is open source under the MIT License. See [LICENSE](./LICENSE) for details.

---

## A Final Word

No one should remain trapped in addiction or exploitation.

**Freedom, repentance, healing, and restoration are possible.**

If you or someone you know is struggling, please reach out to a trusted pastor, counselor, or accountability partner. Tools like this one exist to help — but the deeper work is done in community, with truth, and by grace.

---

*Built with faith, for freedom.*
