const express = require('express');
const router = express.Router();
const Fine = require('../models/Fine');
const Driver = require('../models/Driver');
const Vehicle = require('../models/Vehicle');
const History = require('../models/History');

// Obține toate amenzile
router.get('/', async (req, res) => {
    try {
        const filters = {};
        if (req.query.statusPlata) filters.statusPlata = req.query.statusPlata;
        if (req.query.sofer) filters.sofer = req.query.sofer;
        if (req.query.vehicul) filters.vehicul = req.query.vehicul;
        if (req.query.tipAmenda) filters.tipAmenda = req.query.tipAmenda;

        const amenzi = await Fine.find(filters)
            .populate('sofer', 'nume')
            .populate('vehicul', 'id nume')
            .sort({ dataAmenda: -1 });
        res.json(amenzi);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obține amenzile unui șofer
router.get('/sofer/:soferId', async (req, res) => {
    try {
        const amenzi = await Fine.find({ sofer: req.params.soferId })
            .populate('sofer', 'nume')
            .populate('vehicul', 'id nume')
            .sort({ dataAmenda: -1 });
        res.json(amenzi);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Adaugă o amendă nouă
router.post('/', async (req, res) => {
    try {
        // Verifică dacă șoferul și vehiculul există
        const [driver, vehicle] = await Promise.all([
            Driver.findById(req.body.sofer),
            Vehicle.findById(req.body.vehicul)
        ]);

        if (!driver) {
            return res.status(404).json({ message: 'Șoferul nu a fost găsit' });
        }
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehiculul nu a fost găsit' });
        }

        const amenda = new Fine({
            sofer: req.body.sofer,
            vehicul: req.body.vehicul,
            dataAmenda: req.body.dataAmenda,
            sumaTotala: req.body.sumaTotala,
            moneda: req.body.moneda,
            tipAmenda: req.body.tipAmenda,
            detaliiAmenda: req.body.detaliiAmenda,
            termeneImportante: req.body.termeneImportante,
            documente: req.body.documente
        });

        const newFine = await amenda.save();

        // Adaugă în istoric
        await History.logModificare(
            'Fine',
            newFine._id,
            'Creare',
            [],
            req.user?._id,
            'Amendă nouă înregistrată'
        );

        res.status(201).json(newFine);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Actualizează o amendă
router.patch('/:id', async (req, res) => {
    try {
        const amenda = await Fine.findById(req.params.id);
        if (!amenda) {
            return res.status(404).json({ message: 'Amenda nu a fost găsită' });
        }

        const modificari = [];
        Object.keys(req.body).forEach(key => {
            if (req.body[key] !== undefined) {
                modificari.push({
                    camp: key,
                    valoareVeche: amenda[key],
                    valoareNoua: req.body[key]
                });
                amenda[key] = req.body[key];
            }
        });

        const updatedFine = await amenda.save();

        // Adaugă în istoric
        await History.logModificare(
            'Fine',
            amenda._id,
            'Modificare',
            modificari,
            req.user?._id,
            'Actualizare amendă'
        );

        res.json(updatedFine);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Adaugă plată pentru amendă
router.post('/:id/plati', async (req, res) => {
    try {
        const amenda = await Fine.findById(req.params.id);
        if (!amenda) {
            return res.status(404).json({ message: 'Amenda nu a fost găsită' });
        }

        amenda.plati.push({
            data: req.body.data,
            suma: req.body.suma,
            metodaPlata: req.body.metodaPlata,
            documentPlata: req.body.documentPlata
        });

        const updatedFine = await amenda.save();

        // Adaugă în istoric
        await History.logModificare(
            'Fine',
            amenda._id,
            'Modificare',
            [{
                camp: 'plati',
                valoareNoua: req.body
            }],
            req.user?._id,
            'Adăugare plată nouă'
        );

        res.json(updatedFine);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Adaugă contestație
router.post('/:id/contestatie', async (req, res) => {
    try {
        const amenda = await Fine.findById(req.params.id);
        if (!amenda) {
            return res.status(404).json({ message: 'Amenda nu a fost găsită' });
        }

        amenda.contestatie = {
            status: req.body.status,
            dataDepunere: req.body.dataDepunere,
            numarDosar: req.body.numarDosar,
            instanta: req.body.instanta
        };

        const updatedFine = await amenda.save();

        // Adaugă în istoric
        await History.logModificare(
            'Fine',
            amenda._id,
            'Modificare',
            [{
                camp: 'contestatie',
                valoareNoua: req.body
            }],
            req.user?._id,
            'Adăugare contestație'
        );

        res.json(updatedFine);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;