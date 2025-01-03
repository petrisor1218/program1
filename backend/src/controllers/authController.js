// src/controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.login = async (req, res) => {
    try {
        const { email, parola } = req.body;  // folosim parola în loc de password
        
        const user = await User.findOne({ email });
        if (!user || !user.activ) {  // adăugăm verificarea pentru user activ
            return res.status(401).json({ message: 'Autentificare eșuată' });
        }

        const isMatch = await bcrypt.compare(parola, user.parola);
        if (!isMatch) {
            return res.status(401).json({ message: 'Autentificare eșuată' });
        }

        // Folosim metoda din model pentru generarea token-ului
        const token = user.generateAuthToken();

        res.json({
            token,
            user: {
                id: user._id,
                nume: user.nume,
                email: user.email,
                rol: user.rol  // folosim rol în loc de role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Eroare la autentificare' });
    }
};

// Adăugăm și metoda pentru verificarea utilizatorului curent
exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-parola');
        if (!user || !user.activ) {
            return res.status(404).json({ message: 'Utilizator negăsit' });
        }
        res.json(user);
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ message: 'Eroare la obținerea datelor utilizatorului' });
    }
};