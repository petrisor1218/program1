const Driver = require('../models/Driver');
const Salary = require('../models/Salary');
const Document = require('../models/Document');
const Holiday = require('../models/Holiday');

const dashboardController = {
    async getOverview(req, res) {
        try {
            const activeDrivers = await Driver.countDocuments({ activ: true });
            const totalDrivers = await Driver.countDocuments();
            const pendingHolidays = await Holiday.countDocuments({ status: 'pending' });
            const expiringDocs = await Document.countDocuments({
                dataExpirare: {
                    $gte: new Date(),
                    $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                }
            });

            res.json({
                activeDrivers,
                totalDrivers,
                pendingHolidays,
                expiringDocs
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getActivity(req, res) {
        try {
            const activities = await Driver.aggregate([
                { $match: { activ: true } },
                { $sort: { ultimaModificare: -1 } },
                { $limit: 10 }
            ]);
            res.json(activities);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getDriverStatus(req, res) {
        try {
            const drivers = await Driver.find({ activ: true })
                .select('nume status locatieCurenta')
                .sort('nume');
            res.json(drivers);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getExpiringDocuments(req, res) {
        try {
            const documents = await Document.find({
                dataExpirare: {
                    $gte: new Date(),
                    $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                }
            })
            .populate('sofer', 'nume')
            .sort('dataExpirare');
            res.json(documents);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getFinancialSummary(req, res) {
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

            res.json(salaries[0] || { totalSalarii: 0, totalDiurne: 0, count: 0 });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = dashboardController;