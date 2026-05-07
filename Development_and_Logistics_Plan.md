# Development & Logistics Plan: Universal Pornography Blocker

This document details the engineering structure, tooling, dependencies, APIs, and logistical planning required to build, test, and deploy the Universal Pornography Blocker suite efficiently.

## 1. Project Structure & Code Organization

To maximize efficiency and code reuse across platforms, the project will utilize a **Monorepo** architecture (e.g., managed by `Turborepo` or `Nx`).

### 1.1. Monorepo Directory Structure
```text
/porn-blocker-monorepo
 ├── /apps
 │    ├── /browser-extension    (Chrome, Firefox, Edge - TS/React)
 │    ├── /desktop-app          (Windows, macOS, Linux - Tauri/Rust)
 │    ├── /mobile-app           (iOS, Android - React Native)
 │    ├── /web-dashboard        (User management, settings - Next.js)
 │    └── /backend-api          (Node.js/Go backend services)
 ├── /packages
 │    ├── /core-logic           (Shared TS logic: auth, rules, parsing)
 │    ├── /ml-models            (Shared TensorFlow.js/CoreML wrappers)
 │    ├── /ui-components        (Shared design system - React/Tailwind)
 │    └── /config               (Shared ESLint, Prettier, TS configs)
 └── /infrastructure            (Terraform/Docker configs for deployment)
```

### 1.2. Architecture Paradigm
*   **Shared Core**: Business logic, rule parsing, and network communication live in `/packages/core-logic`.
*   **Local-First Processing**: The apps run ML models locally; the backend only handles sync and accountability features.

## 2. Dependencies & Tooling

### 2.1. Core Tech Stack
*   **Languages**: TypeScript (Frontend & Shared Core), Rust (Desktop Systems Programming), Swift/Kotlin (Mobile Systems Programming).
*   **Frameworks**: React (UI), Next.js (Web App), Tauri (Desktop), React Native (Mobile), Node.js or Go (Backend).
*   **Database**: PostgreSQL (Relational data), Redis (Fast lookups for domain blocklists).

### 2.2. Machine Learning & Filtering Dependencies
*   **nsfwjs / TensorFlow.js**: For running in-browser/in-app image analysis without sending data to a server.
*   **CoreML / ML Kit**: Native bindings for iOS and Android local image processing.
*   **Adblock Plus / uBlock Origin Core**: Open-source parsing engines for processing massive domain filter lists.

### 2.3. Development Tooling
*   **Version Control**: Git / GitHub.
*   **Package Manager**: `pnpm` or `yarn` (optimized for monorepos).
*   **Build Systems**: Vite (Web/Ext), Cargo (Rust), Metro (React Native).
*   **Linting/Formatting**: ESLint, Prettier, Husky (pre-commit hooks).

## 3. Required APIs & External Services

### 3.1. Core Application APIs
*   **Domain Categorization APIs** (Optional/Bootstrap): Cloudflare Gateway, NextDNS, or CleanBrowsing API for initial adult domain lists.
*   **Payment & Subscription API**: Stripe (for managing premium features, accountability tiers).
*   **Communication APIs**:
    *   **Twilio / SendGrid**: For SMS and email alerts to Accountability Partners.
    *   **Firebase Cloud Messaging (FCM) / APNs**: For pushing real-time configuration changes (e.g., turning on "Panic Mode") to mobile devices.

### 3.2. Infrastructure & Analytics APIs
*   **Hosting**: AWS, Google Cloud, or Vercel (for frontend/dashboard).
*   **Error Tracking**: Sentry (crucial for catching crashes in background services).
*   **Analytics**: PostHog or Mixpanel (for tracking feature usage and uninstallation attempts).

## 4. Logistics & App Store Deployment

### 4.1. The "Walled Garden" Challenge
Publishing a strict blocker requires careful navigation of app store policies:
*   **Google Chrome Web Store / Firefox Add-ons**: Relatively straightforward, but requires careful justification of broad permissions (e.g., `webRequestBlocking`, reading all page data).
*   **Apple App Store (iOS)**: Extreme scrutiny. Must use Apple's official `Screen Time API` (Family Controls) or `NEFilterDataProvider`. Cannot "hack" the system. Accountability features must heavily respect privacy policies.
*   **Google Play Store (Android)**: Scrutiny over `VpnService` and `AccessibilityService`. App must explicitly declare it is a parental control / accountability app to utilize these APIs.

### 4.2. Infrastructure Logistics
*   **Update Mechanism**: Domain lists change daily. The software needs a mechanism to download delta-updates of the blocklist via a CDN (e.g., Cloudflare) to minimize bandwidth.
*   **Customer Support**: System for users to "Whitelist" domains that are falsely flagged as adult content.

## 5. Plan for Efficiency & Productivity

To build this massive suite efficiently without getting bogged down:

### Phase 1: Establish the Monorepo & Shared Core
*   **Goal**: Write the parsing engine, account synchronization, and core blocking logic *once* in TypeScript.
*   **Outcome**: Every platform consumes the exact same core logic package.

### Phase 2: The Browser Extension MVP (Minimum Viable Product)
*   **Why**: Browser extensions are the fastest to develop, test, and deploy. They don't require compiling native code (Rust/Swift).
*   **Goal**: Prove the ML "Remover" concept and the domain blocker concept in Chrome.

### Phase 3: Automated CI/CD Pipeline
*   **Implementation**: GitHub Actions.
*   **Workflow**: Every commit automatically runs unit tests, builds the extension, compiles the Tauri desktop app, and runs UI tests.
*   **Efficiency Gain**: Zero manual building. If a core logic change breaks the Android app, the CI catches it immediately.

### Phase 4: Desktop & Mobile Native Integration
*   Only after the core logic is bulletproof do we wrap it in Tauri (Desktop) and React Native (Mobile).
*   Assign specific research spikes for OS-level tamper protection (e.g., 2 weeks dedicated purely to mastering Windows Service locking).

### 5.1. Agile Methodology
*   Work in 2-week sprints.
*   Prioritize *functionality* over UI polish in the early stages (make sure it actually blocks porn before making the dashboard look pretty).
*   Heavy reliance on automated E2E (End-to-End) testing using Playwright (Web) and Appium (Mobile) to ensure the blocker cannot be easily bypassed.
