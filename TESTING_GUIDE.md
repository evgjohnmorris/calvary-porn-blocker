# Calvary Sexual Immorality Blocker - Testing & Smoke Check Guide

This document provides instructions for performing regular smoke checks and lab trials to ensure the system remains compliant with ISO standards for Security, Infrastructure, Organization, User Satisfaction, Beauty, Design, and Functionality.

## 1. UI & Design Smoke Check (ISO: User Satisfaction, Beauty, Design)

To ensure the UI remains premium, functional, and aesthetically pleasing:

1. **Start the server** in the `PornBlockerAgent` directory:
   ```bash
   npm start
   ```
2. **Open the Dashboard**: Navigate to `https://localhost:3456` in your browser.
3. **Usability & Design Verification**:
   - Check the **Glassmorphism** layout for correct rendering (blur effects, transparency, and dark gradients).
   - Ensure the "Login" screen handles bad credentials cleanly, showing descriptive errors rather than hanging.
   - Upon logging in with the default credentials (`admin` / `password123` if set up), verify that the Ministry Setup Guide modal triggers properly if accountability partners are not yet set.
4. **Organization**: Verify that tabs (Dashboard, Filtering, Accountability, System Scanner, Logs) are correctly organized and logically structured for ease of use.

## 2. Infrastructure & Architecture Labs (ISO: Security, Infrastructure)

To verify the robust backend architecture and ministry-mode security lockouts:

1. **Run the API Lab Trials**:
   ```bash
   cd PornBlockerAgent
   node tests/api_labs.js
   ```
   **What this checks**:
   - Authentication endpoint functionality.
   - **Ministry Mode Architecture**: Ensures that when a remote policy is applied (Ministry Mode), no local admin can override the `filterLevel` or disable `lockdownMode`.
   - **Scanner Infrastructure**: Validates the functionality of the deep system scanner.

2. **Run the Smoke Test Suite**:
   ```bash
   npm run test:smoke
   ```
   **What this checks**:
   - Core API endpoints return expected HTTP status codes.
   - Unauthorized access attempts to `/api/settings` are strictly rejected with a `401 Unauthorized` or `403 Forbidden`.

## 3. ISO Policy Standards Implementation

When performing these checks, adhere to the following ISO 27001 policies:
* **A.12.1.1 (Documented Operating Procedures)**: All tests must be run using these documented steps to ensure consistency.
* **A.14.2.8 (System Acceptance Testing)**: The API Labs script must pass successfully before any update to the application is deployed to production.
* **A.12.4.1 (Event Logging)**: Review the `audit.log` file post-testing to ensure that the testing actions themselves (e.g., failed logins, scanner runs) were properly logged and hashed.

## 4. Future Testing & Development Recommendations

To further enhance the application's ISO compliance and robustness, the following areas should be tested and developed:

1. **Performance & Load Testing**: 
   - Develop tests to measure the response time of the embedded DNS server under heavy query loads (e.g., 10,000 requests/second) to ensure it doesn't become a network bottleneck.
2. **Penetration Testing**:
   - Test for JWT token vulnerabilities (e.g., token expiration enforcement, replay attacks).
   - Attempt to bypass the `lockdownMode` by manually modifying registry keys or OS-level network adapters to verify the interval-based enforcer catches it.
3. **Cross-Browser & Responsive UI Tests**:
   - Develop automated UI tests (e.g., using Playwright or Puppeteer) to verify the glassmorphism design degrades gracefully on older browsers or mobile devices.
4. **Resilience Testing (Chaos Engineering)**:
   - Simulate a crash of the NodeJS process to ensure it is automatically restarted by the OS service manager without leaking DNS requests.
