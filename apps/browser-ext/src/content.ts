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
