import { PornBlockerEngine } from '@pb/core-engine';

// Initialize the engine with some dummy rules for demonstration
const engine = new PornBlockerEngine([
    { id: '1', type: 'keyword', value: 'explicitword' },
    { id: '2', type: 'keyword', value: 'nsfwcontent' }
]);

console.log('Porn Blocker Content Script Initialized');

function evaluateAndObfuscate() {
    let newObfuscatedCount = 0;

    // Process text nodes
    const textNodes = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let currentNode;
    while ((currentNode = textNodes.nextNode())) {
        if (currentNode.nodeValue && currentNode.parentElement && currentNode.parentElement.tagName !== 'SCRIPT' && currentNode.parentElement.tagName !== 'STYLE') {
            const result = engine.evaluateText(currentNode.nodeValue);
            if (result.isBlocked) {
                console.log(`Blocked text content found matching rule: ${result.matchedRule?.value}`);
                currentNode.nodeValue = currentNode.nodeValue.replace(new RegExp(result.matchedRule!.value, 'gi'), '[REDACTED]');
                newObfuscatedCount++;
            }
        }
    }

    // Process images
    const mediaElements = document.querySelectorAll('img, video, picture');
    mediaElements.forEach((el) => {
        // Skip already blurred ones to avoid duplicate counts
        if ((el as HTMLElement).style.filter === 'blur(20px)') return;
        
        const src = el.getAttribute('src') || '';
        const alt = el.getAttribute('alt') || '';
        const title = el.getAttribute('title') || '';
        const textToEvaluate = `${src} ${alt} ${title}`;
        
        const result = engine.evaluateText(textToEvaluate);
        if (result.isBlocked) {
            console.log(`Blocked media content found matching rule: ${result.matchedRule?.value}`);
            (el as HTMLElement).style.filter = 'blur(20px)';
            newObfuscatedCount++;
        }
    });

    if (newObfuscatedCount > 0) {
        chrome.storage.local.get(['obfuscatedCount'], (result) => {
            const currentCount = typeof result.obfuscatedCount === 'number' ? result.obfuscatedCount : 0;
            chrome.storage.local.set({ obfuscatedCount: currentCount + newObfuscatedCount });
        });
    }
}

// Run initially
evaluateAndObfuscate();
enforceRedditSafeSearch();

// Observe for DOM mutations to run on newly added content
const observer = new MutationObserver((mutations) => {
    let shouldEvaluate = false;
    for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
            shouldEvaluate = true;
            break;
        }
    }
    
    if (shouldEvaluate) {
        evaluateAndObfuscate();
    }
});

observer.observe(document.body, { childList: true, subtree: true });

function enforceRedditSafeSearch() {
    if (!window.location.hostname.includes('reddit.com')) return;

    // Enforce SafeSearch cookies
    document.cookie = "over18=0; domain=.reddit.com; path=/; max-age=31536000";
    document.cookie = "safe_search=1; domain=.reddit.com; path=/; max-age=31536000";
    
    // Continuously check for the "Show mature content" toggle in settings
    setInterval(() => {
        // Find elements that contain the text
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let node;
        const labels = [];
        while ((node = walker.nextNode())) {
            if (node.nodeValue?.includes("Show mature content (I'm over 18)") || 
                node.nodeValue?.includes("Show mature content")) {
                if (node.parentElement) labels.push(node.parentElement);
            }
        }
        
        for (const label of labels) {
            // Traverse up to find the row container
            let container = label.parentElement;
            for (let i = 0; i < 4; i++) {
                if (container && (container.querySelector('button[role="switch"]') || container.querySelector('input[type="checkbox"]'))) {
                    break;
                }
                container = container?.parentElement || null;
            }
            
            if (container) {
                const switchEl = container.querySelector('button[role="switch"], input[type="checkbox"]');
                if (switchEl) {
                    const isChecked = switchEl.getAttribute('aria-checked') === 'true' || (switchEl as HTMLInputElement).checked;
                    
                    if (isChecked) {
                        // Attempt to click it to turn it off
                        (switchEl as HTMLElement).click();
                        console.log("Calvary Blocker: Turned off Reddit mature content toggle.");
                    }
                    
                    // Disable user interaction
                    (switchEl as HTMLElement).style.pointerEvents = 'none';
                    (switchEl as HTMLElement).style.opacity = '0.5';
                    
                    // Add an indicator badge if not already added
                    if (!container.querySelector('.pb-lock')) {
                        const lock = document.createElement('span');
                        lock.className = 'pb-lock';
                        lock.innerHTML = ' 🔒 (Locked by Calvary Blocker)';
                        lock.style.color = '#ff4444';
                        lock.style.fontSize = '12px';
                        lock.style.fontWeight = 'bold';
                        lock.style.marginLeft = '8px';
                        label.appendChild(lock);
                    }
                }
            }
        }
    }, 1000);
}
