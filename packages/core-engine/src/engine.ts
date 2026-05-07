import { Rule, EvaluationResult } from './rules/types.js';

export class PornBlockerEngine {
    private exactDomains: Set<string> = new Set();
    private keywords: Rule[] = [];
    private originalRules: Rule[] = []; // Store original rules for returning the matchedRule

    constructor(initialRules: Rule[] = []) {
        initialRules.forEach(rule => this.addRule(rule));
    }

    private keywordRegex: RegExp | null = null;
    private keywordRegexNeedsUpdate: boolean = false;

    public addRule(rule: Rule): void {
        this.originalRules.push(rule);
        if (rule.type === 'domain') {
            this.exactDomains.add(rule.value.toLowerCase());
        } else if (rule.type === 'keyword') {
            this.keywords.push(rule);
            this.keywordRegexNeedsUpdate = true;
        }
    }

    private updateKeywordRegex(): void {
        if (this.keywords.length === 0) {
            this.keywordRegex = null;
            this.keywordRegexNeedsUpdate = false;
            return;
        }
        
        // Escape keywords for regex and join them with OR |
        const escapedKeywords = this.keywords.map(k => k.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        try {
            this.keywordRegex = new RegExp(`(${escapedKeywords.join('|')})`, 'i');
        } catch (e) {
            // Fallback if regex is too large or fails
            this.keywordRegex = null;
        }
        this.keywordRegexNeedsUpdate = false;
    }

    public evaluateUrl(url: string): EvaluationResult {
        try {
            const parsedUrl = new URL(url);
            let hostname = parsedUrl.hostname.toLowerCase();

            // Hierarchical check
            // E.g., ads.badsite.com -> check ads.badsite.com, then badsite.com
            const parts = hostname.split('.');
            for (let i = 0; i < parts.length; i++) {
                const domainToCheck = parts.slice(i).join('.');
                if (this.exactDomains.has(domainToCheck)) {
                    // Find the original rule to return
                    const matchedRule = this.originalRules.find(r => r.type === 'domain' && r.value.toLowerCase() === domainToCheck);
                    return { isBlocked: true, matchedRule: matchedRule };
                }
            }

            return { isBlocked: false };
        } catch (error) {
            // If URL parsing fails, default to not blocking as it's not a valid URL
            return { isBlocked: false };
        }
    }
    
    // Optimized text evaluation
    public evaluateText(text: string): EvaluationResult {
        if (this.keywordRegexNeedsUpdate) {
            this.updateKeywordRegex();
        }

        if (this.keywordRegex) {
            const match = text.match(this.keywordRegex);
            if (match && match[0]) {
                const matchedString = match[0].toLowerCase();
                const matchedRule = this.keywords.find(r => matchedString === r.value.toLowerCase());
                return { isBlocked: true, matchedRule: matchedRule };
            }
            return { isBlocked: false };
        }

        // Fallback to loop if regex compilation failed (e.g. too many keywords)
        const lowerText = text.toLowerCase();
        for (const rule of this.keywords) {
            if (lowerText.includes(rule.value.toLowerCase())) {
                 return { isBlocked: true, matchedRule: rule };
            }
        }
        return { isBlocked: false };
    }
}
