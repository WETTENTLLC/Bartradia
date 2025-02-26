/**
 * CONFIGURATION AND CONSTANTS
 */
const CONFIG = {
    API_BASE_URL: 'https://api.bartradia.com',
    IMAGE_PATH: 'Public/images/',
    FALLBACK_IMAGE: 'images/fallback.png',
    ERROR_MESSAGES: {
        INVALID_FILE: 'Invalid file type or size',
        NETWORK_ERROR: 'Network connection error',
        AUTH_ERROR: 'Authentication failed'
    }
};

/**
 * AUTH HANDLER
 */
const AuthHandler = {
    isAuthenticated: false,

    init() {
        this.updateAuthUI();
        this.setupAuthListeners();
    },

    updateAuthUI() {
        const authButtons = document.querySelector('.auth-buttons');
        const isAuthenticated = this.checkAuth();

        if (authButtons) {
            if (isAuthenticated) {
                authButtons.innerHTML = `
                    <button id="dashboardBtn" onclick="location.href='user-dashboard.html'">Dashboard</button>
                    <button id="logoutBtn">Logout</button>
                `;
            } else {
                authButtons.innerHTML = `
                    <button id="signInBtn" onclick="location.href='sign-in.html'">Sign In</button>
                    <button id="signUpBtn" onclick="location.href='sign-up.html'">Sign Up</button>
                `;
            }
        }
    },

    setupAuthListeners() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
    },

    checkAuth() {
        const token = localStorage.getItem('authToken');
        this.isAuthenticated = !!token;
        return this.isAuthenticated;
    },

    logout() {
        localStorage.removeItem('authToken');
        this.isAuthenticated = false;
        this.updateAuthUI();
        window.location.href = 'index.html';
    }
};

/**
 * FEATURED TRADES HANDLER
 */
const FeaturedTradesHandler = {
    async loadFeaturedTrades() {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/featured-trades`);
            const trades = await response.json();
            this.updateFeaturedTrades(trades);
        } catch (error) {
            console.error('Error loading featured trades:', error);
            this.loadFallbackTrades();
        }
    },

    updateFeaturedTrades(trades) {
        const container = document.querySelector('.grid-container');
        if (!container) return;

        trades.forEach((trade, index) => {
            const tradeElement = container.children[index];
            if (tradeElement) {
                const img = tradeElement.querySelector('img');
                const details = tradeElement.querySelector('.item-details');
                
                img.src = trade.imageUrl || `${CONFIG.IMAGE_PATH}item${index + 1}.png`;
                img.onerror = () => {
                    img.src = CONFIG.FALLBACK_IMAGE;
                };

                if (details) {
                    details.innerHTML = `
                        <p><strong>Item:</strong> ${SecurityUtils.sanitizeHTML(trade.name)}</p>
                        <p><strong>Description:</strong> ${SecurityUtils.sanitizeHTML(trade.description)}</p>
                        <p><strong>Value:</strong> $${trade.value}</p>
                        <p><strong>User:</strong> ${SecurityUtils.sanitizeHTML(trade.user)}</p>
                        <p><strong>Location:</strong> ${SecurityUtils.sanitizeHTML(trade.location)}</p>
                    `;
                }
            }
        });
    },

    loadFallbackTrades() {
        // Keep existing static content as fallback
        console.log('Using fallback trade data');
    }
};

/**
 * MODAL HANDLER
 */
const ModalHandler = {
    init() {
        this.setupModalListeners();
    },

    setupModalListeners() {
        const aboutSection = document.querySelector('.about');
        const aboutModal = document.getElementById('aboutModal');

        if (aboutSection && aboutModal) {
            aboutSection.addEventListener('mouseenter', () => {
                aboutModal.classList.remove('hidden');
            });

            aboutSection.addEventListener('mouseleave', () => {
                aboutModal.classList.add('hidden');
            });
        }
    }
};

/**
 * IMAGE HANDLER
 */
const ImageHandler = {
    init() {
        this.setupImageFallbacks();
    },

    setupImageFallbacks() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (!img.hasAttribute('onerror')) {
                img.onerror = function() {
                    const section = this.closest('section');
                    let fallbackImage = 'images/fallback.png';
                    
                    if (section) {
                        switch(section.className.split(' ')[0]) {
                            case 'about':
                                fallbackImage = 'images/fallback4.png';
                                break;
                            case 'how-it-works':
                                fallbackImage = 'images/fallback5.png';
                                break;
                            case 'user-badges':
                                fallbackImage = 'images/fallback3.png';
                                break;
                        }
                    }
                    
                    this.src = fallbackImage;
                    this.alt = 'Fallback Image';
                };
            }
        });
    }
};

/**
 * ANIMATION HANDLER
 */
const AnimationHandler = {
    init() {
        this.setupScrollAnimations();
        this.setupHoverEffects();
    },

    setupScrollAnimations() {
        const sections = document.querySelectorAll('section');
        
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px'
        };

        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    entry.target.classList.add('slide-up');
                }
            });
        }, observerOptions);

        sections.forEach(section => {
            section.classList.add('hidden');
            sectionObserver.observe(section);
        });
    },

    setupHoverEffects() {
        const frames = document.querySelectorAll('.frame');
        
        frames.forEach(frame => {
            frame.addEventListener('mouseenter', () => {
                frame.classList.add('frame-hover');
            });
            
            frame.addEventListener('mouseleave', () => {
                frame.classList.remove('frame-hover');
            });
        });
    }
};

/**
 * SECURITY UTILS
 */
const SecurityUtils = {
    sanitizeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    validatePassword(password) {
        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
        return passwordRegex.test(password);
    }
};

/**
 * ERROR HANDLER
 */
const ErrorHandler = {
    showError(message, duration = 5000) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, duration);
    }
};

/**
 * PERFORMANCE MONITOR
 */
const PerformanceMonitor = {
    metrics: {},

    startTimer(label) {
        this.metrics[label] = performance.now();
    },

    endTimer(label) {
        if (this.metrics[label]) {
            const duration = performance.now() - this.metrics[label];
            console.debug(`${label}: ${duration.toFixed(2)}ms`);
            delete this.metrics[label];
        }
    },

    logPageLoadMetrics() {
        window.addEventListener('load', () => {
            const timing = window.performance.timing;
            const pageLoad = timing.loadEventEnd - timing.navigationStart;
            console.debug(`Total page load time: ${pageLoad}ms`);
        });
    }
};

/**
 * RESPONSIVE HANDLER
 */
const ResponsiveHandler = {
    init() {
        this.setupResponsiveListeners();
        this.handleResize();
    },

    setupResponsiveListeners() {
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));
    },

    handleResize() {
        const isMobile = window.innerWidth <= 768;
        document.body.classList.toggle('mobile-view', isMobile);
        this.adjustLayoutForScreenSize();
    },

    adjustLayoutForScreenSize() {
        const gridContainer = document.querySelector('.grid-container');
        if (gridContainer) {
            const isMobile = window.innerWidth <= 768;
            gridContainer.style.gridTemplateColumns = isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))';
        }
    },

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

/**
 * URL HANDLER
 */
const URLHandler = {
    getQueryParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const params = {};
        for (const [key, value] of urlParams) {
            params[key] = value;
        }
        return params;
    },

    updateQueryParam(key, value) {
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set(key, value);
        window.history.replaceState({}, '', `${window.location.pathname}?${urlParams}`);
    }
};

/**
 * INITIALIZATION
 */
document.addEventListener('DOMContentLoaded', () => {
    PerformanceMonitor.startTimer('init');

    try {
        // Initialize all handlers
        AuthHandler.init();
        ModalHandler.init();
        ImageHandler.init();
        AnimationHandler.init();
        ResponsiveHandler.init();

        // Load dynamic content
        FeaturedTradesHandler.loadFeaturedTrades();

        // Setup performance monitoring
        PerformanceMonitor.logPageLoadMetrics();

        // Check for URL parameters
        const params = URLHandler.getQueryParams();
        if (params.action === 'login') {
            // Handle direct login requests
            AuthHandler.checkAuth();
        }

    } catch (error) {
        console.error('Initialization error:', error);
        ErrorHandler.showError('There was an error initializing the application. Please refresh the page.');
    }

    PerformanceMonitor.endTimer('init');
});

/**
 * EXPORT MODULES
 */
window.Bartradia = {
    auth: AuthHandler,
    trades: FeaturedTradesHandler,
    security: SecurityUtils,
    error: ErrorHandler
};

