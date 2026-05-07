export type RuleType = 'domain' | 'keyword' | 'regex';

export interface Rule {
    id: string;
    type: RuleType;
    value: string;
    description?: string;
}

export interface EvaluationResult {
    isBlocked: boolean;
    matchedRule?: Rule;
}
