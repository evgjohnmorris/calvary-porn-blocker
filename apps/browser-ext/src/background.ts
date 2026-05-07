/// <reference types="chrome"/>

console.log('Porn Blocker Background Service Worker Initialized');

chrome.runtime.onInstalled.addListener(() => {
    console.log('Porn Blocker Installed');
    chrome.storage.local.set({ blockedCount: 0, obfuscatedCount: 0 });
});

// For MV3, tracking blocked requests requires declarativeNetRequestFeedback permission.
// Note: onRuleMatchedDebug is only available for unpacked extensions or with activeTab permissions sometimes,
// but it is the best way to track DNR blocks.
if (chrome.declarativeNetRequest && chrome.declarativeNetRequest.onRuleMatchedDebug) {
    chrome.declarativeNetRequest.onRuleMatchedDebug.addListener((info) => {
        console.log('Blocked request:', info.request.url, 'by rule:', info.rule.ruleId);
        chrome.storage.local.get(['blockedCount'], (result) => {
            const currentCount = (typeof result.blockedCount === 'number' ? result.blockedCount : 0);
            chrome.storage.local.set({ blockedCount: currentCount + 1 });
        });
    });
}
