# Privacy Policy

**Calvary Porn Blocker — Calvary Porn Blocker Project**
Effective Date: 2026-05-08

## 1. Our Privacy Philosophy

The Calvary Porn Blocker is built on a foundation of absolute privacy and zero trust. In a world where applications harvest user data to monetize attention, we believe that tools designed for freedom and accountability should not become a new source of surveillance. 

Our privacy philosophy is simple: **Your data belongs to you, and it never leaves your device unless you explicitly choose to share it.**

This software is designed to align with the principles of **ISO/IEC 29101 (Privacy Architecture Framework)**, ensuring data minimization, local-first processing, and complete transparency.

---

## 2. Data Collection and Storage

### 2.1 100% Local-First Architecture
All configuration, user profiles, and filtering rules are stored locally on the device where the software is installed. 
- **No Cloud Sync:** There is no automatic synchronization of your data to external servers.
- **No Remote Databases:** We do not host, maintain, or access any central database of user activity.

### 2.2 Data Minimization
We only store the data strictly necessary for the application to function locally:
- **Authentication:** Only a username and a one-way cryptographically hashed password (`bcrypt`) are stored. No email addresses or personally identifiable information (PII) are required to create an account or use the software.
- **Settings:** Your chosen filter strictness levels, safe domains, and blocked applications are stored in encrypted, local configuration files.

### 2.3 Accountability Notifications
If you choose to use the Accountability Alerts feature (to notify a trusted ally if the blocker is disabled or tampered with):
- **Email/SMS Sending:** The application uses standard protocols (SMTP or third-party APIs like Twilio) to send alerts directly from your machine to your chosen accountability partner. 
- **No Intermediaries:** Calvary Porn Blocker does not route these messages through our own servers. You provide the credentials for the sending service, and the application communicates directly with that service.

---

## 3. Telemetry and Analytics

**Zero Telemetry. Zero Tracking.**

- We do not collect crash reports.
- We do not track feature usage.
- We do not embed tracking pixels, marketing analytics, or any third-party surveillance scripts.
- Your browsing history is evaluated locally for filtering purposes and is **never** transmitted, logged externally, or sold.

---

## 4. Audit Logging

To ensure system integrity and accountability, the application maintains a local `audit.log`. 
- **What is logged:** Administrative actions, authentication attempts, configuration changes, and system tampering events.
- **Storage:** This log is stored securely on your local device. It utilizes an HMAC-SHA256 append-only chain for tamper evidence.
- **Access:** Only the local administrator can view this log. It is not transmitted to us or any third party.

---

## 5. Third-Party Services

The Calvary Porn Blocker relies on network-level DNS filtering. When you activate filtering, your DNS queries may be routed to privacy-respecting, filtered DNS providers (such as CleanBrowsing or OpenDNS Family Shield). 

Please note that while our software does not track you, your DNS provider may have their own privacy policies regarding the handling of DNS queries. We recommend reviewing the policies of the specific DNS resolver you select within the application.

---

## 6. Your Rights and Control

Because Calvary Porn Blocker operates entirely on your device, you have total control over your data at all times:
- **Right to Access:** You can view all stored data via the application's administrative dashboard and local files.
- **Right to Erasure (Right to be Forgotten):** You can delete your account and wipe all local logs and settings directly from the application's Account tab or by uninstalling the software and deleting the configuration directory.

---

## 7. Changes to this Policy

As the Calvary Porn Blocker is open-source software, any changes to how data is handled will be visible in the source code and documented in our release notes. Should material changes be made to our privacy architecture in future versions, this document will be updated accordingly.

---

*Built with faith, for freedom.*
