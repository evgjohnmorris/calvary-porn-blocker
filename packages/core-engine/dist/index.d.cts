type RuleType = 'domain' | 'keyword' | 'regex';
interface Rule {
    id: string;
    type: RuleType;
    value: string;
    description?: string;
}
interface EvaluationResult {
    isBlocked: boolean;
    matchedRule?: Rule;
}

declare class PornBlockerEngine {
    private exactDomains;
    private keywords;
    private originalRules;
    constructor(initialRules?: Rule[]);
    private keywordRegex;
    private keywordRegexNeedsUpdate;
    addRule(rule: Rule): void;
    private updateKeywordRegex;
    evaluateUrl(url: string): EvaluationResult;
    evaluateText(text: string): EvaluationResult;
}

export { type EvaluationResult, PornBlockerEngine, type Rule, type RuleType };
