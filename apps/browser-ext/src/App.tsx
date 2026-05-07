import { useState, useEffect } from 'react';
import './index.css';

function App() {
  const [stats, setStats] = useState({ blockedCount: 0, obfuscatedCount: 0 });

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['blockedCount', 'obfuscatedCount'], (result) => {
        setStats({
          blockedCount: typeof result.blockedCount === 'number' ? result.blockedCount : 0,
          obfuscatedCount: typeof result.obfuscatedCount === 'number' ? result.obfuscatedCount : 0
        });
      });

      // Listen for changes
      const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
        setStats(prev => ({
          blockedCount: changes.blockedCount && typeof changes.blockedCount.newValue === 'number' ? changes.blockedCount.newValue : prev.blockedCount,
          obfuscatedCount: changes.obfuscatedCount && typeof changes.obfuscatedCount.newValue === 'number' ? changes.obfuscatedCount.newValue : prev.obfuscatedCount
        }));
      };
      chrome.storage.onChanged.addListener(listener);
      return () => chrome.storage.onChanged.removeListener(listener);
    }
  }, []);

  return (
    <div className="popup-container">
      <header className="header">
        <h1>Porn Blocker</h1>
        <div className="status-badge">
          <div className="pulse-dot"></div>
          Active
        </div>
      </header>

      <main className="main-card">
        <div className="shield-icon-wrapper">
          <div className="shield-ring"></div>
          <svg className="shield-icon" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M12 1.5a.75.75 0 01.353.088l8.25 4.5a.75.75 0 01.397.662v6.618c0 4.148-2.607 7.92-6.52 9.61a.75.75 0 01-.66 0c-3.913-1.69-6.52-5.462-6.52-9.61V6.75a.75.75 0 01.397-.662l8.25-4.5A.75.75 0 0112 1.5zm.75 8a.75.75 0 00-1.5 0v3.5a.75.75 0 001.5 0v-3.5zm-.75 6.75a1 1 0 110-2 1 1 0 010 2z" clipRule="evenodd" />
          </svg>
        </div>
        
        <h2 className="card-title">Network Protected</h2>
        <p className="card-subtitle">
          Engine is active. Real-time DOM scanning and DNS filtering enabled.
        </p>
      </main>

      <footer className="footer">
        <div className="stats-row">
          <span>Domains Blocked: <span className="stat-value">{stats.blockedCount}</span></span>
          <span>Content Obfuscated: <span className="stat-value">{stats.obfuscatedCount}</span></span>
        </div>
        <button className="btn btn-primary" onClick={() => window.open(chrome.runtime.getURL('options.html'))}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"></path>
          </svg>
          Configure Rules
        </button>
      </footer>
    </div>
  );
}

export default App;
