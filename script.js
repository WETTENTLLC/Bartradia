document.addEventListener('DOMContentLoaded', (event) => {
    // Trade Items Management
    const tradeForm = document.getElementById('tradeForm');
    const tradeList = document.getElementById('tradeList');

    const displayTrades = async () => {
        const response = await fetch('/api/trades');
        const data = await response.json();
        tradeList.innerHTML = data.trades.map(trade => `
            <div class="trade-item" data-id="${trade.id}">
                <img src="${trade.image}" alt="${trade.name}" class="trade-image" onerror="this.src='images/fallback.png'; this.alt='Fallback Image';">
                <strong>${trade.name}</strong>
                <p>${trade.description}</p>
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Delete</button>
            </div>
        `).join('');
        attachEventListeners();
    };

    const attachEventListeners = () => {
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const tradeElement = e.target.closest('.trade-item');
                const tradeId = tradeElement.dataset.id;
                const tradeName = prompt('Enter new name:', tradeElement.querySelector('strong').innerText);
                const tradeDescription = prompt('Enter new description:', tradeElement.querySelector('p').innerText);
                if (tradeName && tradeDescription) {
                    updateTrade(tradeId, tradeName, tradeDescription);
                }
            });
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const tradeElement = e.target.closest('.trade-item');
                const tradeId = tradeElement.dataset.id;
                deleteTrade(tradeId);
            });
        });
    };

    if (tradeForm) {
        tradeForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const tradeName = document.getElementById('itemName').value;
            const tradeDescription = document.getElementById('itemDescription').value;
            const tradeImage = document.getElementById('itemImage').files[0];

            const formData = new FormData();
            formData.append('name', tradeName);
            formData.append('description', tradeDescription);
            formData.append('image', tradeImage);

            const response = await fetch('/api/trades', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            if (result.id) {
                displayTrades();
            }
            tradeForm.reset();
        });
    }

    const updateTrade = async (id, name, description) => {
        const response = await fetch(`/api/trades/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, description }),
        });
        const result = await response.json();
        if (result.updated) {
            displayTrades();
        }
    };

    const deleteTrade = async (id) => {
        const response = await fetch(`/api/trades/${id}`, {
            method: 'DELETE',
        });
        const result = await response.json();
        if (result.deleted) {
            displayTrades();
        }
    };

    displayTrades();

    // About Modal Management
    const readMoreLink = document.getElementById('readMoreLink');
    const aboutModal = document.getElementById('aboutModal');

    if (readMoreLink && aboutModal) {
        readMoreLink.addEventListener('click', (e) => {
            e.preventDefault();
            aboutModal.classList.remove('hidden');
        });

        const modalLink = document.querySelector('.modal-link');
        if (modalLink) {
            modalLink.addEventListener('click', () => {
                aboutModal.classList.add('hidden');
            });
        }
    }
});

// Additional functions
function addCreditsToTradeRoom() {
    // Logic for adding credits to the trade room
}

function applyCredits() {
    const form = document.getElementById('creditApplicationForm');
    form.classList.toggle('hidden');
    
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        const creditAmount = document.getElementById('creditAmount').value;
        // Logic for applying credits
    });
}

function donateCredits() {
    const form = document.getElementById('donationForm');
    form.classList.toggle('hidden');
    
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        const donationAmount = document.getElementById('donationAmount').value;
        const recipient = document.getElementById('recipient').value;
        // Logic for donating credits
    });
}

function featureBadge(badgeName) {
    alert(`${badgeName} is now featured on your profile!`);
    // Logic to set the badge as featured on user's profile
}

document.getElementById("getStartedBtn").addEventListener("click", function() {
    window.location.href = "signup.html"; // Ensure this path is correct
});

document.querySelector('form').addEventListener('submit', function(event) {
    event.preventDefault();
    const category = document.querySelector('#category').value;
    const items = document.querySelectorAll('.trade-item');
    
    items.forEach(item => {
        if (category === 'all' || item.getAttribute('data-category') === category) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
});

const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.post('/signup', (req, res) => {
    const { username, email, password } = req.body;
    // Add user to the database (this is a placeholder, implement your DB logic)
    console.log('New user:', { username, email, password });
    res.send('Sign-up successful!');
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

app.post('/post-item', upload.single('image'), (req, res) => {
    const { title, description, category } = req.body;
    const image = req.file;
    // Save the item to the database (implement your DB logic here)
    console.log('New trade item:', { title, description, category, image });
    res.send('Item posted successfully!');
});
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    // Check user credentials (implement your authentication logic here)
    console.log('User login:', { username, password });
    res.send('Login successful!');
});

const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
};

// Example usage
app.get('/dashboard', isAuthenticated, (req, res) => {
    res.send('Welcome to your dashboard!');
});


// Handle sign-up form submission and redirect to confirmation page
app.post('/signup', (req, res) => {
    const { username, email, password } = req.body;
    // Add user to the database (implement your DB logic here)
    console.log('New user:', { username, email, password });
    res.redirect('/confirmation.html');
});

// Handle post item form submission and redirect to confirmation page
app.post('/post-item', upload.single('image'), (req, res) => {
    const { title, description, category } = req.body;
    const image = req.file;
    // Save the item to the database (implement your DB logic here)
    console.log('New trade item:', { title, description, category, image });
    res.redirect('/confirmation.html');
});

// Handle login form submission and redirect to confirmation page
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    // Check user credentials (implement your authentication logic here)
    console.log('User login:', { username, password });
    res.redirect('/confirmation.html');
});


app.post('/signup', (req, res) => {
    try {
        const { username, email, password } = req.body;
        // Add user to the database (implement your DB logic here)
        console.log('New user:', { username, email, password });
        res.redirect('/confirmation.html');
    } catch (error) {
        console.error('Error during sign-up:', error);
        res.status(500).send('An error occurred during sign-up.');
    }
});

app.post('/post-item', upload.single('image'), (req, res) => {
    try {
        const { title, description, category } = req.body;
        const image = req.file;
        // Save the item to the database (implement your DB logic here)
        console.log('New trade item:', { title, description, category, image });
        res.redirect('/confirmation.html');
    } catch (error) {
        console.error('Error during item posting:', error);
        res.status(500).send('An error occurred while posting the item.');
    }
});

app.post('/login', (req, res) => {
    try {
        const { username, password } = req.body;
        // Check user credentials (implement your authentication logic here)
        console.log('User login:', { username, password });
        res.redirect('/confirmation.html');
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('An error occurred during login.');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // Trade Items Management
    const tradeForm = document.getElementById('tradeForm');
    const tradeList = document.getElementById('tradeList');

    const displayTrades = async () => {
        try {
            const response = await fetch('/api/trades');
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            tradeList.innerHTML = data.trades.map(trade => `
                <div class="trade-item" data-id="${trade.id}">
                    <img src="${trade.image}" alt="${trade.name}" class="trade-image" onerror="this.src='images/fallback.png'; this.alt='Fallback Image';">
                    <strong>${trade.name}</strong>
                    <p>${trade.description}</p>
                    <button class="edit-btn">Edit</button>
                    <button class="delete-btn">Delete</button>
                </div>
            `).join('');
            attachEventListeners();
        } catch (error) {
            console.error('Error fetching trades:', error);
        }
    };

    const attachEventListeners = () => {
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const tradeElement = e.target.closest('.trade-item');
                const tradeId = tradeElement.dataset.id;
                const tradeName = prompt('Enter new name:', tradeElement.querySelector('strong').innerText);
                const tradeDescription = prompt('Enter new description:', tradeElement.querySelector('p').innerText);
                if (tradeName && tradeDescription) {
                    updateTrade(tradeId, tradeName, tradeDescription);
                }
            });
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const tradeElement = e.target.closest('.trade-item');
                const tradeId = tradeElement.dataset.id;
                deleteTrade(tradeId);
            });
        });
    };

    if (tradeForm) {
        tradeForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const tradeName = document.getElementById('itemName').value;
            const tradeDescription = document.getElementById('itemDescription').value;
            const tradeImage = document.getElementById('itemImage').files[0];

            const formData = new FormData();
            formData.append('name', tradeName);
            formData.append('description', tradeDescription);
            formData.append('image', tradeImage);

            try {
                const response = await fetch('/api/trades', {
                    method: 'POST',
                    body: formData
                });
                if (!response.ok) throw new Error('Failed to add trade');
                const result = await response.json();
                if (result.id) {
                    displayTrades();
                }
                tradeForm.reset();
            } catch (error) {
                console.error('Error adding trade:', error);
            }
        });
    }

    const updateTrade = async (id, name, description) => {
        try {
            const response = await fetch(`/api/trades/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, description }),
            });
            if (!response.ok) throw new Error('Failed to update trade');
            const result = await response.json();
            if (result.updated) {
                displayTrades();
            }
        } catch (error) {
            console.error('Error updating trade:', error);
        }
    };

    const deleteTrade = async (id) => {
        try {
            const response = await fetch(`/api/trades/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete trade');
            const result = await response.json();
            if (result.deleted) {
                displayTrades();
            }
        } catch (error) {
            console.error('Error deleting trade:', error);
        }
    };

    displayTrades();

    // About Modal Management
    const readMoreLink = document.getElementById('readMoreLink');
    const aboutModal = document.getElementById('aboutModal');

    if (readMoreLink && aboutModal) {
        readMoreLink.addEventListener('click', (e) => {
            e.preventDefault();
            aboutModal.classList.remove('hidden');
        });

        const modalLink = document.querySelector('.modal-link');
        if (modalLink) {
            modalLink.addEventListener('click', () => {
                aboutModal.classList.add('hidden');
            });
        }
    }
});

document.getElementById('searchButton').addEventListener('click', () => {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const items = document.querySelectorAll('.trade-item');
    items.forEach(item => {
        const itemName = item.querySelector('strong').innerText.toLowerCase();
        item.style.display = itemName.includes(query) ? 'block' : 'none';
    });
});

document.getElementById('signUpBtn').addEventListener('click', (e) => {
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;
    if (!email || !password) {
        e.preventDefault();
        alert('Please fill in all fields.');
    }
});


document.getElementById('signUpForm').addEventListener('submit', function(event) {
    const fullName = document.getElementById('fullName').value;
    const idNumber = document.getElementById('idNumber').value;
    const cardNumber = document.getElementById('cardNumber').value;

    if (!fullName || !idNumber || !cardNumber) {
        event.preventDefault();
        alert('Please fill in all required fields.');
    }
});


function displayConfirmation() {
    document.getElementById('signUpForm').style.display = 'none';
    document.getElementById('confirmationMessage').style.display = 'block';
    return false; // Prevent form submission for demo purposes
}

document.cookie = "sessionId=abc123; Secure; HttpOnly; SameSite=Strict";


const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes"
});

app.use('/api/', apiLimiter);


const { body, validationResult } = require('express-validator');

app.post('/signup', [
  body('username').isAlphanumeric().trim().escape(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).trim().escape()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // Proceed with user registration
});
