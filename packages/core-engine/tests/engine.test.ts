import { describe, it, expect } from 'vitest';
import { PornBlockerEngine } from '../src/engine.js';

describe('PornBlockerEngine', () => {
    it('should initialize with empty rules', () => {
        const engine = new PornBlockerEngine();
        expect(engine).toBeDefined();
    });

    it('should block explicit domain', () => {
        const engine = new PornBlockerEngine([
            { id: '1', type: 'domain', value: 'badsite.com' }
        ]);
        
        const result = engine.evaluateUrl('https://badsite.com/video123');
        expect(result.isBlocked).toBe(true);
        expect(result.matchedRule?.id).toBe('1');
    });

    it('should block subdomains of blocked domain', () => {
        const engine = new PornBlockerEngine([
            { id: '1', type: 'domain', value: 'badsite.com' }
        ]);
        
        const result1 = engine.evaluateUrl('https://videos.badsite.com/');
        expect(result1.isBlocked).toBe(true);

        const result2 = engine.evaluateUrl('https://deep.sub.videos.badsite.com/');
        expect(result2.isBlocked).toBe(true);
    });

    it('should allow safe domain', () => {
        const engine = new PornBlockerEngine([
            { id: '1', type: 'domain', value: 'badsite.com' }
        ]);
        
        const result = engine.evaluateUrl('https://safesite.com/');
        expect(result.isBlocked).toBe(false);
    });

    it('should identify blocked keyword in text', () => {
        const engine = new PornBlockerEngine([
            { id: '2', type: 'keyword', value: 'explicitword' }
        ]);

        const result = engine.evaluateText('This text contains an explicitword inside it.');
        expect(result.isBlocked).toBe(true);
    });
});
