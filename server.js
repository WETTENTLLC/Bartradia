const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const multer = require('multer');
const app = express();
const PORT = process.env.PORT || 3000;

const db = new sqlite3.Database(':memory:');
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

db.serialize(() => {
    db.run("CREATE TABLE trades (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, description TEXT, image TEXT)");

    app.post('/api/contact', (req, res) => {
        const { name, email, message } = req.body;
        console.log(`Contact received: Name: ${name}, Email: ${email}, Message: ${message}`);
        res.json({ success: true });
    });

    app.post('/api/trades', upload.single('image'), (req, res) => {
        const { name, description } = req.body;
        const image = `/uploads/${req.file.filename}`;
        db.run("INSERT INTO trades (name, description, image) VALUES (?, ?, ?)", [name, description, image], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
        });
    });

    app.get('/api/trades', (req, res) => {
        db.all("SELECT * FROM trades", [], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ trades: rows });
        });
    });

    app.put('/api/trades/:id', (req, res) => {
        const { id } = req.params;
        const { name, description } = req.body;
        db.run("UPDATE trades SET name = ?, description = ? WHERE id = ?", [name, description, id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ updated: this.changes });
        });
    });

    app.delete('/api/trades/:id', (req, res) => {
        const { id } = req.params;
        db.run("DELETE FROM trades WHERE id = ?", id, function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ deleted: this.changes });
        });
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
