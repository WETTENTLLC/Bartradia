require('dotenv').config(); // Add environment variables support
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for security
app.use(express.json({ limit: '10mb' })); // Limit payload size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving
app.use(express.static(path.join(__dirname, 'public')));

// Ensure uploads directory exists
const uploadDir = 'public/uploads';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads with validation
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        // Add file type validation
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    // Allow only specific file types
    const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPG, JPEG, PNG & GIF files are allowed.'));
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Database initialization
const db = new sqlite3.Database(':memory:', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to the in-memory SQLite database');
    }
});

// Database setup
db.serialize(() => {
    db.run(`CREATE TABLE trades (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        image TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

// Input validation middleware
const validateTradeInput = (req, res, next) => {
    const { name, description } = req.body;
    if (!name || !description) {
        return res.status(400).json({ error: 'Name and description are required' });
    }
    if (name.length > 100) {
        return res.status(400).json({ error: 'Name must be less than 100 characters' });
    }
    if (description.length > 1000) {
        return res.status(400).json({ error: 'Description must be less than 1000 characters' });
    }
    next();
};

// API Routes
app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;
    
    // Basic validation
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    console.log(`Contact received: Name: ${name}, Email: ${email}, Message: ${message}`);
    res.json({ success: true });
});

app.post('/api/trades', upload.single('image'), validateTradeInput, (req, res) => {
    const { name, description } = req.body;
    
    if (!req.file) {
        return res.status(400).json({ error: 'Image is required' });
    }

    const image = `/uploads/${req.file.filename}`;
    
    db.run(
        "INSERT INTO trades (name, description, image) VALUES (?, ?, ?)",
        [name, description, image],
        function(err) {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Failed to create trade' });
            }
            res.json({ id: this.lastID, name, description, image });
        }
    );
});

app.get('/api/trades', (req, res) => {
    db.all("SELECT * FROM trades ORDER BY created_at DESC", [], (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to fetch trades' });
        }
        res.json({ trades: rows });
    });
});

app.put('/api/trades/:id', validateTradeInput, (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;

    db.run(
        "UPDATE trades SET name = ?, description = ? WHERE id = ?",
        [name, description, id],
        function(err) {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Failed to update trade' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Trade not found' });
            }
            res.json({ updated: true, id });
        }
    );
});

app.delete('/api/trades/:id', (req, res) => {
    const { id } = req.params;
    
    db.run("DELETE FROM trades WHERE id = ?", id, function(err) {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to delete trade' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Trade not found' });
        }
        res.json({ deleted: true, id });
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Cleanup on server shutdown
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err);
        } else {
            console.log('Database connection closed');
        }
        process.exit(0);
    });
});
