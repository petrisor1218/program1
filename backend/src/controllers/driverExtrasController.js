const Driver = require('../models/Driver');
const Holiday = require('../models/Holiday');
const Vehicle = require('../models/Vehicle');
const History = require('../models/History');

// Obține perioadele de concediu ale unui șofer
exports.getDriverPeriods = async (req, res) => {
    try {
        const { dataStart, dataEnd } = req.query;

        const driver = await Driver.findById(req.params.id);
        if (!driver) {
            return res.status(404).json({ message: 'Șoferul nu a fost găsit' });
        }

        const holidays = await Holiday.find({
            sofer: req.params.id,
            $or: [
                { dataStart: { $lte: new Date(dataEnd) }, dataFinal: { $gte: new Date(dataStart) } }
            ]
        }).sort({ dataStart: 1 });

        res.json(holidays);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obține salariul pentru o lună specificată
exports.getDriverSalary = async (req, res) => {
    try {
        const { month, year } = req.query;
        const driver = await Driver.findById(req.params.id);
        if (!driver) {
            return res.status(404).json({ message: 'Șoferul nu a fost găsit' });
        }

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
};

// Asignează vehicul unui șofer
exports.assignVehicle = async (req, res) => {
    try {
        const driver = await Driver.findById(req.params.id);
        if (!driver) {
            return res.status(404).json({ message: 'Șoferul nu a fost găsit' });
        }

        const vehicle = await Vehicle.findById(req.body.vehiculId);
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehiculul nu a fost găsit' });
        }

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

        await History.logModificare(
            'Driver',
            driver._id,
            'Modificare',
            [{ camp: 'vehiculAsignat', valoareVeche: driver.vehiculAsignat, valoareNoua: vehicle._id }],
            req.user?._id,
            'Asignare vehicul nou'
        );

        res.json(updatedDriver);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
