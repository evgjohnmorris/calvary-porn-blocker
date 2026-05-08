// Auth Logic: Registration and Login flows
// JWT is now stored in an httpOnly cookie set by the server — never in JS-land.
// All mutating requests include X-CSRF-Token fetched from /api/csrf-token.
const Auth = {
    // CSRF token bootstrapped at startup; refreshed on page load.
    _csrfToken: null,

    async init() {
        try {
            const res  = await fetch('/api/csrf-token');
            const data = await res.json();
            this._csrfToken = data.csrfToken || null;
        } catch (e) {
            console.warn('[Auth] Could not fetch CSRF token:', e);
        }
    },

    // Returns headers for mutating requests (POST, DELETE, etc.)
    mutatingHeaders() {
        const h = { 'Content-Type': 'application/json' };
        if (this._csrfToken) h['X-CSRF-Token'] = this._csrfToken;
        return h;
    },

    async checkSetupStatus() {
        try {
            const res  = await fetch('/api/setup/status');
            const data = await res.json();
            return data.isSetup;
        } catch (e) {
            console.error('Failed to check setup status', e);
            return false;
        }
    },

    async register(username, password, name, email) {
        try {
            const res = await fetch('/api/register', {
                method:  'POST',
                headers: this.mutatingHeaders(),
                body:    JSON.stringify({ username, password, name, email }),
            });
            return await res.json();
        } catch (e) {
            return { success: false, message: 'Network error' };
        }
    },

    async login(username, password) {
        try {
            const res = await fetch('/api/login', {
                method:      'POST',
                credentials: 'same-origin', // Allow the server to set the httpOnly cookie
                headers:     this.mutatingHeaders(),
                body:        JSON.stringify({ username, password }),
            });
            const data = await res.json();
            // No token in response body — cookie is set automatically by the server.
            return data;
        } catch (e) {
            return { success: false, message: 'Network error' };
        }
    },

    async logout() {
        try {
            await fetch('/api/logout', {
                method:      'POST',
                credentials: 'same-origin',
                headers:     this.mutatingHeaders(),
            });
        } catch (e) {
            // Best-effort; navigate away regardless
        }
        App.showView('login-view');
    },

    async resetPassword(recoveryKey, newPassword) {
        try {
            const res = await fetch('/api/account/reset-password', {
                method:  'POST',
                headers: this.mutatingHeaders(),
                body:    JSON.stringify({ recoveryKey, newPassword }),
            });
            return await res.json();
        } catch (e) {
            return { success: false, message: 'Network error' };
        }
    },

    // Security-question recovery was removed (server returns 410).
    // Kept as a no-op so any legacy HTML references don't throw.
    async fetchSecurityQuestion() {
        return { success: false, deprecated: true };
    },
};
