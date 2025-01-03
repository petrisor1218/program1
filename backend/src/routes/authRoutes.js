// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');

// Înregistrare utilizator nou
router.post('/register', async (req, res) => {
    try {
        // Verificăm dacă există deja un utilizator cu acest email
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email-ul este deja înregistrat' });
        }

        const user = new User(req.body);
        await user.save();
        
        const token = user.generateAuthToken();
        
        res.status(201).json({ 
            user: {
                id: user._id,
                nume: user.nume,
                email: user.email,
                rol: user.rol
            }, 
            token 
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user || !user.activ) {
            return res.status(401).json({ message: 'Date de autentificare incorecte' });
        }

        const isMatch = await bcrypt.compare(req.body.parola, user.parola);
        if (!isMatch) {
            return res.status(401).json({ message: 'Date de autentificare incorecte' });
        }

        const token = user.generateAuthToken();
        
        res.json({ 
            user: {
                id: user._id,
                nume: user.nume,
                email: user.email,
                rol: user.rol
            }, 
            token 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obține utilizatorul curent
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-parola');
        if (!user || !user.activ) {
            return res.status(404).json({ message: 'Utilizator negăsit' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;