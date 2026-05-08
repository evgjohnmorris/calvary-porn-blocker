// Main App Orchestrator
const App = {
    async init() {
        const isSetup = await Auth.checkSetupStatus();
        if (!isSetup) {
            this.showView('setup-view');
            return;
        }
        // If a JWT is already in memory (restored from sessionStorage), go straight to dashboard
        if (Auth.token) {
            this.showView('dashboard-view');
        } else {
            this.showView('login-view');
        }
        Dashboard.init();
    },

    showView(viewId) {
        document.getElementById('setup-view').style.display = 'none';
        document.getElementById('login-view').style.display = 'none';
        document.getElementById('dashboard-view').style.display = 'none';
        document.getElementById('forgot-password-view').style.display = 'none';
        
        const view = document.getElementById(viewId);
        if (view) {
            if (viewId === 'dashboard-view') {
                view.style.display = 'block';
                Dashboard.fetchSettings();
            } else if (viewId === 'forgot-password-view') {
                view.style.display = 'flex';
                Auth.fetchSecurityQuestion().then(res => {
                    if (res.success && res.securityQuestion) {
                        document.getElementById('security-question-container').style.display = 'block';
                        document.getElementById('reset-security-question-text').innerText = res.securityQuestion;
                    } else {
                        document.getElementById('security-question-container').style.display = 'none';
                    }
                });
            } else {
                view.style.display = 'flex';
            }
        }
    }
};

window.addEventListener('DOMContentLoaded', () => {
    App.init();
});
