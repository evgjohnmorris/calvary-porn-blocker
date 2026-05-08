// Dashboard Logic: Sidebar, Tabs, Settings Fetching/Updating
const Dashboard = {
    settings: null,

    init() {
        // Setup Tab Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
                e.target.classList.add('active');
                
                const tabId = e.target.getAttribute('data-tab');
                document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
                document.getElementById(tabId).classList.add('active');
            });
        });

        // Start auto-refreshing settings
        this.startPolling();
        
        // Fetch profile
        this.fetchProfile();
    },

    async fetchSettings() {
        try {
            const res = await fetch('/api/settings', {
                credentials: 'same-origin',
            });
            if (res.status === 401 || res.status === 403) {
                Auth.logout();
                return;
            }
            const data = await res.json();
            // Avoid full re-render if settings haven't changed to prevent UI flicker
            if (JSON.stringify(this.settings) !== JSON.stringify(data)) {
                this.settings = data;
                this.render();
            }
        } catch (e) {
            console.error('Failed to fetch settings', e);
        }
    },

    startPolling() {
        if (this.pollInterval) clearInterval(this.pollInterval);
        this.pollInterval = setInterval(() => this.fetchSettings(), 5000);
    },

    async updateSettings(payload) {
        try {
            const res = await fetch('/api/settings', {
                method:      'POST',
                credentials: 'same-origin',
                headers:     Auth.mutatingHeaders(),
                body:        JSON.stringify(payload),
            });
            if (res.status === 401 || res.status === 403) {
                Auth.logout();
                return;
            }
            const data = await res.json();
            if (data.success) {
                // If it's a plugin toggle, re-fetch to get the updated plugins array
                if (payload.pluginId !== undefined) {
                    await this.fetchSettings();
                } else {
                    this.settings = { ...this.settings, ...data.settings };
                    this.render();
                }
            }
        } catch (e) {
            console.error('Failed to update settings', e);
        }
    },

    render() {
        if (!this.settings) return;

        // Overview Tab
        const filterBadge = document.getElementById('overview-filter-badge');
        if (filterBadge) {
            filterBadge.className = `status-badge status-${this.settings.filterLevel}`;
            filterBadge.innerText = this.settings.filterLevel;
        }

        const lockdownBadge = document.getElementById('overview-lockdown-badge');
        const lockdownBtn = document.getElementById('overview-lockdown-btn');
        if (lockdownBadge && lockdownBtn) {
            if (this.settings.lockdownMode) {
                lockdownBadge.className = 'status-badge status-lockdown';
                lockdownBadge.innerText = 'Active';
                lockdownBtn.innerText = 'Disable Lockdown Mode';
            } else {
                lockdownBadge.className = 'status-badge status-off';
                lockdownBadge.innerText = 'Inactive';
                lockdownBtn.innerText = 'Enable Lockdown Mode';
            }
        }

        // Filtering & Plugins Tab
        const mainBlockerSwitch = document.getElementById('main-blocker-switch');
        if (mainBlockerSwitch) {
            mainBlockerSwitch.checked = (this.settings.filterLevel === 'strict' || this.settings.filterLevel === 'moderate');
        }

        const pluginsContainer = document.getElementById('plugins-list');
        if (pluginsContainer && this.settings.plugins) {
            let html = '';
            this.settings.plugins.forEach(plugin => {
                html += `
                    <div class="card flex-between" style="padding: 1rem; margin-bottom: 0.5rem;">
                        <div>
                            <div style="font-weight: 600;">${plugin.name}</div>
                            <div style="font-size: 0.8rem; color: var(--text-muted);">${plugin.description}</div>
                        </div>
                        <label class="switch">
                            <input type="checkbox" onchange="Dashboard.updateSettings({ pluginId: '${plugin.id}', pluginEnabled: this.checked })" ${plugin.enabled ? 'checked' : ''}>
                            <span></span>
                        </label>
                    </div>
                `;
            });
            pluginsContainer.innerHTML = html;
        }

        const blockedAppsContainer = document.getElementById('blocked-apps-list');
        if (blockedAppsContainer) {
            let appHtml = '';
            (this.settings.blockedApps || []).forEach((app, idx) => {
                appHtml += `<div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: rgba(255,255,255,0.05); margin-bottom: 0.5rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);">
                    <span style="font-size: 0.9rem; font-family: monospace;">${app}</span>
                    <button class="btn btn-danger" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;" onclick="Dashboard.removeBlockedApp(${idx})">Unblock</button>
                </div>`;
            });
            if (appHtml === '') appHtml = '<p style="color: var(--text-muted); font-size: 0.9rem;">No applications blocked.</p>';
            blockedAppsContainer.innerHTML = appHtml;
        }

        // Network & VPN Tab
        if (this.settings.network) {
            document.getElementById('dns-primary').value = this.settings.network.dnsPrimary || '';
            document.getElementById('dns-secondary').value = this.settings.network.dnsSecondary || '';
        }
        if (this.settings.vpn) {
            document.getElementById('vpn-host').value = this.settings.vpn.hostname || '';
            document.getElementById('vpn-hub').value = this.settings.vpn.hub || '';
            document.getElementById('vpn-port').value = this.settings.vpn.port || '';
        }

        // Personalization Tab
        if (this.settings.personalization) {
            document.getElementById('theme-select').value = this.settings.personalization.theme || 'dark';
            document.getElementById('accent-color').value = this.settings.personalization.accentColor || '#6366f1';
            
            // Apply accent color immediately
            document.documentElement.style.setProperty('--accent-color', this.settings.personalization.accentColor);
        }

        // Accountability Tab
        if (this.settings.accountability) {
            const accEnabled = document.getElementById('accountability-enabled');
            if (accEnabled) accEnabled.checked = this.settings.accountability.enabled;
            
            // SMTP Settings
            if (document.getElementById('smtp-host')) {
                document.getElementById('smtp-host').value = this.settings.accountability.smtpHost || '';
                document.getElementById('smtp-port').value = this.settings.accountability.smtpPort || '';
                document.getElementById('smtp-user').value = this.settings.accountability.smtpUser || '';
                document.getElementById('smtp-pass').value = this.settings.accountability.smtpPass || '';
            }

            // Twilio Settings
            if (document.getElementById('twilio-sid')) {
                document.getElementById('twilio-sid').value = this.settings.accountability.twilioSid || '';
                document.getElementById('twilio-auth').value = this.settings.accountability.twilioAuth || '';
                document.getElementById('twilio-from').value = this.settings.accountability.twilioFrom || '';
            }

            const partnersList = document.getElementById('partners-list');
            if (partnersList) {
                let phtml = '';
                (this.settings.accountability.partners || []).forEach((p, idx) => {
                    const emailTxt = p.email ? `📧 ${p.email}` : '';
                    const phoneTxt = p.phone ? `📱 ${p.phone}` : '';
                    phtml += `<div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: rgba(255,255,255,0.05); margin-bottom: 0.5rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);">
                        <span style="font-size: 0.9rem;">${emailTxt} ${emailTxt && phoneTxt ? '<br>' : ''}${phoneTxt}</span>
                        <button class="btn btn-danger" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;" onclick="Dashboard.removePartner(${idx})">Remove</button>
                    </div>`;
                });
                if (phtml === '') phtml = '<p style="color: var(--text-muted); font-size: 0.9rem;">No partners added.</p>';
                partnersList.innerHTML = phtml;
            }
        }
        
        // Cloud Sync 
        if (this.settings.cloudSync) {
            if (document.getElementById('cloud-sync-email')) {
                document.getElementById('cloud-sync-email').value = this.settings.cloudSync.email || '';
            }
        }
    },

    saveAccountability() {
        const enabled = document.getElementById('accountability-enabled').checked;
        const currentPartners = (this.settings.accountability && this.settings.accountability.partners) ? this.settings.accountability.partners : [];
        
        const smtpHost = document.getElementById('smtp-host') ? document.getElementById('smtp-host').value.trim() : '';
        const smtpPort = document.getElementById('smtp-port') ? parseInt(document.getElementById('smtp-port').value) : '';
        const smtpUser = document.getElementById('smtp-user') ? document.getElementById('smtp-user').value.trim() : '';
        const smtpPass = document.getElementById('smtp-pass') ? document.getElementById('smtp-pass').value.trim() : '';
        
        const twilioSid = document.getElementById('twilio-sid') ? document.getElementById('twilio-sid').value.trim() : '';
        const twilioAuth = document.getElementById('twilio-auth') ? document.getElementById('twilio-auth').value.trim() : '';
        const twilioFrom = document.getElementById('twilio-from') ? document.getElementById('twilio-from').value.trim() : '';

        this.updateSettings({ 
            accountability: { 
                enabled, 
                partners: currentPartners,
                smtpHost, smtpPort, smtpUser, smtpPass,
                twilioSid, twilioAuth, twilioFrom
            } 
        });
    },

    addPartner() {
        const emailInput = document.getElementById('new-partner-email');
        const phoneInput = document.getElementById('new-partner-phone');
        
        const email = emailInput ? emailInput.value.trim() : '';
        const phone = phoneInput ? phoneInput.value.trim() : '';
        
        if (!email && !phone) return;
        
        const enabled = document.getElementById('accountability-enabled').checked;
        const currentPartners = (this.settings.accountability && this.settings.accountability.partners) ? [...this.settings.accountability.partners] : [];
        currentPartners.push({ email, phone });
        
        if (emailInput) emailInput.value = '';
        if (phoneInput) phoneInput.value = '';
        
        this.saveAccountabilityWithPartners(enabled, currentPartners);
    },

    removePartner(index) {
        const enabled = document.getElementById('accountability-enabled').checked;
        const currentPartners = (this.settings.accountability && this.settings.accountability.partners) ? [...this.settings.accountability.partners] : [];
        currentPartners.splice(index, 1);
        
        this.saveAccountabilityWithPartners(enabled, currentPartners);
    },

    saveAccountabilityWithPartners(enabled, partners) {
        const smtpHost = document.getElementById('smtp-host') ? document.getElementById('smtp-host').value.trim() : '';
        const smtpPort = document.getElementById('smtp-port') ? parseInt(document.getElementById('smtp-port').value) : '';
        const smtpUser = document.getElementById('smtp-user') ? document.getElementById('smtp-user').value.trim() : '';
        const smtpPass = document.getElementById('smtp-pass') ? document.getElementById('smtp-pass').value.trim() : '';
        
        const twilioSid = document.getElementById('twilio-sid') ? document.getElementById('twilio-sid').value.trim() : '';
        const twilioAuth = document.getElementById('twilio-auth') ? document.getElementById('twilio-auth').value.trim() : '';
        const twilioFrom = document.getElementById('twilio-from') ? document.getElementById('twilio-from').value.trim() : '';

        this.updateSettings({ 
            accountability: { 
                enabled, 
                partners,
                smtpHost, smtpPort, smtpUser, smtpPass,
                twilioSid, twilioAuth, twilioFrom
            } 
        });
    },

    addBlockedApp() {
        const input = document.getElementById('new-blocked-app');
        const appName = input ? input.value.trim() : '';
        if (!appName) return;

        const currentApps = this.settings.blockedApps ? [...this.settings.blockedApps] : [];
        if (!currentApps.includes(appName)) {
            currentApps.push(appName);
            this.updateSettings({ blockedApps: currentApps });
        }
        if (input) input.value = '';
    },

    removeBlockedApp(index) {
        const currentApps = this.settings.blockedApps ? [...this.settings.blockedApps] : [];
        currentApps.splice(index, 1);
        this.updateSettings({ blockedApps: currentApps });
    },

    saveCloudSync() {
        const email = document.getElementById('cloud-sync-email').value.trim();
        this.updateSettings({ cloudSync: { email } });
        alert('Cloud sync account updated.');
    },

    saveNetwork() {
        const dnsPrimary = document.getElementById('dns-primary').value;
        const dnsSecondary = document.getElementById('dns-secondary').value;
        this.updateSettings({ network: { dnsPrimary, dnsSecondary } });
    },

    saveVPN() {
        const hostname = document.getElementById('vpn-host').value;
        const hub = document.getElementById('vpn-hub').value;
        const port = document.getElementById('vpn-port').value;
        this.updateSettings({ vpn: { hostname, hub, port } });
    },

    savePersonalization() {
        const theme = document.getElementById('theme-select').value;
        const accentColor = document.getElementById('accent-color').value;
        this.updateSettings({ personalization: { theme, accentColor } });
    },

    async runSystemScan() {
        const progress = document.getElementById('scan-progress');
        const resultsDiv = document.getElementById('scan-results');
        const btn = document.getElementById('scan-btn');
        const list = document.getElementById('scan-results-list');
        
        progress.style.display = 'flex';
        resultsDiv.style.display = 'none';
        btn.disabled = true;

        try {
            const res = await fetch('/api/scan', { credentials: 'same-origin' });
            const data = await res.json();
            
            progress.style.display = 'none';
            resultsDiv.style.display = 'block';
            btn.disabled = false;

            if (data.success && data.results.length > 0) {
                let html = '<ul style="list-style: none; padding: 0;">';
                data.results.forEach(r => {
                    html += `<li style="margin-bottom: 0.5rem; padding-bottom: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.1);"><span style="color: var(--danger-color); font-weight: bold;">[${r.type}]</span> ${r.detail}</li>`;
                });
                html += '</ul>';
                list.innerHTML = html;
            } else {
                list.innerHTML = '<p style="color: #10b981;">No explicit content found. System is clean!</p>';
            }
        } catch (e) {
            console.error('Scan error', e);
            progress.style.display = 'none';
            btn.disabled = false;
            list.innerHTML = '<p style="color: var(--danger-color);">Error running system scan.</p>';
            resultsDiv.style.display = 'block';
        }
    },

    async remediateFiles() {
        if (!confirm('Are you sure you want to permanently delete these files?')) return;
        try {
            const res = await fetch('/api/scan/remediate', {
                method:      'POST',
                credentials: 'same-origin',
                headers:     Auth.mutatingHeaders(),
            });
            const data = await res.json();
            alert(data.message);
        } catch(e) {
            alert('Remediation failed.');
        }
    },

    async deleteHistory() {
        if (!confirm('Are you sure you want to clear explicit browser history entries?')) return;
        try {
            const res = await fetch('/api/scan/delete_history', {
                method:      'POST',
                credentials: 'same-origin',
                headers:     Auth.mutatingHeaders(),
            });
            const data = await res.json();
            alert(data.message);
        } catch(e) {
            alert('Failed to delete browser history.');
        }
    },

    async cancelMemberships() {
        try {
            const res = await fetch('/api/scan/cancel_memberships', {
                method:      'POST',
                credentials: 'same-origin',
                headers:     Auth.mutatingHeaders(),
            });
            const data = await res.json();
            if(data.success && data.links.length > 0) {
                data.links.forEach(link => window.open(link, '_blank'));
            } else {
                alert('No active explicit subscriptions found.');
            }
        } catch(e) {
            alert('Failed to process memberships.');
        }
    },

    openHelpModal() {
        const modal = document.getElementById('help-modal');
        if(modal) modal.classList.add('active');
    },

    closeHelpModal() {
        const modal = document.getElementById('help-modal');
        if(modal) modal.classList.remove('active');
    },

    async fetchProfile() {
        try {
            const res = await fetch('/api/account/profile', {
                credentials: 'same-origin',
            });
            const data = await res.json();
            if (data.success) {
                const nameInput = document.getElementById('account-name');
                const emailInput = document.getElementById('account-email');
                const questionInput = document.getElementById('account-security-question');
                if (nameInput) nameInput.value = data.name || '';
                if (emailInput) emailInput.value = data.email || '';
                if (questionInput) questionInput.value = data.securityQuestion || '';
            }
        } catch (e) {
            console.error('Failed to fetch profile', e);
        }
    },

    async updateAccount() {
        const nameInput = document.getElementById('account-name');
        const emailInput = document.getElementById('account-email');
        const usernameInput = document.getElementById('account-username');
        const passwordInput = document.getElementById('account-password');
        const secQuestionInput = document.getElementById('account-security-question');
        const secAnswerInput = document.getElementById('account-security-answer');
        const msgDiv = document.getElementById('account-update-msg');
        
        const name = nameInput ? nameInput.value.trim() : '';
        const email = emailInput ? emailInput.value.trim() : '';
        const username = usernameInput ? usernameInput.value.trim() : '';
        const password = passwordInput ? passwordInput.value : '';
        const securityQuestion = secQuestionInput ? secQuestionInput.value.trim() : '';
        const securityAnswer = secAnswerInput ? secAnswerInput.value : '';

        if (!name && !email && !username && !password && !securityQuestion && !securityAnswer) {
            msgDiv.style.display = 'block';
            msgDiv.className = 'alert alert-error';
            msgDiv.innerText = 'No changes provided.';
            return;
        }

        try {
            const res = await fetch('/api/account/update', {
                method:      'POST',
                credentials: 'same-origin',
                headers:     Auth.mutatingHeaders(),
                body:        JSON.stringify({ name, email, username, password }),
            });
            const data = await res.json();
            
            msgDiv.style.display = 'block';
            if (data.success) {
                msgDiv.className = 'alert alert-success';
                msgDiv.innerText = data.message;
                if (usernameInput) usernameInput.value = '';
                if (passwordInput) passwordInput.value = '';
                if (secAnswerInput) secAnswerInput.value = '';
            } else {
                msgDiv.className = 'alert alert-error';
                msgDiv.innerText = data.message;
            }
        } catch(e) {
            msgDiv.style.display = 'block';
            msgDiv.className = 'alert alert-error';
            msgDiv.innerText = 'Failed to update account.';
        }
    },

    async deleteAccount() {
        const passwordInput = document.getElementById('delete-account-password');
        const password = passwordInput ? passwordInput.value : '';
        
        if (!password) {
            alert('Please enter your password to confirm account deletion.');
            return;
        }

        if (!confirm('WARNING: This will permanently delete your account, wipe all settings, and factory reset the system. This cannot be undone. Are you absolutely sure?')) return;
        
        try {
            const res = await fetch('/api/account/delete', {
                method:      'POST',
                credentials: 'same-origin',
                headers:     Auth.mutatingHeaders(),
                body:        JSON.stringify({ password }),
            });
            const data = await res.json();
            
            if (data.success) {
                alert('Account successfully deleted. System reset to factory defaults.');
                Auth.logout();
                window.location.reload();
            } else {
                alert('Failed to delete account: ' + data.message);
            }
        } catch(e) {
            alert('An error occurred during account deletion.');
        }
    },

    async generateRecoveryKey() {
        if (!confirm('Generating a new Recovery Key will invalidate your old one. Continue?')) return;
        try {
            const res = await fetch('/api/account/recovery-key', {
                credentials: 'same-origin',
            });
            const data = await res.json();
            if (data.success) {
                document.getElementById('display-recovery-key').innerText = data.recoveryKey;
                document.getElementById('recovery-key-modal').style.display = 'flex';
            } else {
                alert('Failed to generate recovery key: ' + data.message);
            }
        } catch(e) {
            alert('Failed to generate recovery key.');
        }
    }
};
