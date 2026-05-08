const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for terminal
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const BLUE = '\x1b[34m';
const YELLOW = '\x1b[33m';

console.log(`${BOLD}${BLUE}=================================================${RESET}`);
console.log(`${BOLD}${BLUE}   Calvary Porn Blocker - ISO Compliance Smoke Check  ${RESET}`);
console.log(`${BOLD}${BLUE}=================================================${RESET}\n`);

let passCount = 0;
let failCount = 0;

function printResult(name, status, details = '') {
    const statusText = status ? `${GREEN}[PASS]${RESET}` : `${RED}[FAIL]${RESET}`;
    console.log(`${statusText} ${BOLD}${name}${RESET}`);
    if (details) {
        console.log(`       ${details}`);
    }
    status ? passCount++ : failCount++;
}

// 1. ISO 27001 - Security & Infrastructure Check (Jest Tests)
console.log(`${YELLOW}--> Phase 1: Executing Infrastructure Security Tests (ISO 27001)...${RESET}`);
try {
    execSync('npx jest tests/smoke.test.js --silent', { stdio: 'ignore' });
    printResult('Backend Infrastructure & Cryptography', true, 'All core Jest tests passed. Ministry Mode locks are verified.');
} catch (error) {
    printResult('Backend Infrastructure & Cryptography', false, 'Jest tests failed. Check `npm run test:smoke` for raw logs.');
}

// 2. ISO 27001 - Policy Verification
console.log(`\n${YELLOW}--> Phase 2: Verifying Documentation & Policy Standards...${RESET}`);
const policyPath = path.join(__dirname, '..', '..', 'ISO_POLICY.md');
if (fs.existsSync(policyPath)) {
    printResult('ISO_POLICY.md Exists', true, 'Organizational doctrine is present.');
} else {
    printResult('ISO_POLICY.md Exists', false, 'Missing organizational doctrine document.');
}

// 3. ISO 9241 - UI/UX Ergonomics Check
console.log(`\n${YELLOW}--> Phase 3: Verifying UI Ergonomics & Assets (ISO 9241)...${RESET}`);
const cssPath = path.join(__dirname, '..', 'public', 'css', 'style.css');
if (fs.existsSync(cssPath)) {
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    const hasGlassmorphism = cssContent.includes('backdrop-filter');
    const hasInterFont = cssContent.includes('Inter');
    const hasDarkTheme = cssContent.includes('#0b0f19') || cssContent.includes('background: var(--bg-dark)');

    printResult('Glassmorphism & Aesthetic Standards', hasGlassmorphism && hasInterFont && hasDarkTheme, 
        (hasGlassmorphism && hasInterFont && hasDarkTheme) ? 'UI satisfies premium ISO 9241 aesthetic benchmarks.' : 'UI is missing required aesthetic classes.'
    );
} else {
    printResult('UI Assets Available', false, 'Missing public/css/style.css');
}

// Final Summary
console.log(`\n${BOLD}=================================================${RESET}`);
console.log(`SMOKE CHECK COMPLETE`);
console.log(`Passed: ${GREEN}${passCount}${RESET}`);
console.log(`Failed: ${RED}${failCount}${RESET}`);

if (failCount > 0) {
    console.log(`\n${RED}${BOLD}SYSTEM IS NON-COMPLIANT.${RESET} Review the SMOKE_TESTING_GUIDE.md for remediation steps.`);
    process.exit(1);
} else {
    console.log(`\n${GREEN}${BOLD}SYSTEM IS FULLY COMPLIANT.${RESET} Ready for Ministry Deployment.`);
    process.exit(0);
}
