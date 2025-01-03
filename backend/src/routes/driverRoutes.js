const express = require('express');
const router = express.Router();
const Driver = require('../models/Driver');
const Vehicle = require('../models/Vehicle');
const History = require('../models/History');
const Holiday = require('../models/Holiday');

// Obține toți șoferii
router.get('/', async (req, res) => {
    try {
        const drivers = await Driver.find()
            .populate('vehiculAsignat')
            .sort({ nume: 1 });
        res.json(drivers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obține un șofer specific
router.get('/', async (req, res) => {
    try {
        const drivers = await Driver.find();
        res.json(drivers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const driver = await Driver.findById(req.params.id);
        if (!driver) {
            return res.status(404).json({ message: 'Șoferul nu a fost găsit' });
        }
        res.json(driver);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id/perioade', async (req, res) => {
    try {
        const driver = await Driver.findById(req.params.id);
        if (!driver) {
            return res.status(404).json({ message: 'Șoferul nu a fost găsit' });
        }
        
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        
        const perioade = driver.perioade?.filter(p => 
            p.dataInceput.getMonth() + 1 === currentMonth &&
            p.dataInceput.getFullYear() === currentYear
        ) || [];
        
        res.json(perioade);
    } catch (error) {
        console.error('Error fetching perioade:', error);
        res.status(500).json({ 
            message: 'Eroare la obținerea perioadelor',
            error: error.message 
        });
    }
});
router.get('/:id/salariu', async (req, res) => {
    try {
        const { month, year } = req.query;
        const driver = await Driver.findById(req.params.id);
        if (!driver) {
            return res.status(404).json({ message: 'Șoferul nu a fost găsit' });
        }

        // Găsește salariul pentru luna specificată
        const salariu = driver.salarii.find(s => 
            new Date(s.data).getMonth() + 1 === parseInt(month) &&
            new Date(s.data).getFullYear() === parseInt(year)
        );

        if (!salariu) {
            return res.json({
                salariuBaza: driver.salariuBaza || 0,
                deduceri: [],
                avansuri: []
            });
        }

        res.json(salariu);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Adaugă un șofer nou
router.post('/', async (req, res) => {
    const driver = new Driver({
        nume: req.body.nume,
        cnp: req.body.cnp,
        dataAngajare: req.body.dataAngajare,
        dataNasterii: req.body.dataNasterii,
        permisConducere: req.body.permisConducere,
        contact: req.body.contact,
        vehiculAsignat: req.body.vehiculAsignat,
        status: req.body.status,
        documente: req.body.documente
    });

    try {
        if (req.body.vehiculAsignat) {
            const vehicle = await Vehicle.findById(req.body.vehiculAsignat);
            if (!vehicle) {
                return res.status(404).json({ message: 'Vehiculul specificat nu există' });
            }
        }

        const newDriver = await driver.save();

        // Adaugă în istoric
        await History.logModificare(
            'Driver',
            newDriver._id,
            'Creare',
            [],
            req.user?._id,
            'Șofer nou creat'
        );

        res.status(201).json(newDriver);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Actualizează un șofer
router.patch('/:id', async (req, res) => {
    try {
        const driver = await Driver.findById(req.params.id);
        if (!driver) {
            return res.status(404).json({ message: 'Șoferul nu a fost găsit' });
        }

        const modificari = [];
        Object.keys(req.body).forEach(key => {
            if (req.body[key] !== undefined) {
                modificari.push({
                    camp: key,
                    valoareVeche: driver[key],
                    valoareNoua: req.body[key]
                });
                driver[key] = req.body[key];
            }
        });

        const updatedDriver = await driver.save();

        // Adaugă în istoric
        await History.logModificare(
            'Driver',
            driver._id,
            'Modificare',
            modificari,
            req.user?._id,
            'Actualizare date șofer'
        );

        res.json(updatedDriver);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Adaugă salariu pentru un șofer
router.post('/:id/salarii', async (req, res) => {
    try {
        const driver = await Driver.findById(req.params.id);
        if (!driver) {
            return res.status(404).json({ message: 'Șoferul nu a fost găsit' });
        }

        driver.salarii.push({
            data: req.body.data,
            salariuBaza: req.body.salariuBaza,
            diurna: req.body.diurna,
            bonusuri: req.body.bonusuri,
            deduceri: req.body.deduceri,
            moneda: req.body.moneda
        });

        const updatedDriver = await driver.save();

        // Adaugă în istoric
        await History.logModificare(
            'Driver',
            driver._id,
            'Modificare',
            [{
                camp: 'salarii',
                valoareNoua: req.body
            }],
            req.user?._id,
            'Adăugare salariu nou'
        );

        res.json(updatedDriver);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Asignează vehicul
router.post('/:id/asignare-vehicul', async (req, res) => {
    try {
        const driver = await Driver.findById(req.params.id);
        if (!driver) {
            return res.status(404).json({ message: 'Șoferul nu a fost găsit' });
        }

        const vehicle = await Vehicle.findById(req.body.vehiculId);
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehiculul nu a fost găsit' });
        }

        // Adaugă vehiculul anterior în istoric dacă există
        if (driver.vehiculAsignat) {
            driver.istoricVehicule.push({
                vehicul: driver.vehiculAsignat,
                dataStart: req.body.dataStart || new Date(),
                dataStop: new Date(),
                motiv: req.body.motiv || 'Schimbare vehicul'
            });
        }

        driver.vehiculAsignat = vehicle._id;
        const updatedDriver = await driver.save();

        // Adaugă în istoric
        await History.logModificare(
            'Driver',
            driver._id,
            'Modificare',
            [{
                camp: 'vehiculAsignat',
                valoareVeche: driver.vehiculAsignat,
                valoareNoua: vehicle._id
            }],
            req.user?._id,
            'Asignare vehicul nou'
        );

        res.json(updatedDriver);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;