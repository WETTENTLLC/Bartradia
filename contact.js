document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');
    const loadingSpinner = document.getElementById('loadingSpinner');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            loadingSpinner.style.display = 'block';
            const contactName = document.getElementById('contactName').value;
            const contactEmail = document.getElementById('contactEmail').value;
            const contactMessage = document.getElementById('contactMessage').value;
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: contactName, email: contactEmail, message: contactMessage }),
            });
            loadingSpinner.style.display = 'none';
            const result = await response.json();
            if (result.success) {
                alert('Message sent successfully!');
                form.reset();
            } else {
                alert('Error sending message.');
            }
        });
    }
});
