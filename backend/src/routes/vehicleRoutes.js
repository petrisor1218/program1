const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
const History = require('../models/History');

// Obține toate vehiculele
router.get('/', async (req, res) => {
    try {
        const filters = {};
        if (req.query.tip) filters.tip = req.query.tip;
        if (req.query.activ !== undefined) filters.activ = req.query.activ;

        const vehicles = await Vehicle.find(filters)
            .sort({ nume: 1 });
        res.json(vehicles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obține un vehicul specific
router.get('/:id', async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehiculul nu a fost găsit' });
        }
        res.json(vehicle);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Adaugă un vehicul nou
router.post('/', async (req, res) => {
    const vehicle = new Vehicle({
        id: req.body.id,
        nume: req.body.nume,
        tip: req.body.tip,
        kmCurent: req.body.kmCurent,
        dataAchizitie: req.body.dataAchizitie,
        salariuBaza: req.body.salariuBaza,
        diurnaZilnica: req.body.diurnaZilnica,
        documente: req.body.documente
    });

    try {
        const newVehicle = await vehicle.save();

        // Adaugă în istoric
        await History.logModificare(
            'Vehicle',
            newVehicle._id,
            'Creare',
            [],
            req.user?._id,
            'Vehicul nou adăugat'
        );

        res.status(201).json(newVehicle);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Actualizează un vehicul
router.patch('/:id', async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehiculul nu a fost găsit' });
        }

        const modificari = [];
        Object.keys(req.body).forEach(key => {
            if (req.body[key] !== undefined) {
                modificari.push({
                    camp: key,
                    valoareVeche: vehicle[key],
                    valoareNoua: req.body[key]
                });
                vehicle[key] = req.body[key];
            }
        });

        const updatedVehicle = await vehicle.save();

        // Adaugă în istoric
        await History.logModificare(
            'Vehicle',
            vehicle._id,
            'Modificare',
            modificari,
            req.user?._id,
            'Actualizare date vehicul'
        );

        res.json(updatedVehicle);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Adaugă entry în istoricul de service
router.post('/:id/service', async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehiculul nu a fost găsit' });
        }

        vehicle.serviceHistory.push({
            id: req.body.id,
            date: req.body.date,
            km: req.body.km,
            type: req.body.type,
            details: req.body.details,
            cost: req.body.cost,
            provider: req.body.provider,
            nextServiceKm: req.body.nextServiceKm,
            urgency: req.body.urgency,
            componentsServiced: req.body.componentsServiced
        });

        const updatedVehicle = await vehicle.save();

        // Adaugă în istoric
        await History.logModificare(
            'Vehicle',
            vehicle._id,
            'Modificare',
            [{
                camp: 'serviceHistory',
                valoareNoua: req.body
            }],
            req.user?._id,
            'Adăugare înregistrare service'
        );

        res.json(updatedVehicle);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;