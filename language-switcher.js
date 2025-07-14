// MindSage Language Switcher
// Professional language switching functionality with RTL support

class LanguageSwitcher {
    constructor() {
        this.currentLanguage = this.getStoredLanguage() || 'en';
        this.init();
    }

    init() {
        this.createLanguageSwitcher();
        this.bindEvents();
        this.applyLanguage(this.currentLanguage);
    }

    getStoredLanguage() {
        return localStorage.getItem('mindsage-language');
    }

    setStoredLanguage(lang) {
        localStorage.setItem('mindsage-language', lang);
    }

    createLanguageSwitcher() {
        // Find the nav-buttons container
        const navButtons = document.querySelector('.nav-buttons');
        if (!navButtons) return;

        // Create language switcher HTML
        const languageSwitcherHTML = `
            <div class="language-switcher">
                <button class="language-btn" id="languageBtn" aria-haspopup="true" aria-expanded="false">
                    <span class="flag" id="currentFlag">${languageConfig[this.currentLanguage].flag}</span>
                    <span class="lang-text" id="currentLang">${languageConfig[this.currentLanguage].name}</span>
                    <i class="fas fa-chevron-down" id="languageChevron"></i>
                </button>
                <div class="language-dropdown" id="languageDropdown" role="menu">
                    ${Object.entries(languageConfig).map(([code, config]) => `
                        <button 
                            class="language-option ${code === this.currentLanguage ? 'active' : ''}" 
                            data-lang="${code}"
                            role="menuitem"
                        >
                            <span class="flag">${config.flag}</span>
                            <span class="lang-text">${config.name}</span>
                            ${code === this.currentLanguage ? '<i class="fas fa-check"></i>' : ''}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        // Insert before the login button
        navButtons.insertAdjacentHTML('afterbegin', languageSwitcherHTML);
    }

    bindEvents() {
        const languageBtn = document.getElementById('languageBtn');
        const languageDropdown = document.getElementById('languageDropdown');
        const languageOptions = document.querySelectorAll('.language-option');

        if (!languageBtn) return;

        // Toggle dropdown
        languageBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown();
        });

        // Handle language selection
        languageOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const selectedLang = e.currentTarget.dataset.lang;
                this.changeLanguage(selectedLang);
            });
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.language-switcher')) {
                this.closeDropdown();
            }
        });

        // Handle keyboard navigation
        languageBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggleDropdown();
            }
        });

        // Escape key to close dropdown
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeDropdown();
            }
        });
    }

    toggleDropdown() {
        const dropdown = document.getElementById('languageDropdown');
        const chevron = document.getElementById('languageChevron');
        const btn = document.getElementById('languageBtn');
        
        const isOpen = dropdown.classList.contains('active');
        
        if (isOpen) {
            this.closeDropdown();
        } else {
            dropdown.classList.add('active');
            chevron.style.transform = 'rotate(180deg)';
            btn.setAttribute('aria-expanded', 'true');
        }
    }

    closeDropdown() {
        const dropdown = document.getElementById('languageDropdown');
        const chevron = document.getElementById('languageChevron');
        const btn = document.getElementById('languageBtn');
        
        if (dropdown) {
            dropdown.classList.remove('active');
            chevron.style.transform = 'rotate(0deg)';
            btn.setAttribute('aria-expanded', 'false');
        }
    }

    changeLanguage(newLang) {
        this.currentLanguage = newLang;
        this.setStoredLanguage(newLang);
        this.updateSwitcherUI();
        this.applyLanguage(newLang);
        this.closeDropdown();
    }

    updateSwitcherUI() {
        const currentFlag = document.getElementById('currentFlag');
        const currentLang = document.getElementById('currentLang');
        const options = document.querySelectorAll('.language-option');

        if (currentFlag && currentLang) {
            currentFlag.textContent = languageConfig[this.currentLanguage].flag;
            currentLang.textContent = languageConfig[this.currentLanguage].name;
        }

        // Update active states
        options.forEach(option => {
            const lang = option.dataset.lang;
            const checkIcon = option.querySelector('.fas.fa-check');
            
            if (lang === this.currentLanguage) {
                option.classList.add('active');
                if (!checkIcon) {
                    option.insertAdjacentHTML('beforeend', '<i class="fas fa-check"></i>');
                }
            } else {
                option.classList.remove('active');
                if (checkIcon) {
                    checkIcon.remove();
                }
            }
        });
    }

    applyLanguage(lang) {
        const translation = translations[lang];
        if (!translation) return;

        // Update document language and direction
        document.documentElement.lang = languageConfig[lang].code;
        document.documentElement.dir = languageConfig[lang].dir;
        document.body.className = `${document.body.className.replace(/\blang-\w+/g, '')} lang-${lang}`.trim();

        // Update meta tags and title
        this.updateMetaTags(translation, lang);

        // Apply translations to elements with data-translate attributes
        this.translateElements(translation);
        
        // Update specific elements by ID or class
        this.updateSpecificElements(translation);

        // Add RTL class for styling
        if (languageConfig[lang].dir === 'rtl') {
            document.body.classList.add('rtl');
        } else {
            document.body.classList.remove('rtl');
        }

        // Dispatch language change event
        document.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language: lang, translation }
        }));
    }

    updateMetaTags(translation, lang) {
        // Update page title
        const title = translation.pageTitle || 'MindSage - Your Mind Deserves Peace';
        document.title = title;

        // Update meta description
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && translation.metaDescription) {
            metaDesc.setAttribute('content', translation.metaDescription);
        }

        // Update Open Graph tags if they exist
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle && translation.pageTitle) {
            ogTitle.setAttribute('content', translation.pageTitle);
        }

        const ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc && translation.metaDescription) {
            ogDesc.setAttribute('content', translation.metaDescription);
        }
    }

    translateElements(translation) {
        // Translate elements with data-translate attributes
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.dataset.translate;
            if (translation[key]) {
                if (element.tagName === 'INPUT' && element.type === 'submit') {
                    element.value = translation[key];
                } else {
                    element.textContent = translation[key];
                }
            }
        });
    }

    updateSpecificElements(translation) {
        // Navigation items
        const navItems = [
            { selector: 'a[href="index.html"]', key: 'home' },
            { selector: 'a[href="chatbot.html"]', key: 'aiChatbot' },
            { selector: 'a[href="retell.html"]', key: 'emdrSession' },
            { selector: 'a[href="cbt-exercises.html"]', key: 'cbtExercises' },
            { selector: 'a[href="mindsage-community-super-edit.html"]', key: 'community' },
            { selector: 'a[href="pricing.html"]', key: 'pricing' },
            { selector: 'a[href="terms.html"]', key: 'terms' },
            { selector: 'a[href="dashboard-mindsage"]', key: 'dashboard' },
            { selector: '.btn-login', key: 'login' }
        ];

        navItems.forEach(item => {
            const element = document.querySelector(item.selector);
            if (element && translation[item.key]) {
                // For nav links, update the text content but preserve structure
                const textNode = Array.from(element.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
                if (textNode) {
                    textNode.textContent = translation[item.key];
                } else {
                    element.textContent = translation[item.key];
                }
            }
        });

        // Hero section
        const heroTitle = document.querySelector('.hero-title');
        if (heroTitle) {
            const gradientSpan = heroTitle.querySelector('.gradient-text');
            if (gradientSpan) {
                // Update both parts of the title
                const titleText = heroTitle.firstChild;
                if (titleText && titleText.nodeType === Node.TEXT_NODE) {
                    titleText.textContent = translation.heroTitle + ' ';
                }
                gradientSpan.textContent = translation.heroTitleGradient;
            }
        }

        const heroSubtitle = document.querySelector('.hero-subtitle');
        if (heroSubtitle && translation.heroSubtitle) {
            heroSubtitle.textContent = translation.heroSubtitle;
        }

        const startSessionBtn = document.querySelector('.btn-hero');
        if (startSessionBtn && translation.startSession) {
            // Preserve the icon
            const icon = startSessionBtn.querySelector('i');
            startSessionBtn.innerHTML = `${icon ? icon.outerHTML : ''} ${translation.startSession}`;
        }

        const noCardText = document.querySelector('.hero-reassurance');
        if (noCardText && translation.noCardRequired) {
            const icon = noCardText.querySelector('i');
            noCardText.innerHTML = `${icon ? icon.outerHTML : ''} ${translation.noCardRequired}`;
        }

        // Features section
        const featuresTitle = document.querySelector('.features-header h2');
        if (featuresTitle && translation.featuresTitle) {
            featuresTitle.textContent = translation.featuresTitle;
        }

        const featuresSubtitle = document.querySelector('.features-header p');
        if (featuresSubtitle && translation.featuresSubtitle) {
            featuresSubtitle.textContent = translation.featuresSubtitle;
        }

        // Feature cards
        const featureCards = document.querySelectorAll('.feature-card');
        const featureData = [
            { titleKey: 'aiTherapyTitle', descKey: 'aiTherapyDesc' },
            { titleKey: 'emdrTitle', descKey: 'emdrDesc' },
            { titleKey: 'cbtTitle', descKey: 'cbtDesc' },
            { titleKey: 'communityTitle', descKey: 'communityDesc' },
            { titleKey: 'dashboardTitle', descKey: 'dashboardDesc' }
        ];

        featureCards.forEach((card, index) => {
            if (index < featureData.length) {
                const title = card.querySelector('h3');
                const desc = card.querySelector('p');
                const data = featureData[index];

                if (title && translation[data.titleKey]) {
                    title.textContent = translation[data.titleKey];
                }
                if (desc && translation[data.descKey]) {
                    desc.textContent = translation[data.descKey];
                }
            }
        });

        // Footer
        const footerLinks = document.querySelector('.footer-links a[href="#contact"]');
        if (footerLinks && translation.contactUs) {
            footerLinks.textContent = translation.contactUs;
        }

        const copyright = document.querySelector('.footer-bottom p:first-child');
        if (copyright && translation.copyright) {
            copyright.textContent = translation.copyright;
        }

        const madeBy = document.querySelector('.footer-heart');
        if (madeBy && translation.madeBy) {
            madeBy.textContent = translation.madeBy;
        }

        // Contact section
        const contactTitle = document.querySelector('#contact h2');
        if (contactTitle && translation.contactUs) {
            contactTitle.textContent = translation.contactUs;
        }

        const contactText = document.querySelector('#contact p');
        if (contactText && translation.contactText) {
            const emailLink = contactText.querySelector('a');
            if (emailLink) {
                contactText.innerHTML = `${translation.contactText} ${emailLink.outerHTML}`;
            }
        }
    }
}

// Initialize language switcher when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (typeof translations !== 'undefined' && typeof languageConfig !== 'undefined') {
        new LanguageSwitcher();
    }
});

// Auto-detect browser language on first visit
function detectBrowserLanguage() {
    const stored = localStorage.getItem('mindsage-language');
    if (stored) return stored;

    const browserLang = navigator.language || navigator.userLanguage;
    
    // Map browser language codes to our supported languages
    if (browserLang.startsWith('ar')) {
        const region = browserLang.split('-')[1];
        if (region === 'EG') return 'ar_eg';
        if (['SA', 'AE', 'KW', 'QA', 'BH', 'OM'].includes(region)) return 'ar_gulf';
        return 'ar';
    }
    
    return 'en'; // Default to English
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LanguageSwitcher;
}