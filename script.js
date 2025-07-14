// Utility functions
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// DOM Ready state
let domReady = false;
document.addEventListener('DOMContentLoaded', () => {
    domReady = true;
    initializeApp();
});

// Main initialization function
function initializeApp() {
    // Hide loading screen
    hideLoadingScreen();
    
    // Initialize navigation
    initMobileNavigation();
    
    // Initialize scroll effects
    initScrollEffects();
    
    // Initialize animations
    initScrollAnimations();
    
    // Initialize interactions
    initInteractions();
    
    // Initialize performance optimizations
    initPerformanceOptimizations();
    
    // Check login status
    checkUserLoginStatus();
    
    console.log('MindSage landing page initialized successfully! 🧠✨');
}

// Loading screen management
function hideLoadingScreen() {
    const loadingScreen = $('#loading-screen');
    if (loadingScreen) {
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                loadingScreen.remove();
            }, 500);
        }, 1000);
    }
}

// Enhanced Mobile Navigation
function initMobileNavigation() {
    const hamburger = $('#hamburger');
    const navMenu = $('#navMenu');
    const navLinks = $$('.nav-link');
    const body = document.body;
    
    if (!hamburger || !navMenu) return;
    
    // Toggle mobile menu
    hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isActive = hamburger.classList.contains('active');
        
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        // Update aria attributes
        hamburger.setAttribute('aria-expanded', !isActive);
        
        // Prevent body scroll when menu is open
        if (!isActive) {
            body.style.overflow = 'hidden';
            body.style.paddingRight = getScrollbarWidth() + 'px';
        } else {
            body.style.overflow = 'auto';
            body.style.paddingRight = '0px';
        }
    });
    
    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            closeMobileMenu();
        });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
            closeMobileMenu();
        }
    });
    
    // Handle escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            closeMobileMenu();
            hamburger.focus();
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            closeMobileMenu();
        }
    });
    
    function closeMobileMenu() {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        body.style.overflow = 'auto';
        body.style.paddingRight = '0px';
    }
    
    function getScrollbarWidth() {
        const outer = document.createElement('div');
        outer.style.visibility = 'hidden';
        outer.style.overflow = 'scroll';
        outer.style.msOverflowStyle = 'scrollbar';
        document.body.appendChild(outer);
        
        const inner = document.createElement('div');
        outer.appendChild(inner);
        
        const scrollbarWidth = (outer.offsetWidth - inner.offsetWidth);
        outer.parentNode.removeChild(outer);
        
        return scrollbarWidth;
    }
}

// Scroll Effects
function initScrollEffects() {
    const navbar = $('.navbar');
    let ticking = false;
    
    function updateNavbar() {
        if (!navbar) return;
        
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateNavbar);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestTick, { passive: true });
    
    // Parallax effect for hero section (optimized)
    const heroCircle = $('.hero-circle');
    if (heroCircle && window.innerWidth > 768) {
        let parallaxTicking = false;
        
        function updateParallax() {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.1; // Reduced for better performance
            
            if (scrolled < window.innerHeight) {
                heroCircle.style.transform = `translateY(${rate}px)`;
            }
            parallaxTicking = false;
        }
        
        function requestParallaxTick() {
            if (!parallaxTicking && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                requestAnimationFrame(updateParallax);
                parallaxTicking = true;
            }
        }
        
        window.addEventListener('scroll', requestParallaxTick, { passive: true });
    }
}

// Scroll Animations
function initScrollAnimations() {
    // Check if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        // Show all elements immediately
        $$('[data-aos]').forEach(el => {
            el.classList.add('aos-animate');
        });
        return;
    }
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('aos-animate');
                // Unobserve after animation to improve performance
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe all elements with data-aos attribute
    $$('[data-aos]').forEach(el => {
        observer.observe(el);
    });
}

// Interactive Elements
function initInteractions() {
    // Feature cards enhanced hover effect
    $$('.feature-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            if (window.innerWidth > 768 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                this.style.transform = 'translateY(-10px) scale(1.02)';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Button ripple effect
    $$('button, .btn-hero, .btn-primary, .btn-login').forEach(button => {
        button.addEventListener('click', function(e) {
            if (!this.classList.contains('no-ripple')) {
                createRippleEffect.call(this, e);
            }
        });
    });
    
    // Hero CTA button special effect
    const heroBtn = $('.btn-hero');
    if (heroBtn) {
        heroBtn.addEventListener('click', function(e) {
            // Don't create ripple if it's a link
            if (this.tagName === 'A') {
                return; // Let the link work normally
            }
            
            // Visual feedback for button
            e.preventDefault();
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
                // Redirect to signup
                window.location.href = 'signup.html';
            }, 150);
        });
    }
    
    // Navigation button handlers
    const loginBtns = $$('.btn-login');
    const primaryBtns = $$('.btn-primary');
    
    loginBtns.forEach(btn => {
        if (btn.tagName !== 'A') {
            btn.addEventListener('click', () => {
                window.location.href = 'login.html';
            });
        }
    });
    
    primaryBtns.forEach(btn => {
        if (btn.tagName !== 'A') {
            btn.addEventListener('click', () => {
                window.location.href = 'signup.html';
            });
        }
    });
}

// Ripple Effect Function
function createRippleEffect(e) {
    const ripple = document.createElement('span');
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.4);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
        z-index: 1;
    `;
    
    this.style.position = 'relative';
    this.style.overflow = 'hidden';
    this.appendChild(ripple);
    
    setTimeout(() => {
        if (ripple.parentNode) {
            ripple.remove();
        }
    }, 600);
}

// Enhanced Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = $$('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'polite');
    
    const icon = getNotificationIcon(type);
    
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${icon} ${message}</span>
            <button class="notification-close" aria-label="Close notification" type="button">&times;</button>
        </div>
    `;
    
    // Determine colors based on type
    let borderColor;
    switch (type) {
        case 'success':
            borderColor = '#10B981';
            break;
        case 'error':
            borderColor = '#EF4444';
            break;
        case 'warning':
            borderColor = '#F59E0B';
            break;
        default:
            borderColor = '#00D4FF';
    }
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 90px;
        right: 20px;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        padding: 16px 20px;
        max-width: 420px;
        min-width: 300px;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        border-left: 4px solid ${borderColor};
        backdrop-filter: blur(10px);
        font-family: var(--font-primary, 'Inter', sans-serif);
    `;
    
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after delay
    const autoRemoveDelay = type === 'error' ? 8000 : 5000;
    const autoRemove = setTimeout(() => {
        removeNotification(notification);
    }, autoRemoveDelay);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        clearTimeout(autoRemove);
        removeNotification(notification);
    });
    
    // Close on escape key
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            clearTimeout(autoRemove);
            removeNotification(notification);
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success':
            return '✅';
        case 'error':
            return '❌';
        case 'warning':
            return '⚠️';
        default:
            return 'ℹ️';
    }
}

function removeNotification(notification) {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 300);
}

// Check user login status and update UI
function checkUserLoginStatus() {
    const isLoggedIn = localStorage.getItem('mindsage_logged_in') === 'true';
    const userData = localStorage.getItem('mindsage_user');
    
    if (isLoggedIn && userData) {
        try {
            const user = JSON.parse(userData);
            updateNavigationForLoggedInUser(user);
        } catch (e) {
            console.warn('Invalid user data in localStorage');
            localStorage.removeItem('mindsage_user');
            localStorage.removeItem('mindsage_logged_in');
        }
    }
}

function updateNavigationForLoggedInUser(user) {
    const loginBtns = $$('.btn-login');
    const primaryBtns = $$('.btn-primary');
    
    loginBtns.forEach(btn => {
        if (btn.textContent.includes('Login') || btn.textContent.includes('Already have an account')) {
            btn.textContent = `👋 ${user.username}`;
            btn.href = '#profile';
            btn.classList.add('logged-in');
        }
    });
    
    primaryBtns.forEach(btn => {
        if (btn.textContent.includes('Get Started') || btn.textContent.includes('Sign Up')) {
            btn.textContent = 'Dashboard';
            btn.href = '#dashboard';
        }
    });
}

// Performance Optimizations
function initPerformanceOptimizations() {
    // Preload critical resources
    preloadCriticalResources();
    
    // Optimize floating particles (reduced frequency)
    if (window.innerWidth > 768 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        createFloatingParticles();
    }
    
    // Lazy load non-critical content
    lazyLoadContent();
    
    // Optimize images if any
    optimizeImages();
}

function preloadCriticalResources() {
    // Preload important pages
    const importantPages = ['signup.html', 'login.html'];
    importantPages.forEach(page => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = page;
        document.head.appendChild(link);
    });
}

function createFloatingParticles() {
    let particleCount = 0;
    const maxParticles = 5;
    
    function createParticle() {
        if (particleCount >= maxParticles) return;
        
        const particle = document.createElement('div');
        particle.className = 'floating-particle';
        particle.style.cssText = `
            position: fixed;
            width: ${Math.random() * 4 + 2}px;
            height: ${Math.random() * 4 + 2}px;
            background: linear-gradient(45deg, #00D4FF, #C084FC);
            border-radius: 50%;
            pointer-events: none;
            z-index: -1;
            opacity: 0.3;
            left: ${Math.random() * 100}vw;
            top: 100vh;
            animation: floatUp ${Math.random() * 3 + 4}s linear infinite;
        `;
        
        document.body.appendChild(particle);
        particleCount++;
        
        setTimeout(() => {
            if (particle.parentNode) {
                particle.remove();
                particleCount--;
            }
        }, 7000);
    }
    
    // Create particles less frequently for better performance
    setInterval(createParticle, 6000);
    
    // Create initial particle
    createParticle();
}

function lazyLoadContent() {
    // Intersection Observer for lazy loading
    const lazyElements = $$('[data-lazy]');
    
    if (lazyElements.length === 0) return;
    
    const lazyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                // Load content here
                element.classList.add('loaded');
                lazyObserver.unobserve(element);
            }
        });
    });
    
    lazyElements.forEach(element => {
        lazyObserver.observe(element);
    });
}

function optimizeImages() {
    // Add loading="lazy" to images that don't have it
    $$('img').forEach(img => {
        if (!img.hasAttribute('loading')) {
            img.setAttribute('loading', 'lazy');
        }
    });
}

// Add required CSS animations
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    @keyframes floatUp {
        to {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
    }
    
    .notification-message {
        flex: 1;
        font-size: 0.95rem;
        line-height: 1.4;
        color: var(--text-primary, #1E293B);
    }
    
    .notification-close {
        background: none;
        border: none;
        font-size: 1.25rem;
        cursor: pointer;
        color: #64748b;
        padding: 4px;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background-color 0.2s ease;
        flex-shrink: 0;
    }
    
    .notification-close:hover {
        background-color: #f1f5f9;
    }
    
    .logged-in {
        background: linear-gradient(135deg, #10B981, #059669) !important;
        border-color: #10B981 !important;
        color: white !important;
    }
    
    @media (max-width: 480px) {
        .notification {
            right: 15px !important;
            left: 15px !important;
            max-width: none !important;
            min-width: auto !important;
        }
    }
`;
document.head.appendChild(animationStyles);

// Handle window resize
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // Reinitialize responsive elements
        const navMenu = $('#navMenu');
        const hamburger = $('#hamburger');
        
        if (window.innerWidth > 768 && navMenu && hamburger) {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = 'auto';
            document.body.style.paddingRight = '0px';
        }
    }, 250);
});

// Handle visibility change (tab switching)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause animations when tab is not visible
        document.body.classList.add('paused');
    } else {
        // Resume animations when tab becomes visible
        document.body.classList.remove('paused');
    }
});

// Error handling
window.addEventListener('error', (e) => {
    console.warn('MindSage: Non-critical error caught:', e.error);
});

// Smooth scrolling for anchor links
document.addEventListener('click', (e) => {
    if (e.target.matches('a[href^="#"]')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
});

// Service Worker registration (if available)
if ('serviceWorker' in navigator && 'production' === 'production') {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(() => console.log('SW registered'))
            .catch(() => console.log('SW registration failed'));
    });
}

console.log('MindSage scripts loaded successfully! 🧠✨');

