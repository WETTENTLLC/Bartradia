// bartradia.js - Main JavaScript file for Bartradia platform

document.addEventListener('DOMContentLoaded', function() {
    // ====================================
    // Modal Management System
    // ====================================
    const modals = {
        verification: document.getElementById('verificationModal'),
        login: document.getElementById('loginModal'),
        register: document.getElementById('registerModal'),
        proposal: document.getElementById('proposalModal'),
        confirmation: document.getElementById('confirmationModal')
    };

    const buttons = {
        getStarted: document.getElementById('getStartedBtn'),
        login: document.getElementById('loginBtn'),
        register: document.getElementById('registerBtn'),
        closeModals: document.querySelectorAll('.modal-close')
    };

    // Modal Toggle Functions
    function toggleModal(modalId) {
        const modal = modals[modalId];
        if (modal) {
            // Close any open modals first
            Object.values(modals).forEach(m => {
                if (m) m.classList.remove('active');
            });
            
            // Open the requested modal
            modal.classList.toggle('active');
            
            // Add overlay to body
            document.body.classList.toggle('modal-open');
        }
    }

    // Event Listeners for Modal Buttons
    if (buttons.getStarted) {
        buttons.getStarted.addEventListener('click', () => {
            const isLoggedIn = checkUserLoginStatus();
            if (isLoggedIn) {
                window.location.href = 'business-registration.html';
            } else {
                toggleModal('verification');
            }
        });
    }

    if (buttons.login) {
        buttons.login.addEventListener('click', (e) => {
            e.preventDefault();
            if (e.target.href) {
                window.location.href = e.target.href;
            } else {
                toggleModal('login');
            }
        });
    }

    if (buttons.register) {
        buttons.register.addEventListener('click', (e) => {
            e.preventDefault();
            if (e.target.href) {
                window.location.href = e.target.href;
            } else {
                toggleModal('register');
            }
        });
    }

    // Close modal buttons
    buttons.closeModals.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal-overlay');
            if (modal) {
                modal.classList.remove('active');
                document.body.classList.remove('modal-open');
            }
        });
    });

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        Object.values(modals).forEach(modal => {
            if (modal && e.target === modal) {
                modal.classList.remove('active');
                document.body.classList.remove('modal-open');
            }
        });
    });

    // ====================================
    // Form Handlers
    // ====================================
    
    // Business Verification Form Handler
    const verificationForm = document.querySelector('.verification-form');
    if (verificationForm) {
        verificationForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            try {
                // Show loading state
                const submitBtn = verificationForm.querySelector('[type="submit"]');
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
                }
                
                // Here you would typically send the form data to your server
                const formData = new FormData(verificationForm);
                
                // Simulate API call (replace with your actual endpoint)
                setTimeout(() => {
                    // Success handling
                    showNotification('Verification submitted successfully!', 'success');
                    
                    // Reset form
                    verificationForm.reset();
                    
                    // Close modal
                    const modal = verificationForm.closest('.modal-overlay');
                    if (modal) modal.classList.remove('active');
                    document.body.classList.remove('modal-open');
                    
                    // Redirect to confirmation page
                    window.location.href = 'confirmation.html?action=verification';
                    
                    // Reset button
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'Submit';
                    }
                }, 1500);
                
            } catch (error) {
                showNotification(error.message || 'An error occurred', 'error');
                
                // Reset button
                const submitBtn = verificationForm.querySelector('[type="submit"]');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Submit';
                }
            }
        });
    }

    // Login Form Handler
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            try {
                // Show loading state
                const submitBtn = loginForm.querySelector('[type="submit"]');
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
                }
                
                // Simulate login process
                setTimeout(() => {
                    // Store user token (in a real app, this would come from the server)
                    localStorage.setItem('userToken', 'sample-token-12345');
                    localStorage.setItem('userName', 'User');
                    
                    // Success notification
                    showNotification('Login successful!', 'success');
                    
                    // Redirect to dashboard or reload page
                    window.location.href = 'confirmation.html?action=login';
                    
                }, 1500);
                
            } catch (error) {
                showNotification(error.message || 'Login failed. Please check your credentials.', 'error');
                
                // Reset button
                const submitBtn = loginForm.querySelector('[type="submit"]');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Sign In';
                }
            }
        });
    }

    // ====================================
    // File Upload System
    // ====================================
    
    const fileInputs = document.querySelectorAll('.file-upload input[type="file"]');
    fileInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            const fileName = e.target.files[0]?.name || 'No file chosen';
            const fileLabel = e.target.parentElement.querySelector('.file-name');
            if (fileLabel) {
                fileLabel.textContent = fileName;
            }
            
            // Preview image if it's an image file
            const previewContainer = e.target.parentElement.querySelector('.file-preview');
            if (previewContainer && e.target.files[0]) {
                const file = e.target.files[0];
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        previewContainer.innerHTML = `<img src="${event.target.result}" alt="Preview">`;
                        previewContainer.classList.add('has-preview');
                    };
                    reader.readAsDataURL(file);
                }
            }
        });
    });

    // ====================================
    // Notification System
    // ====================================
    
    function showNotification(message, type = 'info') {
        // Remove any existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => {
            notification.remove();
        });
        
        // Create new notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        // Add icon based on notification type
        let icon = '';
        switch (type) {
            case 'success':
                icon = '<i class="fas fa-check-circle"></i>';
                break;
            case 'error':
                icon = '<i class="fas fa-exclamation-circle"></i>';
                break;
            case 'warning':
                icon = '<i class="fas fa-exclamation-triangle"></i>';
                break;
            default:
                icon = '<i class="fas fa-info-circle"></i>';
        }
        
        notification.innerHTML = `${icon} <span>${message}</span>`;
        
        // Add close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'notification-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', () => notification.remove());
        notification.appendChild(closeBtn);
        
        document.body.appendChild(notification);
        
        // Add active class after a small delay (for animation)
        setTimeout(() => {
            notification.classList.add('active');
        }, 10);
        
        // Auto-remove after delay
        setTimeout(() => {
            notification.classList.remove('active');
            setTimeout(() => {
                notification.remove();
            }, 300); // Match this with CSS transition time
        }, 5000);
    }

    // ====================================
    // Service Proposal System
    // ====================================
    
    const proposeButtons = document.querySelectorAll('.action-link');
    proposeButtons.forEach(button => {
        if (button.textContent.toLowerCase().includes('propose')) {
            button.addEventListener('click', (e) => {
                const serviceCard = e.target.closest('.service-card');
                if (!serviceCard) return;
                
                const serviceName = serviceCard.querySelector('h3')?.textContent || 'this service';
                const businessName = serviceCard.querySelector('.business-name')?.textContent || 'business';
                
                // Check if user is logged in
                const isLoggedIn = checkUserLoginStatus();
                if (!isLoggedIn) {
                    showNotification('Please sign in to propose a barter', 'warning');
                    toggleModal('login');
                    return;
                }
                
                // Handle proposal
                handleServiceProposal(serviceName, businessName);
            });
        }
    });

    // ====================================
    // Confirmation Page Handling
    // ====================================
    
    // Check if we're on the confirmation page
    const confirmationDetails = document.getElementById('confirmationDetails');
    if (confirmationDetails) {
        // Get URL parameters to customize confirmation message
        const urlParams = new URLSearchParams(window.location.search);
        const action = urlParams.get('action');
        
        if (action) {
            updateConfirmationPage(action);
        }
    }

    // ====================================
    // Testimonial Slider
    // ====================================
    
    const testimonialSlider = document.querySelector('.testimonial-slider');
    if (testimonialSlider) {
        const prevButton = document.querySelector('.testimonial-navigation .prev');
        const nextButton = document.querySelector('.testimonial-navigation .next');
        
        if (prevButton && nextButton) {
            let currentSlide = 0;
            const testimonials = testimonialSlider.querySelectorAll('.testimonial');
            
            // Initialize slider
            updateSlider();
            
            // Event listeners for navigation
            prevButton.addEventListener('click', () => {
                currentSlide = (currentSlide - 1 + testimonials.length) % testimonials.length;
                updateSlider();
            });
            
            nextButton.addEventListener('click', () => {
                currentSlide = (currentSlide + 1) % testimonials.length;
                updateSlider();
            });
            
            function updateSlider() {
                testimonials.forEach((testimonial, index) => {
                    testimonial.style.display = index === currentSlide ? 'block' : 'none';
                });
            }
            
            // Auto-advance slider
            setInterval(() => {
                currentSlide = (currentSlide + 1) % testimonials.length;
                updateSlider();
            }, 8000);
        }
    }

    // ====================================
    // Search Functionality
    // ====================================
    
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    
    if (searchInput && searchButton) {
        searchButton.addEventListener('click', () => {
            const query = searchInput.value.trim();
            if (query) {
                window.location.href = `search-results.html?q=${encodeURIComponent(query)}`;
            }
        });
        
        // Also trigger search on Enter key
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query) {
                    window.location.href = `search-results.html?q=${encodeURIComponent(query)}`;
                }
            }
        });
    }

    // ====================================
    // User Authentication Status
    // ====================================
    
    // Update UI based on login status
    updateUIForAuthStatus();
});

// ====================================
// Helper Functions
// ====================================

// Check if user is logged in
function checkUserLoginStatus() {
    // In a real app, you would validate the token with your server
    return localStorage.getItem('userToken') !== null;
}

// Handle service proposal
function handleServiceProposal(serviceName, businessName) {
    // In a real app, this would open a proposal form or modal
    console.log(`Proposal initiated for: ${serviceName} from ${businessName}`);
    
    // Show success notification
    showNotification(`Proposal request sent for ${serviceName}!`, 'success');
    
    // Redirect to confirmation page
    window.location.href = `confirmation.html?action=proposal&service=${encodeURIComponent(serviceName)}&business=${encodeURIComponent(businessName)}`;
}

// Update UI elements based on authentication status
function updateUIForAuthStatus() {
    const isLoggedIn = checkUserLoginStatus();
    const userName = localStorage.getItem('userName');
    
    // Update auth buttons
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const userMenuBtn = document.getElementById('userMenuBtn');
    
    if (isLoggedIn && loginBtn && registerBtn) {
        // If we have a user menu button, show it and hide login/register
        if (userMenuBtn) {
            loginBtn.style.display = 'none';
            registerBtn.style.display = 'none';
            userMenuBtn.style.display = 'block';
            
            // Update user name if available
            const userNameElement = userMenuBtn.querySelector('.user-name');
            if (userNameElement && userName) {
                userNameElement.textContent = userName;
            }
        } else {
            // If no user menu, change login button to "Dashboard"
            loginBtn.textContent = 'Dashboard';
            loginBtn.href = 'dashboard.html';
            registerBtn.textContent = 'Log Out';
            registerBtn.href = '#';
            registerBtn.addEventListener('click', (e) => {
                e.preventDefault();
                logoutUser();
            });
        }
    }
}

// Log out user
function logoutUser() {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userName');
    showNotification('You have been logged out', 'info');
    
    // Redirect to home page or reload current page
    window.location.href = 'index.html';
}

// Update confirmation page content based on action
function updateConfirmationPage(action) {
    const messageElement = document.querySelector('.confirmation-message');
    const detailsElement = document.getElementById('confirmationDetails');
    const nextStepsList = document.querySelector('.next-steps ul');
    
