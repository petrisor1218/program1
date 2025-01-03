const Holiday = require('../models/Holiday');
const Driver = require('../models/Driver');
const History = require('../models/History');

// Obține toate perioadele
exports.getAllHolidays = async (req, res) => {
    try {
        const filters = {};
        if (req.query.status) filters.status = req.query.status;
        if (req.query.sofer) filters.sofer = req.query.sofer;
        if (req.query.tipConcediu) filters.tipConcediu = req.query.tipConcediu;

        const holidays = await Holiday.find(filters)
            .populate('sofer', 'nume')
            .sort({ dataStart: -1 });
        res.json(holidays);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obține perioadele unui șofer specific
exports.getDriverHolidays = async (req, res) => {
    try {
        const holidays = await Holiday.find({ sofer: req.params.soferId })
            .populate('sofer', 'nume')
            .sort({ dataStart: -1 });
        res.json(holidays);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Adaugă o nouă perioadă
exports.createHoliday = async (req, res) => {
    try {
        const driver = await Driver.findById(req.body.sofer);
        if (!driver) {
            return res.status(404).json({ message: 'Șoferul nu a fost găsit' });
        }

        // Calculăm zilele total
        const dataStart = new Date(req.body.dataStart);
        const dataFinal = new Date(req.body.dataFinal);
        const diffTime = Math.abs(dataFinal - dataStart);
        const zileTotale = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        const holiday = new Holiday({
            sofer: req.body.sofer,
            tipConcediu: req.body.tipConcediu,
            dataStart: dataStart,
            dataFinal: dataFinal,
            zileTotale: zileTotale,
            status: req.body.status,
            motiv: req.body.motiv,
            documente: req.body.documente,
            observatii: req.body.observatii
        });

        if (req.body.istoricDiurna) {
            holiday.istoricDiurna = req.body.istoricDiurna;
        }

        const suprapunere = await holiday.verificaSuprapunere();
        if (suprapunere) {
            return res.status(400).json({ 
                message: 'Există deja o înregistrare în această perioadă'
            });
        }

        const newHoliday = await holiday.save();

        driver.status = req.body.status;
        await driver.save();

        await History.logModificare(
            'Holiday',
            newHoliday._id,
            'Creare',
            [],
            req.user?._id,
            `Nouă perioadă adăugată: ${req.body.status}`
        );

        res.status(201).json(newHoliday);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Adaugă diurnă
exports.addDiurna = async (req, res) => {
    try {
        const holiday = await Holiday.findById(req.params.id);
        if (!holiday) {
            return res.status(404).json({ message: 'Perioada nu a fost găsită' });
        }

        holiday.istoricDiurna.push({
            dataStart: req.body.dataStart,
            dataStop: req.body.dataStop,
            zileLucrate: req.body.zileLucrate,
            sumaDiurna: req.body.sumaDiurna,
            moneda: req.body.moneda,
            observatii: req.body.observatii
        });

        const updatedHoliday = await holiday.save();

        await History.logModificare(
            'Holiday',
            holiday._id,
            'Modificare',
            [{
                camp: 'istoricDiurna',
                valoareNoua: req.body
            }],
            req.user?._id,
            'Adăugare diurnă'
        );

        res.json(updatedHoliday);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Calculează zile în țară
exports.calculateZileInTara = async (req, res) => {
    try {
        const anStart = parseInt(req.query.anStart) || new Date().getFullYear();
        const lunaStart = parseInt(req.query.lunaStart) || 1;
        const anEnd = parseInt(req.query.anEnd) || new Date().getFullYear();
        const lunaEnd = parseInt(req.query.lunaEnd) || 12;

        const zileInTara = await Holiday.calculeazaZileInTara(
            req.params.soferId,
            anStart,
            lunaStart,
            anEnd,
            lunaEnd
        );

        res.json({ zileInTara });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Calculează total diurnă
exports.calculateTotalDiurna = async (req, res) => {
    try {
        const anStart = parseInt(req.query.anStart) || new Date().getFullYear();
        const lunaStart = parseInt(req.query.lunaStart) || 1;
        const anEnd = parseInt(req.query.anEnd) || new Date().getFullYear();
        const lunaEnd = parseInt(req.query.lunaEnd) || 12;

        const totalDiurna = await Holiday.calculeazaTotalDiurna(
            req.params.soferId,
            anStart,
            lunaStart,
            anEnd,
            lunaEnd
        );

        res.json({ totalDiurna });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = exports;