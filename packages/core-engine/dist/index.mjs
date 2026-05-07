// src/engine.ts
var PornBlockerEngine = class {
  exactDomains = /* @__PURE__ */ new Set();
  keywords = [];
  originalRules = [];
  // Store original rules for returning the matchedRule
  constructor(initialRules = []) {
    initialRules.forEach((rule) => this.addRule(rule));
  }
  addRule(rule) {
    this.originalRules.push(rule);
    if (rule.type === "domain") {
      this.exactDomains.add(rule.value.toLowerCase());
    } else if (rule.type === "keyword") {
      this.keywords.push(rule);
    }
  }
  evaluateUrl(url) {
    try {
      const parsedUrl = new URL(url);
      let hostname = parsedUrl.hostname.toLowerCase();
      const parts = hostname.split(".");
      for (let i = 0; i < parts.length; i++) {
        const domainToCheck = parts.slice(i).join(".");
        if (this.exactDomains.has(domainToCheck)) {
          const matchedRule = this.originalRules.find((r) => r.type === "domain" && r.value.toLowerCase() === domainToCheck);
          return { isBlocked: true, matchedRule };
        }
      }
      return { isBlocked: false };
    } catch (error) {
      return { isBlocked: false };
    }
  }
  // Future expansion for text evaluation
  evaluateText(text) {
    const lowerText = text.toLowerCase();
    for (const rule of this.keywords) {
      if (lowerText.includes(rule.value.toLowerCase())) {
        return { isBlocked: true, matchedRule: rule };
      }
    }
    return { isBlocked: false };
  }
};
export {
  PornBlockerEngine
};
