// Main App Orchestrator
const App = {
    async init() {
        const isSetup = await Auth.checkSetupStatus();
        if (isSetup) {
            this.showView('login-view');
        } else {
            this.showView('setup-view');
        }
        Dashboard.init();
    },

    showView(viewId) {
        document.getElementById('setup-view').style.display = 'none';
        document.getElementById('login-view').style.display = 'none';
        document.getElementById('dashboard-view').style.display = 'none';
        
        const view = document.getElementById(viewId);
        if (view) {
            if (viewId === 'dashboard-view') {
                view.style.display = 'block';
                Dashboard.fetchSettings();
            } else {
                view.style.display = 'flex';
            }
        }
    }
};

window.addEventListener('DOMContentLoaded', () => {
    App.init();
});
