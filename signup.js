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

// server.js
const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const app = express();
const port = 3000;

// Configure MongoDB connection
mongoose.connect('mongodb://localhost/onemans_trash', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Configure file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});
const upload = multer({ storage: storage });

// Create User Schema
const userSchema = new mongoose.Schema({
    fullName: String,
    idNumber: String,
    expDate: Date,
    dob: Date,
    idPhotoPath: String,
    cardNumber: String,
    agreementSignature: String,
    verified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// API endpoint for signup
app.post('/api/signup', upload.single('idPhoto'), async (req, res) => {
    try {
        const newUser = new User({
            fullName: req.body.fullName,
            idNumber: req.body.idNumber,
            expDate: req.body.expDate,
            dob: req.body.dob,
            idPhotoPath: req.file.path,
            cardNumber: req.body.cardNumber,
            agreementSignature: req.body.agreeName
        });

        await newUser.save();

        // Send confirmation email
        await sendConfirmationEmail(req.body.email);

        res.status(200).json({
            message: 'Signup successful',
            userId: newUser._id
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

// email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your-email@gmail.com',
        pass: 'your-app-password'
    }
});

async function sendConfirmationEmail(userEmail) {
    try {
        await transporter.sendMail({
            from: 'your-email@gmail.com',
            to: userEmail,
            subject: 'One Man\'s Trash - Account Under Review',
            html: `
                <h1>Thank you for signing up!</h1>
                <p>Your account is currently under review. We'll notify you once it's approved.</p>
                <p>In the meantime, feel free to browse our site.</p>
            `
        });
    } catch (error) {
        console.error('Email error:', error);
    }
}

module.exports = { sendConfirmationEmail };
