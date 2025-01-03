const express = require('express');
const router = express.Router();
const Driver = require('../models/Driver');
const Vehicle = require('../models/Vehicle');
const History = require('../models/History');
const Salary = require('../models/Salary');

// GET /api/dashboard/stats
router.get('/stats', async (req, res) => {
    try {
        const stats = {
            totalDrivers: await Driver.countDocuments(),
            activeDrivers: await Driver.countDocuments({ status: 'Activ' }),
            driversOnHoliday: await Driver.countDocuments({ status: 'Concediu' }),
            totalVehicles: await Vehicle.countDocuments()
        };
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/dashboard/activity
router.get('/activity', async (req, res) => {
    try {
        const currentDate = new Date();
        const startDate = new Date(currentDate.getTime() - (7 * 24 * 60 * 60 * 1000)); // 7 zile în urmă

        const activities = await History.find({
            dataPrincipala: { $gte: startDate }
        })
        .sort({ dataPrincipala: -1 })
        .limit(10)
        .populate('utilizator', 'nume')
        .populate({
            path: 'idEntitate',
            refPath: 'tipEntitate'
        });

        const formattedActivities = activities.map(activity => ({
            id: activity._id,
            tip: activity.tipEntitate,
            actiune: activity.tipActiune,
            data: activity.dataPrincipala,
            detalii: activity.detalii,
            utilizator: activity.utilizator?.nume || 'System',
            importanta: activity.importanta,
            modificari: activity.modificariCampuri
        }));

        res.json(formattedActivities);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/dashboard/overview
router.get('/overview', async (req, res) => {
    try {
        const stats = {
            totalDrivers: await Driver.countDocuments(),
            activeDrivers: await Driver.countDocuments({ status: 'Activ' }),
            driversOnHoliday: await Driver.countDocuments({ status: 'Concediu' }),
            totalVehicles: await Vehicle.countDocuments(),
            recentActivities: await History.find()
                .sort({ dataPrincipala: -1 })
                .limit(5)
                .populate('utilizator', 'nume'),
            expiringDocumentsCount: (await Vehicle.find({
                $or: [
                    { 'ITP.dataExpirare': { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } },
                    { 'RCA.dataExpirare': { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } },
                    { 'Tahograf.dataExpirare': { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } }
                ]
            })).length
        };
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/dashboard/documents/expiring
router.get('/expiring-documents', async (req, res) => {
    try {
        console.log('Starting documents/expiring route...');
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        console.log('Searching for driver docs...');
        // Șoferi cu documente expirate
        const driverDocs = await Driver.find({
            $or: [
                { 'documente.fisMedical.dataExpirare': { $lte: thirtyDaysFromNow } },
                { 'documente.avizPsihologic.dataExpirare': { $lte: thirtyDaysFromNow } },
                { 'documente.atestatProfesional.dataExpirare': { $lte: thirtyDaysFromNow } }
            ]
        }).select('nume documente');
        console.log('Driver docs found:', driverDocs);

        console.log('Searching for vehicle docs...');
        // Vehicule cu documente expirate
        const vehicleDocs = await Vehicle.find({
            $or: [
                { 'ITP.dataExpirare': { $lte: thirtyDaysFromNow } },
                { 'RCA.dataExpirare': { $lte: thirtyDaysFromNow } },
                { 'Tahograf.dataExpirare': { $lte: thirtyDaysFromNow } }
            ]
        }).select('numarInmatriculare ITP RCA Tahograf');
        console.log('Vehicle docs found:', vehicleDocs);

        const expiringDocs = [];

        // Procesare documente șoferi
        driverDocs.forEach(driver => {
            if (driver.documente.fisMedical.dataExpirare <= thirtyDaysFromNow) {
                expiringDocs.push({
                    tip: 'Fișă Medicală',
                    entitate: driver.nume,
                    tipEntitate: 'Driver',
                    dataExpirare: driver.documente.fisMedical.dataExpirare
                });
            }
            if (driver.documente.avizPsihologic.dataExpirare <= thirtyDaysFromNow) {
                expiringDocs.push({
                    tip: 'Aviz Psihologic',
                    entitate: driver.nume,
                    tipEntitate: 'Driver',
                    dataExpirare: driver.documente.avizPsihologic.dataExpirare
                });
            }
            if (driver.documente.atestatProfesional.dataExpirare <= thirtyDaysFromNow) {
                expiringDocs.push({
                    tip: 'Atestat Profesional',
                    entitate: driver.nume,
                    tipEntitate: 'Driver',
                    dataExpirare: driver.documente.atestatProfesional.dataExpirare
                });
            }
        });

        // Procesare documente vehicule
        vehicleDocs.forEach(vehicle => {
            if (vehicle.ITP.dataExpirare <= thirtyDaysFromNow) {
                expiringDocs.push({
                    tip: 'ITP',
                    entitate: vehicle.numarInmatriculare,
                    tipEntitate: 'Vehicle',
                    dataExpirare: vehicle.ITP.dataExpirare
                });
            }
            if (vehicle.RCA.dataExpirare <= thirtyDaysFromNow) {
                expiringDocs.push({
                    tip: 'RCA',
                    entitate: vehicle.numarInmatriculare,
                    tipEntitate: 'Vehicle',
                    dataExpirare: vehicle.RCA.dataExpirare
                });
            }
            if (vehicle.Tahograf.dataExpirare <= thirtyDaysFromNow) {
                expiringDocs.push({
                    tip: 'Tahograf',
                    entitate: vehicle.numarInmatriculare,
                    tipEntitate: 'Vehicle',
                    dataExpirare: vehicle.Tahograf.dataExpirare
                });
            }
        });

        // Sortare după data expirării
        expiringDocs.sort((a, b) => new Date(a.dataExpirare) - new Date(b.dataExpirare));

        res.json(expiringDocs);
    } catch (error) {
        console.error('Error in /documents/expiring:', error);
        res.status(500).json({ 
            message: 'Eroare la obținerea documentelor', 
            error: error.message 
        });
    }
});

// GET /api/dashboard/drivers/status
router.get('/driver-status', async (req, res) => {
    try {
        const drivers = await Driver.find()
            .select('nume status vehiculAsignat')
            .populate('vehiculAsignat', 'numarInmatriculare')
            .sort('nume');

        const formattedDrivers = drivers.map(driver => ({
            id: driver._id,
            name: driver.nume,
            vehicle: driver.vehiculAsignat?.numarInmatriculare || 'Neasignat',
            status: driver.status,
            statusText: driver.status
        }));

        res.json(formattedDrivers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/dashboard/financial-summary
router.get('/financial-summary', async (req, res) => {
    try {
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();

        const salaries = await Salary.aggregate([
            {
                $match: {
                    luna: currentMonth,
                    an: currentYear,
                    status: 'finalizat'
                }
            },
            {
                $group: {
                    _id: null,
                    totalSalarii: { $sum: '$total' },
                    totalDiurne: { $sum: '$totalDiurna' },
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json(salaries[0] || { 
            totalSalarii: 0, 
            totalDiurne: 0, 
            count: 0,
            luna: currentMonth,
            an: currentYear 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;