const express = require('express');
const router = express.Router();
const History = require('../models/History');

// Obține tot istoricul
router.get('/', async (req, res) => {
    try {
        const filters = {};
        if (req.query.tipEntitate) filters.tipEntitate = req.query.tipEntitate;
        if (req.query.tipActiune) filters.tipActiune = req.query.tipActiune;
        if (req.query.utilizator) filters.utilizator = req.query.utilizator;

        // Adaugă filtre pentru dată dacă sunt specificate
        if (req.query.startDate || req.query.endDate) {
            filters.dataPrincipala = {};
            if (req.query.startDate) {
                filters.dataPrincipala.$gte = new Date(req.query.startDate);
            }
            if (req.query.endDate) {
                filters.dataPrincipala.$lte = new Date(req.query.endDate);
            }
        }

        const istoric = await History.find(filters)
            .populate('utilizator', 'nume email')
            .populate('idEntitate')
            .sort({ dataPrincipala: -1 })
            .limit(req.query.limit ? parseInt(req.query.limit) : 100);

        res.json(istoric);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obține istoricul unei entități specifice
router.get('/entitate/:tipEntitate/:idEntitate', async (req, res) => {
    try {
        const istoric = await History.find({
            tipEntitate: req.params.tipEntitate,
            idEntitate: req.params.idEntitate
        })
        .populate('utilizator', 'nume email')
        .sort({ dataPrincipala: -1 });

        res.json(istoric);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obține raport de activitate
router.get('/raport', async (req, res) => {
    try {
        const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
        const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();

        const raport = await History.getRaportActivitate(startDate, endDate, {
            tipEntitate: req.query.tipEntitate,
            tipActiune: req.query.tipActiune,
            utilizator: req.query.utilizator
        });

        res.json(raport);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obține statistici pentru dashboard
router.get('/statistici', async (req, res) => {
    try {
        const startDate = new Date(new Date().setDate(new Date().getDate() - 30));
        const endDate = new Date();

        const [modificariRecente, statisticiPerTip, topUtilizatori] = await Promise.all([
            // Ultimele modificări
            History.find()
                .sort({ dataPrincipala: -1 })
                .limit(5)
                .populate('utilizator', 'nume email'),

            // Statistici per tip de entitate
            History.aggregate([
                {
                    $match: {
                        dataPrincipala: { $gte: startDate, $lte: endDate }
                    }
                },
                {
                    $group: {
                        _id: "$tipEntitate",
                        total: { $sum: 1 }
                    }
                }
            ]),

            // Top utilizatori activi
            History.aggregate([
                {
                    $match: {
                        dataPrincipala: { $gte: startDate, $lte: endDate }
                    }
                },
                {
                    $group: {
                        _id: "$utilizator",
                        totalActiuni: { $sum: 1 }
                    }
                },
                {
                    $sort: { totalActiuni: -1 }
                },
                {
                    $limit: 5
                }
            ])
        ]);

        res.json({
            modificariRecente,
            statisticiPerTip,
            topUtilizatori
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;