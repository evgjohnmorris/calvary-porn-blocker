import { Rule, EvaluationResult } from './rules/types.js';

export class PornBlockerEngine {
    private exactDomains: Set<string> = new Set();
    private keywords: Rule[] = [];
    private originalRules: Rule[] = []; // Store original rules for returning the matchedRule

    constructor(initialRules: Rule[] = []) {
        initialRules.forEach(rule => this.addRule(rule));
    }

    public addRule(rule: Rule): void {
        this.originalRules.push(rule);
        if (rule.type === 'domain') {
            this.exactDomains.add(rule.value.toLowerCase());
        } else if (rule.type === 'keyword') {
            this.keywords.push(rule);
        }
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
    
    // Future expansion for text evaluation
    public evaluateText(text: string): EvaluationResult {
        const lowerText = text.toLowerCase();
        for (const rule of this.keywords) {
            if (lowerText.includes(rule.value.toLowerCase())) {
                 return { isBlocked: true, matchedRule: rule };
            }
        }
        return { isBlocked: false };
    }
}
