const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    nume: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    parola: {
        type: String,
        required: true,
        minlength: 6
    },
    rol: {
        type: String,
        enum: ['admin', 'manager', 'operator'],
        default: 'operator'
    },
    activ: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Hash parola înainte de salvare
userSchema.pre('save', async function(next) {
    if (this.isModified('parola')) {
        this.parola = await bcrypt.hash(this.parola, 8);
    }
    next();
});

// Generare token JWT
userSchema.methods.generateAuthToken = function() {
    return jwt.sign(
        { userId: this._id.toString() }, 
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

const User = mongoose.model('User', userSchema);

module.exports = User;