# ISO/IEC 27001 Compliance & Accountability Report
**Calvary Sexual Immorality Blocker Project**

## 1. Executive Summary
This document serves as the compliance audit framework for the Calvary Sexual Immorality Blocker. As a system designed for strict ministry accountability, it conforms to essential Information Security Management (ISO/IEC 27001) principles, specifically concerning Access Control, Logging & Monitoring, and Incident Management.

## 2. Access Control (ISO/IEC 27001: A.9)
The system strictly enforces role-based access to network settings and filter configurations.
*   **Authentication**: All administrative dashboard endpoints are protected by strong JWT authentication.
*   **Lockdown Mode**: When enabled, DNS configurations, VPN gateways, and filter levels are locked down. Any attempt to modify these settings outside of authorized maintenance windows triggers a high-severity alert.

## 3. Logging & Monitoring (ISO/IEC 27001: A.12.4)
Comprehensive auditing ensures that no action goes unnoticed.
*   **Tamper-Evident Logs**: The `audit.log` system records all authentication events, configuration changes, and system scans. 
*   **Real-Time Review**: Logs are directly accessible via the Developer & Logs tab to provide total transparency.

## 4. Incident Management & Accountability (ISO/IEC 27001: A.16)
Accountability is a core pillar, mitigating insider threat risks and ensuring personal purity compliance.
*   **Immediate Alerting**: Via integrated Twilio (SMS) and SMTP (Email) services, accountability partners are immediately notified of any `BYPASS_ATTEMPT_DETECTED` or `LOCKDOWN_DISABLED` events.
*   **System Scanner**: Deep system scanning ensures ongoing compliance by actively searching for unauthorized explicit content or history, generating logs and providing rapid remediation (deletion/quarantine).

## 5. Ongoing Review
*   **UI Integration**: The dashboard incorporates a "Ministry Setup Guide" to mandate configuration of accountability partners before the system is considered "Compliant".
*   **Review Schedule**: It is recommended that this policy and the corresponding logs be reviewed by a technical elder or ministry supervisor quarterly.
