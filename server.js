require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const multer = require('multer');
const fs = require('fs');

// Constants
const CONFIG = {
    PORT: process.env.PORT || 3000,
    UPLOAD_DIR: 'public/uploads',
    DB_PATH: ':memory:', // Consider changing to a file-based DB for persistence
    FILE_LIMITS: {
        SIZE: 5 * 1024 * 1024, // 5MB
        TYPES: ['.jpg', '.jpeg', '.png', '.gif']
    },
    VALIDATION: {
        NAME_MAX_LENGTH: 100,
        DESC_MAX_LENGTH: 1000,
        EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    }
};

// Initialize Express app
const app = express();

// Security Middleware
const configureSecurityMiddleware = (app) => {
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    // Add more security middleware here (helmet, cors, etc.)
};

// File Upload Configuration
const configureFileUpload = () => {
    // Ensure uploads directory exists
    if (!fs.existsSync(CONFIG.UPLOAD_DIR)) {
        fs.mkdirSync(CONFIG.UPLOAD_DIR, { recursive: true });
    }

    const storage = multer.diskStorage({
        destination: (req, file, cb) => cb(null, CONFIG.UPLOAD_DIR),
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname).toLowerCase();
            const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`;
            cb(null, uniqueName);
        }
    });

    const fileFilter = (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (CONFIG.FILE_LIMITS.TYPES.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error(`Invalid file type. Allowed types: ${CONFIG.FILE_LIMITS.TYPES.join(', ')}`));
        }
    };

    return multer({
        storage,
        fileFilter,
        limits: { fileSize: CONFIG.FILE_LIMITS.SIZE }
    });
};

// Database Configuration
class Database {
    constructor() {
        this.db = new sqlite3.Database(CONFIG.DB_PATH, (err) => {
            if (err) {
                console.error('Database connection error:', err);
            } else {
                console.log('Connected to SQLite database');
                this.initialize();
            }
        });
    }

    initialize() {
        this.db.serialize(() => {
            this.db.run(`CREATE TABLE IF NOT EXISTS trades (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT NOT NULL,
                image TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);
        });
    }

    close() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }
}

// Validation Middleware
const validators = {
    trade: (req, res, next) => {
        const { name, description } = req.body;
        
        if (!name || !description) {
            return res.status(400).json({ error: 'Name and description are required' });
        }
        if (name.length > CONFIG.VALIDATION.NAME_MAX_LENGTH) {
            return res.status(400).json({ error: `Name must be less than ${CONFIG.VALIDATION.NAME_MAX_LENGTH} characters` });
        }
        if (description.length > CONFIG.VALIDATION.DESC_MAX_LENGTH) {
            return res.status(400).json({ error: `Description must be less than ${CONFIG.VALIDATION.DESC_MAX_LENGTH} characters` });
        }
        next();
    },

    contact: (req, res, next) => {
        const { name, email, message } = req.body;
        
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        if (!CONFIG.VALIDATION.EMAIL_REGEX.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }
        next();
    }
};

// Route Handlers
const handlers = {
    contact: {
        create: (req, res) => {
            const { name, email, message } = req.body;
            console.log(`Contact received: Name: ${name}, Email: ${email}, Message: ${message}`);
            res.json({ success: true });
        }
    },

    trades: {
        create: (req, res) => {
            const { name, description } = req.body;
            if (!req.file) {
                return res.status(400).json({ error: 'Image is required' });
            }

            const image = `/uploads/${req.file.filename}`;
            
            db.db.run(
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
        },

        getAll: (req, res) => {
            db.db.all("SELECT * FROM trades ORDER BY created_at DESC", [], (err, rows) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Failed to fetch trades' });
                }
                res.json({ trades: rows });
            });
        },

        update: (req, res) => {
            const { id } = req.params;
            const { name, description } = req.body;

            db.db.run(
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
        },

        delete: (req, res) => {
            const { id } = req.params;
            
            db.db.run("DELETE FROM trades WHERE id = ?", id, function(err) {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Failed to delete trade' });
                }
                if (this.changes === 0) {
                    return res.status(404).json({ error: 'Trade not found' });
                }
                res.json({ deleted: true, id });
            });
        }
    }
};

// Initialize
const upload = configureFileUpload();
const db = new Database();

// Configure middleware
configureSecurityMiddleware(app);
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.post('/api/contact', validators.contact, handlers.contact.create);
app.post('/api/trades', upload.single('image'), validators.trade, handlers.trades.create);
app.get('/api/trades', handlers.trades.getAll);
app.put('/api/trades/:id', validators.trade, handlers.trades.update);
app.delete('/api/trades/:id', handlers.trades.delete);

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: err.message || 'Something broke!' });
});

// Server startup
const server = app.listen(CONFIG.PORT, () => {
    console.log(`Server running on port ${CONFIG.PORT}`);
});

// Graceful shutdown
const shutdown = async () => {
    try {
        await db.close();
        console.log('Database connection closed');
        server.close(() => {
            console.log('Server shut down');
            process.exit(0);
        });
    } catch (err) {
        console.error('Error during shutdown:', err);
        process.exit(1);
    }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// server.js
const path = require('path');

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// server.js
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Route to render the signup page
app.get('/signup', (req, res) => {
    res.render('pages/signup');
});

