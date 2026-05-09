<div align="center">

<img src="./assets/hero-banner.svg" alt="Calvary Porn Blocker" width="100%" style="border-radius: 16px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2); margin-bottom: 24px;" />

# 🛡️ Calvary Porn Blocker

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge&color=09090b)](#)
[![Privacy First](https://img.shields.io/badge/Privacy-100%25%20Local-success.svg?style=for-the-badge&color=10b981)](./docs/PRIVACY_POLICY.md)
[![Platform: Windows](https://img.shields.io/badge/Platform-Windows-0078d7.svg?style=for-the-badge&color=0078d7)](#)
[![ISO 27001 Aligned](https://img.shields.io/badge/Alignment-ISO_27001-purple.svg?style=for-the-badge)](#)

<br/>

> **A free, open-source content filter built for individuals, families, ministries, and schools — designed to help people break free from pornography addiction and protect those they love.**

<br/>

[**⬇️ Download for Windows**](#-download--installation) &nbsp; | &nbsp; [**📖 Read Documentation**](#-getting-started) &nbsp; | &nbsp; [**💬 Join Community**](#-community--support)

</div>

<br/>

## 📖 The Vision

In a world where platforms use dark-pattern design to keep users engaged and addicted, **Calvary Porn Blocker** stands as a tool for freedom. We believe that technology should serve people, not enslave them. 

Pornography addiction is a widespread crisis that damages relationships, exploits the vulnerable, and corrupts the mind. This project exists to provide a ministry-grade, ISO-aligned safety net that enforces purity and accountability through uncompromised engineering.

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


<details>
<summary><kbd>🛡️ Repenting from Sexual Immorality</kbd></summary>
<br>

| Resource | Link | Contact Information | Description |
| :--- | :--- | :--- | :--- |
| Restored Hope Network | [https://www.restoredhopenetwork.org/](https://www.restoredhopenetwork.org/) | (719) 598-0659 / info@restoredhopenetwork.org | Ministry network for those impacted by sexual and relational brokenness. |
| Restored Hope Network Ministry Finder | [https://www.restoredhopenetwork.org/ministry-finder](https://www.restoredhopenetwork.org/ministry-finder) | Contact via website | Ministry network for those impacted by sexual and relational brokenness. |
| Restored Hope Network Find Help | [https://www.restoredhopenetwork.org/find-help](https://www.restoredhopenetwork.org/find-help) | Contact via website | Ministry network for those impacted by sexual and relational brokenness. |
| Restored Hope Network Virtual Support | [https://www.restoredhopenetwork.org/virtual-support](https://www.restoredhopenetwork.org/virtual-support) | Contact via website | Ministry network for those impacted by sexual and relational brokenness. |
| Restored Hope Network FAQ | [https://www.restoredhopenetwork.org/frequently-asked-questions](https://www.restoredhopenetwork.org/frequently-asked-questions) | Contact via website | Ministry network for those impacted by sexual and relational brokenness. |
| Restored Hope Network External Resources | [https://www.restoredhopenetwork.org/external-resources](https://www.restoredhopenetwork.org/external-resources) | Contact via website | Ministry network for those impacted by sexual and relational brokenness. |
| CHANGED Movement | [https://www.changedmovement.com/](https://www.changedmovement.com/) | [contact@changedmovement.com](mailto:contact@changedmovement.com) | Support for individuals navigating faith and sexuality. |
| CHANGED Movement Stories | [https://www.changedmovement.com/stories](https://www.changedmovement.com/stories) | Contact via website | Support for individuals navigating faith and sexuality. |
| Desert Stream Ministries | [https://www.desertstream.org/](https://www.desertstream.org/) | (816) 608-3428 / [info@desertstream.org](mailto:info@desertstream.org) | Programs focused on relational and sexual healing. |
| Desert Stream Ministries / Living Waters | [https://desertstream.org/](https://desertstream.org/) | Contact via website | Programs focused on relational and sexual healing. |
| Living Hope Ministries | [https://www.livehope.org/](https://www.livehope.org/) | Contact via website | Christian ministry providing discipleship regarding sexual struggles. |
| Brothers Road | [https://brothersroad.org/](https://brothersroad.org/) | Contact via website | Ministry or advocacy organization offering support and resources. |
| Joel 2:25 International | [https://joel225.org/](https://joel225.org/) | Contact via website | Ministry or advocacy organization offering support and resources. |
| Harvest USA | [https://harvestusa.org/](https://harvestusa.org/) | (215) 482-0111 / [info@harvestusa.org](mailto:info@harvestusa.org) | Christian ministry providing discipleship regarding sexual struggles. |
| Outpost Ministries | [https://outpostministries.org/](https://outpostministries.org/) | Contact via website | Ministry or advocacy organization offering support and resources. |
| Reconciliation Ministries | [https://recmin.org/](https://recmin.org/) | Contact via website | Christian ministry providing discipleship regarding sexual struggles. |
| Portland Fellowship | [https://www.portlandfellowship.com/](https://www.portlandfellowship.com/) | Contact via website | Ministry or advocacy organization offering support and resources. |
| First Stone Ministries | [https://firststone.org/](https://firststone.org/) | Contact via website | Christian ministry providing discipleship regarding sexual struggles. |
| Alliance for Therapeutic Choice | [https://www.therapeuticchoice.com/](https://www.therapeuticchoice.com/) | Contact via website | Ministry or advocacy organization offering support and resources. |
| PFOX | [https://pfox.org/](https://pfox.org/) | Contact via website | Ministry or advocacy organization offering support and resources. |
| Voice of the Voiceless | [https://www.voiceofthevoiceless.info/](https://www.voiceofthevoiceless.info/) | Contact via website | Ministry or advocacy organization offering support and resources. |
| Reintegrative Therapy Association | [https://www.reintegrativetherapy.com/](https://www.reintegrativetherapy.com/) | Contact via website | Ministry or advocacy organization offering support and resources. |
| Core Issues Trust | [https://core-issues.org/](https://core-issues.org/) | Contact via website | Ministry or advocacy organization offering support and resources. |
| New Hope Ministries | [https://newhope123.org/](https://newhope123.org/) | Contact via website | Ministry or advocacy organization offering support and resources. |
| New Hope Ministries RHN Listing | [https://www.restoredhopenetwork.org/ministry-finder/church/27/new-hope-ministries](https://www.restoredhopenetwork.org/ministry-finder/church/27/new-hope-ministries) | Contact via website | Ministry or advocacy organization offering support and resources. |
| ReStory Ministries | [https://restoryministries.org/](https://restoryministries.org/) | Contact via website | Ministry or advocacy organization offering support and resources. |
| ReStory Ministries RHN Listing | [https://www.restoredhopenetwork.org/ministry-finder/church/73/restory-ministries](https://www.restoredhopenetwork.org/ministry-finder/church/73/restory-ministries) | Contact via website | Ministry or advocacy organization offering support and resources. |
| HIS Ministries RHN Listing | [https://www.restoredhopenetwork.org/ministry-finder/church/3/his-ministries](https://www.restoredhopenetwork.org/ministry-finder/church/3/his-ministries) | Contact via website | Ministry or advocacy organization offering support and resources. |
| Hearts of Hope RHN Listing | [https://www.restoredhopenetwork.org/ministry-finder/church/13/hearts-of-hope](https://www.restoredhopenetwork.org/ministry-finder/church/13/hearts-of-hope) | Contact via website | Ministry or advocacy organization offering support and resources. |
| Free Indeed Ministries NE RHN Listing | [https://www.restoredhopenetwork.org/ministry-finder/church/11/free-indeed-ministries-ne](https://www.restoredhopenetwork.org/ministry-finder/church/11/free-indeed-ministries-ne) | Contact via website | Ministry or advocacy organization offering support and resources. |
| Taking Back Ground | [https://www.takingbackground.com/](https://www.takingbackground.com/) | Contact via website | Ministry or advocacy organization offering support and resources. |
| Redeemed Seasons | [https://www.redeemedseasons.org/](https://www.redeemedseasons.org/) | Contact via website | Ministry or advocacy organization offering support and resources. |
| About HOPE | [https://abouthope.org/](https://abouthope.org/) | Contact via website | Ministry or advocacy organization offering support and resources. |
| About HOPE / Cross Church | [https://crosschurch.com/abouthope](https://crosschurch.com/abouthope) | Contact via website | Ministry or advocacy organization offering support and resources. |
| Center for Christian Restoration | [https://www.ccrhouston.org/](https://www.ccrhouston.org/) | Contact via website | Ministry or advocacy organization offering support and resources. |
| Pure Heart Ministries | [https://www.pureheartministries.org/](https://www.pureheartministries.org/) | Contact via website | Ministry or advocacy organization offering support and resources. |
| Alive in Christ | [https://www.alive-in-christ.net/](https://www.alive-in-christ.net/) | Contact via website | Ministry or advocacy organization offering support and resources. |
| All Things New / First Baptist Church of Glenarden | [https://fbcglenarden.org/ministries/all-things-new/](https://fbcglenarden.org/ministries/all-things-new/) | Contact via website | Ministry or advocacy organization offering support and resources. |
| Exchange Ministries | [https://exchangeministries.org/](https://exchangeministries.org/) | Contact via website | Ministry or advocacy organization offering support and resources. |
| Higher Ground NYC | [https://www.higherground.nyc/](https://www.higherground.nyc/) | Contact via website | Ministry or advocacy organization offering support and resources. |
| New Creation Ministries Fresno | [https://www.ncmfresno.org/](https://www.ncmfresno.org/) | Contact via website | Ministry or advocacy organization offering support and resources. |
| Homosexuals Anonymous | [https://homosexuals-anonymous.com/](https://homosexuals-anonymous.com/) | Contact via website | Ministry or advocacy organization offering support and resources. |
| Jason Ministries | [https://jasonministries.com/](https://jasonministries.com/) | Contact via website | Ministry or advocacy organization offering support and resources. |
| Person and Identity Project | [https://personandidentity.com/](https://personandidentity.com/) | Contact via website | Ministry or advocacy organization offering support and resources. |
| Walt Heyer Ministries | [https://waltheyer.com/](https://waltheyer.com/) | Contact via website | Support and resources for detransitioners. |
| Sex Change Regret | [https://sexchangeregret.com/](https://sexchangeregret.com/) | Contact via website | Support and resources for detransitioners. |
| Detrans United | [https://www.detransunited.com/](https://www.detransunited.com/) | Contact via website | Support and resources for detransitioners. |
| Beyond Trans | [https://www.beyondtrans.org/](https://www.beyondtrans.org/) | Contact via website | Ministry or advocacy organization offering support and resources. |

</details>

<details>
<summary><kbd>✝️ Pastoral Counseling & Apologetics</kbd></summary>
<br>

| Resource | Link | Contact Information | Description |
| :--- | :--- | :--- | :--- |
| Living Waters | [https://www.desertstream.org/living-waters](https://www.desertstream.org/living-waters) | Contact via website | Programs focused on relational and sexual healing. |
| Concerned Women for America | [https://concernedwomen.org/](https://concernedwomen.org/) | Contact via website | Advocacy group focused on protecting women's rights and sex-based spaces. |
| Ethics & Religious Liberty Commission | [https://erlc.com/](https://erlc.com/) | Contact via website | Ministry or advocacy organization offering support and resources. |
| The Gospel Coalition | [https://www.thegospelcoalition.org/](https://www.thegospelcoalition.org/) | 1-844-448-3842 / [giving@thegospelcoalition.org](mailto:giving@thegospelcoalition.org) | Christian apologetics and theological resource ministry. |
| Desiring God | [https://www.desiringgod.org/](https://www.desiringgod.org/) | (888) 346-4700 / [email@desiringgod.org](mailto:email@desiringgod.org) | Christian apologetics and theological resource ministry. |
| Summit Ministries | [https://www.summit.org/](https://www.summit.org/) | (719) 685-9103 / [info@summit.org](mailto:info@summit.org) | Christian apologetics and theological resource ministry. |
| Stand to Reason | [https://www.str.org/](https://www.str.org/) | (562) 595-7333 / [questions@str.org](mailto:questions@str.org) | Christian apologetics and theological resource ministry. |
| Colson Center | [https://www.colsoncenter.org/](https://www.colsoncenter.org/) | Contact via website | Christian apologetics and theological resource ministry. |
| Breakpoint | [https://breakpoint.org/](https://breakpoint.org/) | Contact via website | Ministry or advocacy organization offering support and resources. |
| Got Questions | [https://www.gotquestions.org/](https://www.gotquestions.org/) | Contact via website | Christian apologetics and theological resource ministry. |
| Christian Medical & Dental Associations | [https://cmda.org/](https://cmda.org/) | Contact via website | Ministry or advocacy organization offering support and resources. |
| American College of Pediatricians | [https://acpeds.org/](https://acpeds.org/) | Contact via website | Advocacy for evidence-based medical care and gender medicine. |
| Genspect | [https://genspect.org/](https://genspect.org/) | Contact via website | Advocacy for evidence-based medical care and gender medicine. |
| Genspect USA | [https://genspect.org/usa/](https://genspect.org/usa/) | Contact via website | Advocacy for evidence-based medical care and gender medicine. |
| Society for Evidence-Based Gender Medicine | [https://segm.org/](https://segm.org/) | Contact via website | Ministry or advocacy organization offering support and resources. |
| Do No Harm | [https://donoharmmedicine.org/](https://donoharmmedicine.org/) | Contact via website | Advocacy for evidence-based medical care and gender medicine. |
| Partners for Ethical Care | [https://www.partnersforethicalcare.com/](https://www.partnersforethicalcare.com/) | Contact via website | Ministry or advocacy organization offering support and resources. |
| Our Duty | [https://ourduty.group/](https://ourduty.group/) | Contact via website | Ministry or advocacy organization offering support and resources. |
| Parents of ROGD Kids | [https://www.parentsofrogdkids.com/](https://www.parentsofrogdkids.com/) | Contact via website | Parental rights advocacy organization. |
| Transition Justice | [https://transitionjustice.org/](https://transitionjustice.org/) | Contact via website | Ministry or advocacy organization offering support and resources. |
| Independent Women’s Forum | [https://www.iwf.org/](https://www.iwf.org/) | Contact via website | Advocacy group focused on protecting women's rights and sex-based spaces. |
| Independent Women’s Voice | [https://www.iwv.org/](https://www.iwv.org/) | Contact via website | Advocacy group focused on protecting women's rights and sex-based spaces. |
| Moms for Liberty | [https://www.momsforliberty.org/](https://www.momsforliberty.org/) | Contact via website | Parental rights advocacy organization. |
| Parents Defending Education | [https://defendinged.org/](https://defendinged.org/) | Contact via website | Parental rights advocacy organization. |
| No Left Turn in Education | [https://noleftturn.us/](https://noleftturn.us/) | Contact via website | Parental rights advocacy organization. |
| Protect Kids California | [https://protectkidsca.com/](https://protectkidsca.com/) | Contact via website | Ministry or advocacy organization offering support and resources. |
| MassResistance | [https://www.massresistance.org/](https://www.massresistance.org/) | Contact via website | Ministry or advocacy organization offering support and resources. |
| Mission America | [https://missionamerica.com/](https://missionamerica.com/) | Contact via website | Ministry or advocacy organization offering support and resources. |
| Local Evangelist, Chaplain, Pastor, or Minister | Local contact | Local contact | Immediate pastoral care, prayer, grief support, family support, hospital or jail support. |
| Calvary Chapel Association Churches | [https://calvarycca.org/churches/](https://calvarycca.org/churches/) | Contact via website | Church locator for local support. |
| Calvary Chapel Church Locator | [https://calvarychapel.com/church-locator/](https://calvarychapel.com/church-locator/) | Contact via website | Church locator for local support. |
| Association of Professional Chaplains | [https://www.apchaplains.org/](https://www.apchaplains.org/) | [info@apchaplains.org](mailto:info@apchaplains.org) | APC supports professional chaplaincy care across health and human-service settings. |
| The Salvation Army Location Finder | [https://www.salvationarmyusa.org/](https://www.salvationarmyusa.org/) | Local offices vary | Local emergency assistance, shelter, food, utility support, spiritual care. |
| Focus on the Family Counseling Department | [https://www.focusonthefamily.com/](https://www.focusonthefamily.com/) | 1-855-771-HELP / 1-855-771-4357 | Offers a one-time phone consultation and referral support during listed weekday hours. |
| Better Help (Christian Counseling) | [https://www.betterhelp.com](https://www.betterhelp.com) | Contact via website | Connect with a fellow believer online within our network of licensed, professional therapists. |
| Christian Counseling & Educational Foundation | [https://www.ccef.org/](https://www.ccef.org/) | Contact via website | Restoring Christ to counseling & counseling to the church. |
| Free Christian Counseling Online | [https://freechristiancounseling.online/](https://freechristiancounseling.online/) | Contact via website | Free & discounted counseling sessions for pastors, missionaries, and foster/adoptive parents. |
| NeedEncouragement.com | [https://needencouragement.com/free-christian-counseling/](https://needencouragement.com/free-christian-counseling/) | Contact via website | Free Christian counseling based on God’s word! |
| Men of Armor | [https://menofarmor.com/counseling/](https://menofarmor.com/counseling/) | Contact via website | Biblical counseling is simply focused discipleship for any issue in a person’s life. |

</details>

<details>
<summary><kbd>💍 Marriage & Infidelity</kbd></summary>
<br>

| Resource | Link | Contact Information | Description |
| :--- | :--- | :--- | :--- |
| Emergency Services (Imminent Danger) | [911 / 988](tel:911) | 911 or 988 | For imminent danger, still use 911 or 988. |
| 911 / Domestic Violence Hotline | [https://www.thehotline.org/](https://www.thehotline.org/) | 911 for immediate danger; 1-800-799-7233 or text START to 88788 | Relationship violence, threats, stalking, coercive control, unsafe home situation. |
| AAMFT Therapist Locator | [https://www.aamft.org/](https://www.aamft.org/) | Provider-specific | AAMFT's directory helps locate marriage and family therapists. |
| Psychology Today Therapist Directory | [https://www.psychologytoday.com/](https://www.psychologytoday.com/) | Provider-specific | Directory includes marriage counseling and couples counseling filters. |
| Gottman Referral Network | [https://gottmanreferralnetwork.com/](https://gottmanreferralnetwork.com/) | Provider-specific | Couples therapy using Gottman Method-trained clinicians. |
| Focus on the Family Marriage Counseling | [https://www.focusonthefamily.com/](https://www.focusonthefamily.com/) | 1-855-771-HELP / 1-855-771-4357 | Christian marriage counseling referral and one-time consultation. |
| Focus on the Family | [https://www.focusonthefamily.com/](https://www.focusonthefamily.com/) | Contact via website | Global Christian ministry dedicated to supporting families. |
| The Daily Citizen / Focus on the Family | [https://dailycitizen.focusonthefamily.com/](https://dailycitizen.focusonthefamily.com/) | Contact via website | Global Christian ministry dedicated to supporting families. |
| Family Research Council | [https://www.frc.org/](https://www.frc.org/) | 800-225-4008 | Ministry or advocacy organization offering support and resources. |
| Family Policy Alliance | [https://familypolicyalliance.com/](https://familypolicyalliance.com/) | Contact via website | State-level policy organization defending life, family, and religious liberty. |
| American Family Association | [https://www.afa.net/](https://www.afa.net/) | 662-844-5036 / [faq@afa.net](mailto:faq@afa.net) | Ministry or advocacy organization offering support and resources. |
| Ruth Institute | [https://ruthinstitute.org/](https://ruthinstitute.org/) | Contact via website | Ministry or advocacy organization offering support and resources. |
| Illinois Family Institute | [https://illinoisfamily.org/](https://illinoisfamily.org/) | Contact via website | State-level policy organization defending life, family, and religious liberty. |
| California Family Council | [https://www.californiafamily.org/](https://www.californiafamily.org/) | Contact via website | State-level policy organization defending life, family, and religious liberty. |
| Texas Values | [https://txvalues.org/](https://txvalues.org/) | Contact via website | State-level policy organization defending life, family, and religious liberty. |
| The Family Foundation | [https://www.familyfoundation.org/](https://www.familyfoundation.org/) | Contact via website | Ministry or advocacy organization offering support and resources. |
| North Carolina Family Policy Council | [https://www.ncfamily.org/](https://www.ncfamily.org/) | Contact via website | State-level policy organization defending life, family, and religious liberty. |
| Florida Family Policy Council | [https://www.flfamily.org/](https://www.flfamily.org/) | Contact via website | State-level policy organization defending life, family, and religious liberty. |
| Family Policy Institute of Washington | [https://familypolicyinstitute.com/](https://familypolicyinstitute.com/) | Contact via website | State-level policy organization defending life, family, and religious liberty. |
| Pennsylvania Family Institute | [https://pafamily.org/](https://pafamily.org/) | Contact via website | State-level policy organization defending life, family, and religious liberty. |
| Minnesota Family Council | [https://www.mfc.org/](https://www.mfc.org/) | Contact via website | State-level policy organization defending life, family, and religious liberty. |
| Wisconsin Family Council | [https://wifamilycouncil.org/](https://wifamilycouncil.org/) | Contact via website | State-level policy organization defending life, family, and religious liberty. |
| Family Watch International | [https://familywatch.org/](https://familywatch.org/) | Contact via website | Ministry or advocacy organization offering support and resources. |
| Howard Center / Pro-Fam | [https://profam.org/](https://profam.org/) | Contact via website | Ministry or advocacy organization offering support and resources. |
| World Congress of Families | [https://worldcongress.org/](https://worldcongress.org/) | Contact via website | Ministry or advocacy organization offering support and resources. |
| Family Life | [https://www.familylife.com/](https://www.familylife.com/) | Contact via website | Biblical Counseling Resources to help biblical counselors minister the Word of God. |

</details>

<details>
<summary><kbd>📖 Pastoral Training</kbd></summary>
<br>

| Resource | Link | Contact Information | Description |
| :--- | :--- | :--- | :--- |
| Pastoral Training of Asia | [https://pastoraltrainingasia.org/](https://pastoraltrainingasia.org/) | Contact via website | "Ministering to ministers" by providing training, tools, and support to pastors and church leaders in Southeast Asia. |

</details>

---

## ✝️ The Gospel Message

The End is near, judgement is coming; Repent and trust in Jesus Christ alone for forgiveness of sin, and salvation from judgement in Hell, unto the Kingdom of Heaven!

---

Those who repent and place their trust and faith in Jesus Christ alone, by His Word, can receive God’s mercy and grace for forgiveness of sin, peace that surpasses all understanding, and salvation for all eternity in the Kingdom of Heaven with God.

---

Jesus died on the cross and rose from the grave on the third day. He shed His blood for the sins of the world, that if they might believe on Him, they may be saved from the wrath of God and an eternity in Hell. Those who believe this may receive salvation from judgement, but our faith must be true. We must trust in Christ and be born-again. We must repent and believe the gospel!

---

### Why?

- **The Gospel is a free gift: PRICE = $0.00; 100% FREE!!!**
    
    It is a free gift, and not of ourselves lest any of us can boast in our own-selves rather than God. Works saves nobody, **Jesus Paid it all!**
    
    - For by grace are ye saved through faith; and that not of yourselves: it is the gift of God: not of works, lest any man should boast (Ephesians 2:8-10)
    - Jesus Said “It is finished” (John 19:30) Signifying that He paid our debt that we owe due to our sin against God, and His laws.
    - The wages of sin is death (Romans 6:23). God’s wrath abides on us because of our sin and evil each and every one of us has done in this world. This evil behavior, called sin, have wages and earnings. These wages and earnings is judgement by God’s wrath in an eternity in hell.
    - Jesus came in the flesh and died on the cross in our place, shedding His blood for the sin of the world and He rose again the third day He was in the grave! He is God in the flesh. He is the Christ and the Messiah. Because of what He did on the cross, we now have a choice: To trust in Jesus Christ and what He did in our place on the cross, or to receive God’s wrath ourselves. Either choice is eternal.
    - We are guilty of breaking the law, but Jesus paid our debts!

- **Everyone is a Sinner; Nobody has an Excuse**
    - It’s appointed once for men to die, and after this, the judgement (Hebrews 9:27).
    - All have fallen short of the glory of God (Romans 3:23).
    - God made Himself known to everyone that we have no excuse (Isaiah 45:5-12, Romans 1:20-32, Exodus 34:7).
    - If anyone says they are without sin, they are liars (1 John 1:8-10).
    - There is none good, only God is good (Psalm 14:3, Mark 10:18, Luke 18:19, Romans 3:10-23, Romans 14:12, Ecclesiastes 7:20).

- **The Nature and Characteristics of Sin**
    
    Therefore to him that knoweth to do good, and doeth it not, to him it is sin (James 4:17). Sin is breaking the 10 commandments in the Old Testament, and the 2 Commandments in the New Testament by which the violation is in both commission and/or omission.
    
    - Old Testament 10 Commandments
        1. You shall have no other God’s but me.
        2. You shall not make for yourself an idol. You shall not worship them or serve them; for I, the LORD your God, am a jealous God…
        3. You shall not take the name of the LORD your God in vain, for the LORD will not leave him unpunished.
        4. Remember the sabbath day, to keep it Holy, in it you shall do no work.
        5. Honor your father and your mother.
        6. You shall not murder (or commit hatred).
        7. You shall not commit adultery (or fornicate or lust).
        8. You shall not steal.
        9. You shall not bear false witness.
        10. You shall not covet.
    - New Testament 2 Commandments
        1. You shall love the LORD your God with all thy heart, soul, mind, and strength.
        2. Love your neighbor, your enemies, your persecutors, and those that hate you as yourself.

- **God’s Warning to Man**
    - “God will not leave the guilty unpunished” (Exodus 34:7)
    - “The LORD preserveth all them that love him: But all the wicked will he destroy” (Psalms 145:20, 101:8).
    - “...Then shall that Wicked be revealed, whom the Lord shall consume with the spirit of his mouth, and shall destroy...them” (2 Thessalonians 2:8-10).
    - “...But I say unto you, That every idle word that men shall speak, they shall give account thereof in the day of judgment” (Matthew 12:36-37).
    - “...Their place will be in the fiery lake of burning sulfur. This is the second death” (revelation 21:8).
    - “He that believeth on the Son hath everlasting life: and he that believeth not the Son shall not see life; but the wrath of God abideth on him” (John 3:36).
    - “We reap what we sow” (Galations 6).
    - “And there is salvation in no one else. For there is no other name under heaven, given to men, by which we must be saved” (Acts 2:36).
    - “The sexually immoral, idol worshippers, adulterers, prostitutes, homosexuals, the greedy, thieves, drunkards, gluttons, murderers, revilers, drug-abusers, slanderers, swindlers, all the unbelieving and wicked… and all liars will be in the lake of fire that burns with fire and brimstone” **(1 Corinthians 6:9-10, Revelation 21:8).**
    - “If anyone’s name was not found written in the Book of Life, he was thrown into the Lake of Fire” **(Revelation 20:15).**

- **God is Judge**
    
    God is right and just to judge every man according to all their evil in open and in secret as God put it on every man's heart to know God, and to do His Will. Because of man's wickedness, and desire to do evil rebelling from doing good, our sin separates us from God.
    
- **On the: Godhead, Death and Resurrection of Jesus Christ, Salvation and Forgiveness**
    
    But the Godhead (Father, Son, Holy Spirit in agreement with His divine Word) made a way that we can be forgiven of our sin, which is doing wrong and not doing right. The Father sent his Son Jesus Christ to dwell among us in the flesh to die on the cross for the sins of the world. He rose again the third day, that if we repent and believe this, to put our faith and trust in Him and on His name to be our Lord and Savior, we will receive God's mercy and grace for the forgiveness of sin, and salvation unto the Kingdom of Heaven.
    
- **The Holy Spirit & Peace**
    
    For those who have true and right faith and trust in Jesus Christ, God has sent the Holy Spirit, to those who trust in Him, that they might be filled with the Holy Spirit, that they might also receive the peace of God that surpasses all fear and understanding.
    
- **All Glory is God’s**
    
    Only God is worthy of all honor, praise, worship, and reverence. The works of the flesh will die as the flesh dies. But the works of the Holy Spirit is life and will be deliverance from the second death unto life in the Kingdom of Heaven.
    
- **Message to Christians**
    - ⚔︎ God commands us all to repent of our sins, in open and in secret, and to pick up our cross and walk in Christ. Love is patient and kind, but love does not love sin. Love without both truth and correction, without exception, is not love. If we love God, we will agree with God that our sin is evil whether it be open or secret. God hates our sin, whether it is from omission or commission. Those that repent and trust in Christ will believe His Word, and love God above all things including the lust of our flesh, the lust of our eyes, and the pride of life. The same lusts as the pleasures and treasures in the world over heaven. All these will be burned. God commanded us to have no idols above or before Him. Idolatry is this: anything put before and/or above God. God is Lord, not our interests, inclinations, or proclivity. Our family, friends, and jobs also are not Lord. They are gifts, not gods which gifts come second before Him. If we think ourselves of anything great, it is God who gives and decides, not us. None are great, none are good, none have anything of themselves, but all is for God. He alone is the gain, and all else is a loss and vanity or a gift from Him.
    - ⚔︎ The love of God leads to obedience to His Word, and correction. Those who live for the world are the same who live in disobedience of God's Word. Those that love Christ, preaching Christ to the World that they may be the light of the world. But those that love darkness, do not love Christ as the love of Christ, who is God in the love, is not the love of darkness. There is no darkness in the Lord.
    - ⚔︎ The love of God is not the love of money, pleasure, works, status, or friendship with the world: those in the world must choose to repent and live in and for Christ, or they will perish. Yet they cannot repent of themselves, it is the gift of God. Friendship with the world is enmity against God, but there is no greater friend than this: The love of Christ who has given His life for you and me. Therefore, those that trust in Jesus Christ will be saved from an everlasting Hellfire, and enter into eternity in the Kingdom of Heaven, where there is no sin or death.
    - ⚔︎ If anyone says they are without sin, they are a liar. If anyone thinks they are without sin, they are deceived. We're are sinners, but Jesus can redeem our sins if we repent and Trust in Him. There is none good, no not one. God alone is good. The man who believes he must not repent, is a man deceived, as repentance is a gift from God given to them who trust in Jesus Christ wholly.
    - There are numerous false doctrines in the world, even within our own churches. This is because men sought to steal from God, to make their own rendition. Taking doctrines and adding or removing from scripture. God says, His Word is perfectly preserved. There is a standard outside our own interests, that it would be wise to comply, else false doctrine could have been believed. We know this is true, because God did not only say “Thou shalt not covet our neighbors wife”, but that “thou shalt not covet”. We also know that in many trials and tribulations, the will of God may only be evident in our walks when we pray and fast. We also know, that there is no other God but God, who is more than a deity but has fulfilled every Word He preserved, and made certain His Word that we can understand it, if we submit to Him and have the fear of the Lord in our lives and our reasoning. We must be diligent and maintain our position that emotionalism, carnalism, human rationality, perspectivism, experiencialism, nepotism, or any other -isms, including politicalism or patriotism, come in between our souls and the love and will of God in our lives, less we be made like unto a cult in a world that needs truth having removed truth in ourselves for our own interests.

- **BELIEVE AND PRAY!**
    
    **“I Believe I am a sinner, and trust that Jesus died and rose again on the third day covering my sins. I trust and on his name with all my heart soul, mind and strength that He is Lord, Savior, and messiah. I repent and turn from my own ways and my sin. Jesus, you are Lord, you are God, and I trust in you, Amen!”**

---

<div align="center">
  <i>Built with faith, for freedom.</i>
  <br><br>
  <p>If you or someone you know is struggling, please reach out to a trusted pastor, counselor, or accountability partner. Tools exist to help — but the deeper work is done in community, with truth, and by grace.</p>
</div>
