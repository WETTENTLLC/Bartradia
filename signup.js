// config.js
const config = {
    mongodb: {
        url: process.env.MONGODB_URI || 'mongodb://localhost/onemans_trash',
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    },
    email: {
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    },
    upload: {
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif'],
        maxSize: 5 * 1024 * 1024 // 5MB
    }
};

module.exports = config;

// models/User.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    fullName: { 
        type: String, 
        required: true,
        trim: true
    },
    idNumber: { 
        type: String, 
        required: true,
        unique: true
    },
    expDate: { 
        type: Date, 
        required: true 
    },
    dob: { 
        type: Date, 
        required: true 
    },
    idPhotoPath: { 
        type: String, 
        required: true 
    },
    cardNumber: { 
        type: String, 
        required: true 
    },
    agreementSignature: { 
        type: String, 
        required: true 
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    verified: { 
        type: Boolean, 
        default: false 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('User', userSchema);

// middleware/upload.js
const multer = require('multer');
const path = require('path');
const config = require('../config');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (config.upload.allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: config.upload.maxSize
    }
});

module.exports = upload;

// services/emailService.js
const nodemailer = require('nodemailer');
const config = require('../config');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport(config.email);
    }

    async sendConfirmationEmail(userEmail) {
        try {
            await this.transporter.sendMail({
                from: config.email.auth.user,
                to: userEmail,
                subject: "One Man's Trash - Account Under Review",
                html: `
                    <h1>Thank you for signing up!</h1>
                    <p>Your account is currently under review. We'll notify you once it's approved.</p>
                    <p>In the meantime, feel free to browse our site.</p>
                `
            });
            return true;
        } catch (error) {
            console.error('Email error:', error);
            throw new Error('Failed to send confirmation email');
        }
    }
}

module.exports = new EmailService();

// controllers/userController.js
const User = require('../models/User');
const emailService = require('../services/emailService');

class UserController {
    async signup(req, res) {
        try {
            // Validate request
            if (!req.file) {
                return res.status(400).json({ error: 'ID photo is required' });
            }

            // Create new user
            const newUser = new User({
                fullName: req.body.fullName,
                idNumber: req.body.idNumber,
                expDate: req.body.expDate,
                dob: req.body.dob,
                idPhotoPath: req.file.path,
                cardNumber: req.body.cardNumber,
                agreementSignature: req.body.agreeName,
                email: req.body.email
            });

            // Save user
            await newUser.save();

            // Send confirmation email
            await emailService.sendConfirmationEmail(req.body.email);

            res.status(201).json({
                message: 'Signup successful',
                userId: newUser._id
            });
        } catch (error) {
            console.error('Signup error:', error);
            if (error.code === 11000) {
                return res.status(400).json({ 
                    error: 'User already exists with this ID number or email' 
                });
            }
            res.status(500).json({ error: 'Server error during signup' });
        }
    }
}

module.exports = new UserController();

// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const userController = require('../controllers/userController');

router.post('/signup', 
    upload.single('idPhoto'),
    userController.signup
);

module.exports = router;

// server.js
const express = require('express');
const mongoose = require('mongoose');
const config = require('./config');
const userRoutes = require('./routes/userRoutes');

const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(config.mongodb.url, config.mongodb.options)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
