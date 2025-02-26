/**
 * CONFIGURATION AND GLOBAL VARIABLES
 */
const CONFIG = {
    API_BASE_URL: '/api',
    MAX_FILE_SIZE: 5242880, // 5MB
    ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
    PASSWORD_MIN_LENGTH: 8,
    RATE_LIMIT: {
        windowMs: 15 * 60 * 1000,
        maxRequests: 100
    },
    ERROR_MESSAGES: {
        NETWORK_ERROR: 'Network error occurred. Please try again.',
        INVALID_FILE: 'Invalid file type or size.',
        INVALID_INPUT: 'Please provide valid input.',
        UNAUTHORIZED: 'You are not authorized to perform this action.'
    }
};

/**
 * SECURITY AND VALIDATION UTILITIES
 */
const SecurityUtils = {
    validatePassword: (password) => {
        const requirements = {
            length: password.length >= CONFIG.PASSWORD_MIN_LENGTH,
            number: /\d/.test(password),
            special: /[!@#$%^&*]/.test(password),
            upper: /[A-Z]/.test(password),
            lower: /[a-z]/.test(password)
        };
        return Object.values(requirements).every(req => req === true);
    },

    sanitizeInput: (input) => {
        if (typeof input !== 'string') return '';
        return input.replace(/<[^>]*>/g, '').trim();
    },

    validateFileUpload: (file) => {
        return file && 
               file.size <= CONFIG.MAX_FILE_SIZE && 
               CONFIG.ALLOWED_FILE_TYPES.includes(file.type);
    },

    validateEmail: (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
};

/**
 * ERROR HANDLING UTILITIES
 */
const ErrorHandler = {
    showError: (message, elementId = 'error-message') => {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            setTimeout(() => {
                errorElement.style.display = 'none';
            }, 5000);
        } else {
            console.error(message);
        }
    },

    handleFetchError: (error) => {
        console.error('API Error:', error);
        ErrorHandler.showError(CONFIG.ERROR_MESSAGES.NETWORK_ERROR);
    }
};

/**
 * RATE LIMITER
 */
class RateLimiter {
    constructor() {
        this.requests = new Map();
        this.windowMs = CONFIG.RATE_LIMIT.windowMs;
        this.maxRequests = CONFIG.RATE_LIMIT.maxRequests;
    }

    checkLimit(userId) {
        const now = Date.now();
        const userRequests = this.requests.get(userId) || [];
        const validRequests = userRequests.filter(time => now - time < this.windowMs);
        
        if (validRequests.length >= this.maxRequests) {
            return false;
        }

        validRequests.push(now);
        this.requests.set(userId, validRequests);
        return true;
    }
}

const rateLimiter = new RateLimiter();
/**
 * TRADE ITEMS MANAGEMENT
 */
const TradeManager = {
    async displayTrades() {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/trades`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (!response.ok) throw new Error('Failed to fetch trades');
            
            const data = await response.json();
            const tradeList = document.getElementById('tradeList');
            
            if (!tradeList) return;

            tradeList.innerHTML = data.trades.map(trade => `
                <div class="trade-item" data-id="${SecurityUtils.sanitizeInput(trade.id)}">
                    <img src="${SecurityUtils.sanitizeInput(trade.image)}" 
                         alt="${SecurityUtils.sanitizeInput(trade.name)}" 
                         class="trade-image" 
                         onerror="this.src='images/fallback.png'">
                    <strong>${SecurityUtils.sanitizeInput(trade.name)}</strong>
                    <p>${SecurityUtils.sanitizeInput(trade.description)}</p>
                    <div class="trade-actions">
                        <button class="edit-btn" data-id="${trade.id}">Edit</button>
                        <button class="delete-btn" data-id="${trade.id}">Delete</button>
                    </div>
                </div>
            `).join('');
            
            this.attachEventListeners();
        } catch (error) {
            ErrorHandler.handleFetchError(error);
        }
    },

    async createTrade(formData) {
        try {
            if (!rateLimiter.checkLimit('user')) {
                throw new Error('Rate limit exceeded');
            }

            const response = await fetch(`${CONFIG.API_BASE_URL}/trades`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            if (!response.ok) throw new Error('Failed to create trade');
            
            const result = await response.json();
            await this.displayTrades();
            return result;
        } catch (error) {
            ErrorHandler.handleFetchError(error);
            return null;
        }
    },

    async updateTrade(id, data) {
        try {
            if (!rateLimiter.checkLimit('user')) {
                throw new Error('Rate limit exceeded');
            }

            const response = await fetch(`${CONFIG.API_BASE_URL}/trades/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Failed to update trade');
            
            const result = await response.json();
            await this.displayTrades();
            return result;
        } catch (error) {
            ErrorHandler.handleFetchError(error);
            return null;
        }
    },

    async deleteTrade(id) {
        try {
            if (!rateLimiter.checkLimit('user')) {
                throw new Error('Rate limit exceeded');
            }

            const response = await fetch(`${CONFIG.API_BASE_URL}/trades/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error('Failed to delete trade');
            
            await this.displayTrades();
            return true;
        } catch (error) {
            ErrorHandler.handleFetchError(error);
            return false;
        }
    },
    attachEventListeners() {
        // Edit buttons
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const tradeId = e.target.dataset.id;
                this.handleEdit(tradeId);
            });
        });

        // Delete buttons
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                if (confirm('Are you sure you want to delete this trade?')) {
                    const tradeId = e.target.dataset.id;
                    await this.deleteTrade(tradeId);
                }
            });
        });
    },

    handleEdit(tradeId) {
        const tradeItem = document.querySelector(`.trade-item[data-id="${tradeId}"]`);
        const name = tradeItem.querySelector('strong').textContent;
        const description = tradeItem.querySelector('p').textContent;

        document.getElementById('editTradeId').value = tradeId;
        document.getElementById('editName').value = name;
        document.getElementById('editDescription').value = description;
        
        document.getElementById('editModal').style.display = 'block';
    }
};

/**
 * FORM HANDLING AND VALIDATION
 */
const FormHandler = {
    validateTradeForm(formData) {
        const name = formData.get('name');
        const description = formData.get('description');
        const image = formData.get('image');

        if (!name || name.length < 2) {
            ErrorHandler.showError('Name must be at least 2 characters long');
            return false;
        }

        if (!description || description.length < 10) {
            ErrorHandler.showError('Description must be at least 10 characters long');
            return false;
        }

        if (image && !SecurityUtils.validateFileUpload(image)) {
            ErrorHandler.showError(CONFIG.ERROR_MESSAGES.INVALID_FILE);
            return false;
        }

        return true;
    },

    setupFormListeners() {
        const tradeForm = document.getElementById('tradeForm');
        const editForm = document.getElementById('editForm');
        const closeModal = document.querySelector('.close-modal');

        if (tradeForm) {
            tradeForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(tradeForm);
                
                if (this.validateTradeForm(formData)) {
                    await TradeManager.createTrade(formData);
                    tradeForm.reset();
                }
            });
        }

        if (editForm) {
            editForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const tradeId = document.getElementById('editTradeId').value;
                const formData = new FormData(editForm);
                const data = Object.fromEntries(formData.entries());
                
                if (this.validateTradeForm(formData)) {
                    await TradeManager.updateTrade(tradeId, data);
                    document.getElementById('editModal').style.display = 'none';
                }
            });
        }

        if (closeModal) {
            closeModal.addEventListener('click', () => {
                document.getElementById('editModal').style.display = 'none';
            });
        }
    }
};

/**
 * AUTHENTICATION HANDLING
 */
const AuthHandler = {
    async login(credentials) {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            });

            if (!response.ok) throw new Error('Login failed');

            const data = await response.json();
            localStorage.setItem('token', data.token);
            return true;
        } catch (error) {
            ErrorHandler.handleFetchError(error);
            return false;
        }
    },

    logout() {
        localStorage.removeItem('token');
        window.location.href = '/login.html';
    },

    checkAuth() {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login.html';
            return false;
        }
        return true;
    }
};
/**
 * UTILITY FUNCTIONS
 */
const Utils = {
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
    },

    formatDate(date) {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    },

    createLoadingSpinner() {
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        spinner.innerHTML = '<div class="spinner"></div>';
        return spinner;
    },

    showLoading() {
        const spinner = this.createLoadingSpinner();
        document.body.appendChild(spinner);
    },

    hideLoading() {
        const spinner = document.querySelector('.loading-spinner');
        if (spinner) {
            spinner.remove();
        }
    }
};

/**
 * APPLICATION INITIALIZATION
 */
const App = {
    init() {
        // Initialize rate limiter
        const rateLimiter = new RateLimiter();

        // Check authentication on protected pages
        if (window.location.pathname !== '/login.html') {
            if (!AuthHandler.checkAuth()) return;
        }

        // Setup event listeners
        document.addEventListener('DOMContentLoaded', () => {
            FormHandler.setupFormListeners();
            
            // Initialize trades display if on main page
            if (document.getElementById('tradeList')) {
                TradeManager.displayTrades();
            }

            // Setup logout button
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', AuthHandler.logout);
            }

            // Setup login form
            const loginForm = document.getElementById('loginForm');
            if (loginForm) {
                loginForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const formData = new FormData(loginForm);
                    const credentials = {
                        email: formData.get('email'),
                        password: formData.get('password')
                    };

                    if (!SecurityUtils.validateEmail(credentials.email)) {
                        ErrorHandler.showError('Please enter a valid email address');
                        return;
                    }

                    if (!SecurityUtils.validatePassword(credentials.password)) {
                        ErrorHandler.showError('Password must be at least 8 characters long and contain numbers, special characters, and both upper and lowercase letters');
                        return;
                    }

                    Utils.showLoading();
                    const success = await AuthHandler.login(credentials);
                    Utils.hideLoading();

                    if (success) {
                        window.location.href = '/dashboard.html';
                    }
                });
            }
        });

        // Handle network status
        window.addEventListener('online', () => {
            ErrorHandler.showError('Connection restored', 'network-status');
        });

        window.addEventListener('offline', () => {
            ErrorHandler.showError('No internet connection', 'network-status');
        });
    }
};

// Initialize the application
App.init();

// Export modules for testing (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        TradeManager,
        FormHandler,
        AuthHandler,
        SecurityUtils,
        ErrorHandler,
        Utils
    };
}
