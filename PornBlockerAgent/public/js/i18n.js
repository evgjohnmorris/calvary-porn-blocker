const i18n = {
    locale: 'en',
    translations: {},
    supportedLocales: ['en', 'es', 'fr'],

    async init() {
        const savedLocale = localStorage.getItem('i18n_locale');
        if (savedLocale && this.supportedLocales.includes(savedLocale)) {
            this.locale = savedLocale;
        } else {
            const browserLocale = navigator.language.split('-')[0];
            if (this.supportedLocales.includes(browserLocale)) {
                this.locale = browserLocale;
            }
        }
        await this.loadLanguage(this.locale);
    },

    async loadLanguage(lang) {
        try {
            const response = await fetch(`/locales/${lang}.json`);
            if (response.ok) {
                this.translations = await response.json();
                this.locale = lang;
                localStorage.setItem('i18n_locale', lang);
                document.documentElement.lang = lang;
                this.translatePage();
            } else {
                console.error(`Failed to load language: ${lang}`);
            }
        } catch (e) {
            console.error('Error loading translations:', e);
        }
    },

    setLanguage(lang) {
        if (this.supportedLocales.includes(lang)) {
            this.loadLanguage(lang);
        }
    },

    t(keyPath) {
        const keys = keyPath.split('.');
        let value = this.translations;
        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                return keyPath; // fallback to key path if not found
            }
        }
        return value;
    },

    translatePage() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = this.t(key);
            
            if (translation !== key) {
                // If it's an input or textarea, we likely want to translate the placeholder
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    if (el.hasAttribute('placeholder')) {
                        el.setAttribute('placeholder', translation);
                    } else if (el.type === 'submit' || el.type === 'button') {
                        el.value = translation;
                    }
                } else {
                    el.innerText = translation;
                }
            }
        });
    },

    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat(this.locale, {
                dateStyle: 'medium',
                timeStyle: 'short'
            }).format(date);
        } catch (e) {
            return dateString;
        }
    },

    formatNumber(number) {
        try {
            return new Intl.NumberFormat(this.locale).format(number);
        } catch (e) {
            return number;
        }
    }
};

window.i18n = i18n;
