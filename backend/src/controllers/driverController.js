const Driver = require('../models/Driver');
const History = require('../models/History');

// GET - Obține toți șoferii
exports.getAllDrivers = async (req, res) => {
    try {
        const filters = {};
        if (req.query.activ !== undefined) {
            filters.activ = req.query.activ === 'true'; // Convertim la boolean
        }

        const drivers = await Driver.find(filters)
            .populate('vehiculAsignat')
            .sort({ nume: 1 });

        res.json(drivers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// GET - Obține un șofer după ID
exports.getDriverById = async (req, res) => {
    try {
        const driver = await Driver.findById(req.params.id)
            .populate('vehiculAsignat', 'numarInmatriculare marca model')
            .populate('istoricVehicule.vehicul', 'numarInmatriculare marca model');

        if (!driver) {
            return res.status(404).json({ message: 'Șoferul nu a fost găsit' });
        }

        res.json(driver);
    } catch (error) {
        res.status(500).json({ 
            message: 'Eroare la obținerea șoferului',
            error: error.message 
        });
    }
};

// POST - Creează un șofer nou
exports.createDriver = async (req, res) => {
    try {
        // Verifică dacă CNP-ul există deja
        const existingDriver = await Driver.findOne({ cnp: req.body.cnp });
        if (existingDriver) {
            return res.status(400).json({ message: 'Există deja un șofer cu acest CNP' });
        }

        const driver = new Driver(req.body);
        const savedDriver = await driver.save();

        // Adaugă în istoric
        await History.logModificare(
            'Driver',
            savedDriver._id,
            'Creare',
            [],
            req.user?._id,
            `Șofer nou adăugat: ${savedDriver.nume}`
        );

        res.status(201).json(savedDriver);
    } catch (error) {
        res.status(400).json({ 
            message: 'Eroare la crearea șoferului',
            error: error.message 
        });
    }
};

// PUT - Actualizează un șofer
exports.updateDriver = async (req, res) => {
    try {
        // Verifică dacă se modifică CNP-ul și dacă noul CNP există deja
        if (req.body.cnp) {
            const existingDriver = await Driver.findOne({ 
                cnp: req.body.cnp,
                _id: { $ne: req.params.id }
            });
            if (existingDriver) {
                return res.status(400).json({ message: 'Există deja un șofer cu acest CNP' });
            }
        }

        const oldDriver = await Driver.findById(req.params.id);
        if (!oldDriver) {
            return res.status(404).json({ message: 'Șoferul nu a fost găsit' });
        }

        // Construiește array-ul de modificări pentru istoric
        const modificari = [];
        for (const [key, value] of Object.entries(req.body)) {
            if (oldDriver[key] !== value) {
                modificari.push({
                    camp: key,
                    valoareVeche: oldDriver[key],
                    valoareNoua: value
                });
            }
        }

        const updatedDriver = await Driver.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('vehiculAsignat', 'numarInmatriculare marca model');

        // Adaugă în istoric
        if (modificari.length > 0) {
            await History.logModificare(
                'Driver',
                updatedDriver._id,
                'Modificare',
                modificari,
                req.user?._id,
                `Șofer modificat: ${updatedDriver.nume}`
            );
        }

        res.json(updatedDriver);
    } catch (error) {
        res.status(400).json({ 
            message: 'Eroare la actualizarea șoferului',
            error: error.message 
        });
    }
};

// DELETE - Șterge un șofer
exports.deleteDriver = async (req, res) => {
    try {
        const driver = await Driver.findById(req.params.id);
        if (!driver) {
            return res.status(404).json({ message: 'Șoferul nu a fost găsit' });
        }

        // În loc să ștergem efectiv, marcăm ca inactiv
        driver.activ = false;
        driver.status = 'Inactiv';
        await driver.save();

        // Adaugă în istoric
        await History.logModificare(
            'Driver',
            driver._id,
            'Dezactivare',
            [],
            req.user?._id,
            `Șofer dezactivat: ${driver.nume}`
        );

        res.json({ message: 'Șofer dezactivat cu succes' });
    } catch (error) {
        res.status(500).json({ 
            message: 'Eroare la dezactivarea șoferului',
            error: error.message 
        });
    }
};