const fs = require('fs');
const path = require('path');

describe('SEO Smoke Tests', () => {
  const checkSEO = (filePath) => {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for standard SEO meta tags
    expect(content).toMatch(/<meta name="description" content=".*?"\s*\/?>/i);
    expect(content).toMatch(/<meta name="keywords" content=".*?"\s*\/?>/i);
    
    // Check for Open Graph tags
    expect(content).toMatch(/<meta property="og:title" content=".*?"\s*\/?>/i);
    expect(content).toMatch(/<meta property="og:description" content=".*?"\s*\/?>/i);
    
    // Check for Twitter Card tags
    expect(content).toMatch(/<meta name="twitter:card" content=".*?"\s*\/?>/i);
    expect(content).toMatch(/<meta name="twitter:title" content=".*?"\s*\/?>/i);
    expect(content).toMatch(/<meta name="twitter:description" content=".*?"\s*\/?>/i);
  };

  it('should have SEO tags in Calvary Blocker/public/index.html', () => {
    const p = path.join(__dirname, '../public/index.html');
    if (fs.existsSync(p)) {
      checkSEO(p);
    } else {
      console.warn('public/index.html not found, skipping');
    }
  });

  it('should have SEO tags in apps/browser-ext/index.html', () => {
    const p = path.join(__dirname, '../../apps/browser-ext/index.html');
    if (fs.existsSync(p)) {
      checkSEO(p);
    } else {
      console.warn('browser-ext/index.html not found, skipping');
    }
  });

  it('should have SEO tags in docs/index.html', () => {
    const p = path.join(__dirname, '../../docs/index.html');
    if (fs.existsSync(p)) {
      checkSEO(p);
    } else {
      console.warn('docs/index.html not found, skipping');
    }
  });
});
