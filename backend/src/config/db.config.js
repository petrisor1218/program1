const mongoose = require('mongoose');
require('dotenv').config();

// Configurare pentru diferite medii
const getMongoURI = () => {
    if (process.env.NODE_ENV === 'production') {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is required in production');
        }
        return process.env.MONGODB_URI;
    }
    return process.env.MONGODB_URI || 'mongodb://localhost/salarizare';
};

// Opțiuni conexiune MongoDB - actualizate pentru versiunea nouă
const mongoOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4 // Forțează IPv4
};

// Event handlers pentru monitorizare
mongoose.connection.on('connected', () => {
    console.log('MongoDB connected successfully');
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

// Funcția principală de conectare
const connectDB = async () => {
    try {
        const mongoURI = getMongoURI();
        await mongoose.connect(mongoURI, mongoOptions);
    } catch (error) {
        console.error('MongoDB connection error:', error);
        // Încercăm să reconectăm după 5 secunde
        console.log('Retrying connection in 5 seconds...');
        setTimeout(() => {
            connectDB();
        }, 5000);
    }
};

// Gestionare închidere gracefully
process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
    } catch (err) {
        console.error('Error during MongoDB disconnection:', err);
        process.exit(1);
    }
});

module.exports = connectDB;