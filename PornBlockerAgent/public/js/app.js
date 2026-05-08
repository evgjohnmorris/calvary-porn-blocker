// Main App Orchestrator
const App = {
    async init() {
        // Bootstrap CSRF token before any fetch calls
        await Auth.init();

        const isSetup = await Auth.checkSetupStatus();
        if (!isSetup) {
            this.showView('setup-view');
            return;
        }

        // Without a valid httpOnly cookie the first API call to /api/settings
        // will return 401, which triggers Auth.logout() → login-view.
        this.showView('dashboard-view');
        Dashboard.init();
    },

    showView(viewId) {
        document.getElementById('setup-view').style.display         = 'none';
        document.getElementById('login-view').style.display         = 'none';
        document.getElementById('dashboard-view').style.display     = 'none';
        document.getElementById('forgot-password-view').style.display = 'none';

        const view = document.getElementById(viewId);
        if (view) {
            if (viewId === 'dashboard-view') {
                view.style.display = 'block';
                Dashboard.fetchSettings();
            } else if (viewId === 'forgot-password-view') {
                view.style.display = 'flex';
                // Security-question UI hidden — recovery key is the only supported path
                const container = document.getElementById('security-question-container');
                if (container) container.style.display = 'none';
            } else {
                view.style.display = 'flex';
            }
        }
    },
};

window.addEventListener('DOMContentLoaded', () => {
    App.init();
});
