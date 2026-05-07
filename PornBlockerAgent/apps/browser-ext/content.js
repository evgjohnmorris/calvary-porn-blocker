// Calvary Web Filter - Content Script
// Blurs images and scans for explicit keywords on the page

const EXPLICIT_KEYWORDS = [
    'porn', 'sex', 'xxx', 'nsfw', 'nude', 'naked'
];

// 1. Blur all images and videos by default
function blurMedia() {
    const mediaElements = document.querySelectorAll('img, video');
    mediaElements.forEach(el => {
        if (!el.dataset.calvaryBlurred) {
            el.style.filter = 'blur(20px)';
            el.style.transition = 'filter 0.3s ease';
            el.dataset.calvaryBlurred = 'true';
            
            // Add double-click to unblur (for accountability override feature later)
            el.addEventListener('dblclick', () => {
                const password = prompt('Enter Accountability PIN to view:');
                // Hardcoded basic pin for demo
                if (password === '1234') {
                    el.style.filter = 'none';
                }
            });
        }
    });
}

// 2. Scan text nodes for explicit words and hide them
function scanTextNodes(node) {
    if (node.nodeType === Node.TEXT_NODE) {
        const text = node.nodeValue.toLowerCase();
        if (EXPLICIT_KEYWORDS.some(kw => text.includes(kw))) {
            const parent = node.parentNode;
            if (parent && parent.nodeName !== 'SCRIPT' && parent.nodeName !== 'STYLE') {
                parent.style.backgroundColor = '#000';
                parent.style.color = '#000';
                parent.setAttribute('title', 'Content blocked by Calvary Web Filter');
            }
        }
    } else {
        for (let i = 0; i < node.childNodes.length; i++) {
            scanTextNodes(node.childNodes[i]);
        }
    }
}

// Run on load
blurMedia();
scanTextNodes(document.body);

// Observe DOM mutations to catch dynamically loaded content (e.g. infinite scrolling)
const observer = new MutationObserver((mutations) => {
    let shouldScan = false;
    for (let mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
            shouldScan = true;
            break;
        }
    }
    if (shouldScan) {
        blurMedia();
        scanTextNodes(document.body);
    }
});

observer.observe(document.body, { childList: true, subtree: true });

console.log('[Calvary Web Filter] Content script active.');
