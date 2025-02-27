// Constants
const API_ENDPOINTS = {
    CONTACT: '/api/contact'
};

const MESSAGES = {
    SUCCESS: 'Message sent successfully!',
    ERROR: 'Error sending message. Please try again.',
    VALIDATION: {
        NAME: 'Please enter your name',
        EMAIL: 'Please enter a valid email address',
        MESSAGE: 'Please enter your message'
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const form = document.getElementById('contactForm');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const submitButton = form?.querySelector('button[type="submit"]');

    // Validation Functions
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateForm = (formData) => {
        if (!formData.name.trim()) {
            throw new Error(MESSAGES.VALIDATION.NAME);
        }
        if (!validateEmail(formData.email)) {
            throw new Error(MESSAGES.VALIDATION.EMAIL);
        }
        if (!formData.message.trim()) {
            throw new Error(MESSAGES.VALIDATION.MESSAGE);
        }
    };

    // UI Functions
    const toggleLoading = (isLoading) => {
        if (loadingSpinner) {
            loadingSpinner.style.display = isLoading ? 'block' : 'none';
        }
        if (submitButton) {
            submitButton.disabled = isLoading;
            submitButton.textContent = isLoading ? 'Sending...' : 'Send Message';
        }
    };

    const showMessage = (message, isError = false) => {
        const messageElement = document.createElement('div');
        messageElement.className = `alert ${isError ? 'alert-danger' : 'alert-success'}`;
        messageElement.textContent = message;
        
        form.insertAdjacentElement('beforebegin', messageElement);
        
        // Remove message after 5 seconds
        setTimeout(() => messageElement.remove(), 5000);
    };

    // Form Handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('contactName').value,
            email: document.getElementById('contactEmail').value,
            message: document.getElementById('contactMessage').value
        };

        try {
            // Validate form data
            validateForm(formData);

            // Show loading state
            toggleLoading(true);

            // Send request
            const response = await fetch(API_ENDPOINTS.CONTACT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || MESSAGES.ERROR);
            }

            // Show success message and reset form
            showMessage(MESSAGES.SUCCESS);
            form.reset();

        } catch (error) {
            // Show error message
            showMessage(error.message || MESSAGES.ERROR, true);
            console.error('Contact form error:', error);

        } finally {
            // Hide loading state
            toggleLoading(false);
        }
    };

    // Initialize
    if (form) {
        form.addEventListener('submit', handleSubmit);

        // Optional: Add real-time validation
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                const field = input.id.replace('contact', '').toLowerCase();
                try {
                    validateForm({
                        name: field === 'name' ? input.value : 'dummy',
                        email: field === 'email' ? input.value : 'dummy@dummy.com',
                        message: field === 'message' ? input.value : 'dummy'
                    });
                    input.classList.remove('is-invalid');
                } catch (error) {
                    input.classList.add('is-invalid');
                }
            });
        });
    }
});
