// Auth Logic: Registration and Login flows
const Auth = {
    token: null,

    async checkSetupStatus() {
        try {
            const res = await fetch('/api/setup/status');
            const data = await res.json();
            return data.isSetup;
        } catch (e) {
            console.error('Failed to check setup status', e);
            return false;
        }
    },

    async register(username, password, name, email, securityQuestion, securityAnswer) {
        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, name, email, securityQuestion, securityAnswer })
            });
            return await res.json();
        } catch (e) {
            return { success: false, message: 'Network error' };
        }
    },

    async login(username, password) {
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (data.success) {
                this.token = data.token;
            }
            return data;
        } catch (e) {
            return { success: false, message: 'Network error' };
        }
    },

    logout() {
        this.token = null;
        App.showView('login-view');
    },

    async resetPassword(recoveryKey, securityAnswer, newPassword) {
        try {
            const res = await fetch('/api/account/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recoveryKey, securityAnswer, newPassword })
            });
            return await res.json();
        } catch (e) {
            return { success: false, message: 'Network error' };
        }
    },

    async fetchSecurityQuestion() {
        try {
            const res = await fetch('/api/account/security-question');
            return await res.json();
        } catch (e) {
            return { success: false };
        }
    }
};
