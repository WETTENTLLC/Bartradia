// barter-buddies.js

document.addEventListener('DOMContentLoaded', function() {
    // Modal Management
    const modals = {
        verification: document.getElementById('verificationModal'),
        login: document.getElementById('loginModal'),
        register: document.getElementById('registerModal')
    };

    const buttons = {
        getStarted: document.getElementById('getStartedBtn'),
        login: document.getElementById('loginBtn'),
        register: document.getElementById('registerBtn')
    };

    // Modal Toggle Functions
    function toggleModal(modalId) {
        const modal = modals[modalId];
        if (modal) {
            modal.classList.toggle('active');
        }
    }

    // Event Listeners
    if (buttons.getStarted) {
        buttons.getStarted.addEventListener('click', () => toggleModal('verification'));
    }

    if (buttons.login) {
        buttons.login.addEventListener('click', () => toggleModal('login'));
    }

    if (buttons.register) {
        buttons.register.addEventListener('click', () => toggleModal('register'));
    }

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        Object.values(modals).forEach(modal => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });

    // Business Verification Form Handler
    const verificationForm = document.querySelector('.verification-form');
    if (verificationForm) {
        verificationForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            try {
                // Here you would typically send the form data to your server
                const formData = new FormData(verificationForm);
                
                // Example API call (replace with your actual endpoint)
                const response = await fetch('/api/verify-business', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    showNotification('Verification submitted successfully!', 'success');
                    toggleModal('verification');
                } else {
                    throw new Error('Verification submission failed');
                }
            } catch (error) {
                showNotification(error.message, 'error');
            }
        });
    }

    // File Upload Preview
    const fileInputs = document.querySelectorAll('.file-upload input[type="file"]');
    fileInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            const fileName = e.target.files[0]?.name || 'No file chosen';
            const fileLabel = e.target.parentElement.querySelector('.file-name');
            if (fileLabel) {
                fileLabel.textContent = fileName;
            }
        });
    });

    // Notification System
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Service Proposal System
    const proposeButtons = document.querySelectorAll('.btn-primary');
    proposeButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            const serviceCard = e.target.closest('.service-card');
            const serviceName = serviceCard.querySelector('h3').textContent;

            // Check if user is logged in (implement your own logic)
            const isLoggedIn = checkUserLoginStatus();
            if (!isLoggedIn) {
                showNotification('Please log in to propose a barter', 'warning');
                toggleModal('login');
                return;
            }

            // Open proposal modal or handle proposal logic
            handleServiceProposal(serviceName);
        });
    });
});

// Helper Functions
function checkUserLoginStatus() {
    // Implement your login check logic
    return localStorage.getItem('userToken') !== null;
}

function handleServiceProposal(serviceName) {
    // Implement your proposal handling logic
    console.log(`Proposal initiated for: ${serviceName}`);
    showNotification('Proposal sent successfully!', 'success');
}


