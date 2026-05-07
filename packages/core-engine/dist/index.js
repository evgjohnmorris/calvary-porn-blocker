"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  PornBlockerEngine: () => PornBlockerEngine
});
module.exports = __toCommonJS(index_exports);

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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PornBlockerEngine
});
