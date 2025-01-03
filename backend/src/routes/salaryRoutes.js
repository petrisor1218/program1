const express = require('express');
const router = express.Router();
const Salary = require('../models/Salary');
const Driver = require('../models/Driver');
const History = require('../models/History');
const SalaryService = require('../services/SalaryService');

// Obține toate salariile cu filtre
router.get('/', async (req, res) => {
    try {
        const filters = {};
        if (req.query.status) filters.status = req.query.status;
        if (req.query.sofer) filters.sofer = req.query.sofer;
        
        if (req.query.month && req.query.year) {
            const startDate = new Date(req.query.year, req.query.month - 1, 1);
            const endDate = new Date(req.query.year, req.query.month, 0);
            filters.luna = {
                $gte: startDate,
                $lte: endDate
            };
        }

        if (req.query.showInactive === 'false') {
            filters['sofer.activ'] = true;
        }

        const salarii = await Salary.find(filters)
            .populate('sofer', 'nume activ')
            .sort({ luna: -1 });
        res.json(salarii);
    } catch (error) {
        res.status(500).json({ mesaj: error.message });
    }
});

// Procesare automată salarii și diurnă
router.post('/process-automatic', async (req, res) => {
    try {
        console.log('Starting manual trigger of automatic salary processing...');
        await SalaryService.processAutomaticPayments();
        res.json({ mesaj: 'Automatic salary processing completed successfully' });
    } catch (error) {
        console.error('Error in manual salary processing:', error);
        res.status(500).json({ mesaj: error.message });
    }
});

// Calculare salariu
router.post('/calculate', async (req, res) => {
    try {
        const { soferId, luna, salariuBaza, zileLucrate, bonusuri, deduceri } = req.body;
        
        const salariu = await Salary.findOne({
            sofer: soferId,
            luna: new Date(luna)
        }).populate('sofer', 'nume');

        if (!salariu) {
            return res.status(404).json({ mesaj: 'Salariul nu a fost găsit' });
        }

        salariu.salariuBaza = salariuBaza;
        salariu.zileLucrate = zileLucrate;
        if (bonusuri) salariu.bonusuri = bonusuri;
        if (deduceri) salariu.deduceri = deduceri;

        const total = salariu.calculeazaTotal();
        salariu.status = 'calculat';
        const salariuActualizat = await salariu.save();

        await History.logModificare(
            'Salary',
            salariu._id,
            'Calculare',
            [],
            req.user?._id,
            'Salariu calculat'
        );

        res.json({
            ...salariuActualizat.toJSON(),
            total
        });
    } catch (error) {
        res.status(500).json({ mesaj: error.message });
    }
});

// Calculează diurna pe o perioadă specifică
router.post('/calculate-diurna', async (req, res) => {
    try {
        const { driverId, startDate, endDate } = req.body;
        const driver = await Driver.findById(driverId);
        if (!driver) {
            return res.status(404).json({ mesaj: 'Șoferul nu a fost găsit' });
        }

        const diurna = await SalaryService.calculateDiurna(
            driver, 
            new Date(startDate), 
            new Date(endDate)
        );

        res.json({ diurna });
    } catch (error) {
        res.status(500).json({ mesaj: error.message });
    }
});

// Obține salariile unui șofer specific
router.get('/sofer/:soferId', async (req, res) => {
    try {
        const salarii = await Salary.find({ sofer: req.params.soferId })
            .populate('sofer', 'nume')
            .sort({ luna: -1 });
        res.json(salarii);
    } catch (error) {
        res.status(500).json({ mesaj: error.message });
    }
});

// Adaugă un nou salariu
router.post('/', async (req, res) => {
    try {
        const driver = await Driver.findById(req.body.sofer);
        if (!driver) {
            return res.status(404).json({ mesaj: 'Șoferul nu a fost găsit' });
        }

        const salariu = new Salary({
            sofer: req.body.sofer,
            luna: new Date(req.body.luna),
            salariuBaza: req.body.salariuBaza,
            zileLucrate: req.body.zileLucrate,
            bonusuri: req.body.bonusuri || [],
            deduceri: req.body.deduceri || [],
            observatii: req.body.observatii,
            status: req.body.status || 'Draft',
            tipPlata: req.body.tipPlata || 'SALARIU'
        });

        if (req.body.tipPlata?.startsWith('DIURNA')) {
            await SalaryService.calculateDiurna(driver, salariu.luna, salariu.luna);
        } else {
            await salariu.actualizeazaDiurna();
        }

        const salariuNou = await salariu.save();

        await History.logModificare(
            'Salary',
            salariuNou._id,
            'Creare',
            [],
            req.user?._id,
            'Salariu nou creat'
        );

        res.status(201).json(salariuNou);
    } catch (error) {
        res.status(400).json({ mesaj: error.message });
    }
});

// Actualizează un salariu
router.patch('/:id', async (req, res) => {
    try {
        const salariu = await Salary.findById(req.params.id);
        if (!salariu) {
            return res.status(404).json({ mesaj: 'Salariul nu a fost găsit' });
        }

        const modificari = [];
        Object.keys(req.body).forEach(key => {
            if (req.body[key] !== undefined) {
                modificari.push({
                    camp: key,
                    valoareVeche: salariu[key],
                    valoareNoua: req.body[key]
                });
                salariu[key] = req.body[key];
            }
        });

        if (req.body.luna) {
            if (salariu.tipPlata?.startsWith('DIURNA')) {
                const driver = await Driver.findById(salariu.sofer);
                await SalaryService.calculateDiurna(driver, new Date(req.body.luna), new Date(req.body.luna));
            } else {
                await salariu.actualizeazaDiurna();
            }
        }

        const salariuActualizat = await salariu.save();

        await History.logModificare(
            'Salary',
            salariu._id,
            'Modificare',
            modificari,
            req.user?._id,
            'Actualizare salariu'
        );

        res.json(salariuActualizat);
    } catch (error) {
        res.status(400).json({ mesaj: error.message });
    }
});

// Finalizare salariu
router.post('/:id/finalize', async (req, res) => {
    try {
        const salariu = await Salary.findById(req.params.id)
            .populate('sofer', 'nume');
        
        if (!salariu) {
            return res.status(404).json({ mesaj: 'Salariul nu a fost găsit' });
        }

        if (salariu.status !== 'calculat') {
            return res.status(400).json({ 
                mesaj: 'Salariul trebuie să fie calculat înainte de finalizare' 
            });
        }

        salariu.status = 'finalizat';
        salariu.dataFinalizare = new Date();
        const salariuActualizat = await salariu.save();
        
        await History.logModificare(
            'Salary',
            salariu._id,
            'Finalizare',
            [{
                camp: 'status',
                valoareVeche: 'calculat',
                valoareNoua: 'finalizat'
            }],
            req.user?._id,
            `Salariu finalizat pentru ${salariu.sofer?.nume || 'N/A'}`
        );
        
        res.json(salariuActualizat);
    } catch (error) {
        res.status(500).json({ mesaj: error.message });
    }
});

// Adaugă bonus
router.post('/:id/bonus', async (req, res) => {
    try {
        const salariu = await Salary.findById(req.params.id);
        if (!salariu) {
            return res.status(404).json({ mesaj: 'Salariul nu a fost găsit' });
        }

        salariu.bonusuri.push({
            tip: req.body.tip,
            suma: req.body.suma,
            descriere: req.body.descriere,
            moneda: req.body.moneda || 'RON'
        });

        const salariuActualizat = await salariu.save();
        res.json(salariuActualizat);
    } catch (error) {
        res.status(400).json({ mesaj: error.message });
    }
});

// Adaugă deducere
router.post('/:id/deducere', async (req, res) => {
    try {
        const salariu = await Salary.findById(req.params.id);
        if (!salariu) {
            return res.status(404).json({ mesaj: 'Salariul nu a fost găsit' });
        }

        salariu.deduceri.push({
            tip: req.body.tip,
            suma: req.body.suma,
            descriere: req.body.descriere,
            moneda: req.body.moneda || 'RON'
        });

        const salariuActualizat = await salariu.save();
        res.json(salariuActualizat);
    } catch (error) {
        res.status(400).json({ mesaj: error.message });
    }
});

// Marchează salariul ca plătit
router.post('/:id/plateste', async (req, res) => {
    try {
        const salariu = await Salary.findById(req.params.id);
        if (!salariu) {
            return res.status(404).json({ mesaj: 'Salariul nu a fost găsit' });
        }

        if (salariu.status !== 'calculat') {
            return res.status(400).json({ mesaj: 'Salariul trebuie să fie calculat înainte de a fi marcat ca plătit' });
        }

        salariu.status = 'platit';
        salariu.dataPlata = new Date();

        const salariuActualizat = await salariu.save();

        await History.logModificare(
            'Salary',
            salariu._id,
            'StatusUpdate',
            [{
                camp: 'status',
                valoareVeche: 'calculat',
                valoareNoua: 'platit'
            }],
            req.user?._id,
            'Salariu marcat ca plătit'
        );

        res.json(salariuActualizat);
    } catch (error) {
        res.status(400).json({ mesaj: error.message });
    }
});

module.exports = router;