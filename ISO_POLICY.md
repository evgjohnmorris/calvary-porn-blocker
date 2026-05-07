# Calvary Sexual Immorality Blocker: ISO Policy Standards

This document establishes the formal compliance posture of the Calvary Sexual Immorality Blocker system, mapping the technical implementation to international ISO standards.

## 1. Information Security Management (ISO/IEC 27001)

The system enforces strict operational and architectural security protocols in accordance with the ISO 27001 framework.

### 1.1. Access Control (A.9)
- **Authentication**: All API requests and administrative dashboard accesses are secured via timed JSON Web Tokens (JWT).
- **Rate Limiting**: Brute-force attacks against the authentication endpoints are mitigated using `express-rate-limit`.
- **System Privileges**: Core filtering logic and background services must run under the `SYSTEM` account. Standard users are denied NTFS write permissions to `settings.json`, preventing unauthorized bypasses.
- **Ministry Mode**: When active, local administrative overrides are cryptographically rejected, ensuring central Ministry policy remains authoritative.

### 1.2. Cryptography (A.10)
- **Data at Rest**: All local configuration, particularly `settings.json`, is protected via **AES-256-GCM** authenticated encryption.
- **Audit Integrity**: The `audit.log` file employs an **HMAC-SHA256** append-only cryptographic chain. Any unauthorized modification or deletion of log entries breaks the chain, providing mathematically provable tamper evidence.

### 1.3. Operations Security (A.12)
- **Application Hardening**: The web dashboard is secured against XSS and injection attacks using `helmet`. The system has been audited for zero known npm vulnerabilities.

### 1.4. Network and Process Security (A.13 & A.14)
- **Content Null-Routing**: Explicit content delivery networks (e.g., Reddit media CDNs) are intercepted by the embedded DNS proxy and null-routed to `0.0.0.0`, blocking delivery at the network layer.
- **Active Process Defense**: The system implements an active process monitor polling every 5 seconds to terminate unmanaged proxy browsers (e.g., Tor Browser) that might circumvent the internal DNS architecture.

## 2. Ergonomics of Human-System Interaction (ISO 9241)

The user interface strictly adheres to ISO 9241-210 (Human-centered design for interactive systems) to maximize usability, efficiency, and satisfaction.

### 2.1. Aesthetic & Visual Hierarchy (ISO 9241-112)
- **Modern Premium Interface**: The system utilizes a cutting-edge **Glassmorphism** design language (semi-transparent, blurred panels) to deliver a high-quality, professional experience.
- **Color Palette**: A carefully curated deep navy (`#0b0f19`) and violet (`#8b5cf6`) dark mode ensures high contrast and reduced eye strain for prolonged administrative use.
- **Typography**: The geometric **Inter** font family is enforced globally for maximum legibility and clean data presentation.

### 2.2. Feedback and Error Handling (ISO 9241-110)
- **Contextual Feedback**: Long-running operations, such as the Deep System Scan, provide immediate visual feedback via animated spinners and clear textual descriptions.
- **Error Recovery**: Authentication or configuration failures trigger immediate, clear, non-disruptive inline alerts rather than relying on native browser dialogs.
- **Safe Remediation**: The scanner provides 1-click remediation paths (e.g., "Clear Explicit Browser History") to ensure users can effortlessly recover from non-compliant system states.

---
*Policy Version: 1.0.0 | Approved for Ministry Deployment*
