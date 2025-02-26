async function handleSubmit(event) {
    event.preventDefault();
    
    if (!validateForm()) {
        return false;
    }

    const form = document.getElementById('signUpForm');
    const formData = new FormData(form);

    try {
        const response = await fetch('/api/signup', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const result = await response.json();
            displayConfirmation();
        } else {
            throw new Error('Signup failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('There was an error submitting your form. Please try again.');
    }

    return false;
}

function validateForm() {
    // Your existing validation code
}

function displayConfirmation() {
    document.getElementById('signUpForm').style.display = 'none';
    document.getElementById('confirmationMessage').style.display = 'block';
}
