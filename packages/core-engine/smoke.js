import { PornBlockerEngine } from './dist/index.js';

console.log("🔥 Starting Smoke Test...");

try {
    // Initialize the engine with some basic rules
    const engine = new PornBlockerEngine([
        { id: '1', type: 'domain', value: 'explicit-example.com' },
        { id: '2', type: 'keyword', value: 'adult-content' }
    ]);

    console.log("✅ Engine successfully instantiated from compiled code.");

    // Test a blocked domain
    const urlResult = engine.evaluateUrl('https://explicit-example.com/video');
    if (urlResult.isBlocked) {
        console.log("✅ Domain Blocking is working!");
    } else {
        console.error("❌ Domain Blocking FAILED.");
        process.exit(1);
    }

    // Test a safe domain
    const safeResult = engine.evaluateUrl('https://google.com/search');
    if (!safeResult.isBlocked) {
        console.log("✅ Safe Domains are allowed!");
    } else {
        console.error("❌ Safe Domain Blocking FAILED.");
        process.exit(1);
    }

    // Test text evaluation
    const textResult = engine.evaluateText('Warning: adult-content ahead.');
    if (textResult.isBlocked) {
        console.log("✅ Keyword Blocking is working!");
    } else {
        console.error("❌ Keyword Blocking FAILED.");
        process.exit(1);
    }

    console.log("🚀 SMOKE TEST PASSED PERFECTLY!");
    process.exit(0);

} catch (e) {
    console.error("❌ Smoke test crashed:", e);
    process.exit(1);
}
