const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
    tipEntitate: {
        type: String,
        enum: ['Driver', 'Vehicle', 'Holiday', 'Fine', 'Salary'],  // Am adăugat 'Salary'
        required: true,
        index: true
    },
    idEntitate: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'tipEntitate',
        required: true,
        index: true
    },
    tipActiune: {
        type: String,
        enum: ['Creare', 'Modificare', 'Stergere', 'StatusUpdate'],
        required: true
    },
    dataPrincipala: {
        type: Date,
        default: Date.now,
        index: true
    },
    modificariCampuri: [{
        camp: String,
        valoareVeche: mongoose.Schema.Types.Mixed,
        valoareNoua: mongoose.Schema.Types.Mixed
    }],
    detalii: {
        type: String,
        required: true
    },
    utilizator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    dateAditionale: {
        statusVechi: String,
        statusNou: String,
        comentarii: String,
        documente: [{
            tip: String,
            url: String
        }]
    },
    context: {
        ip: String,
        browser: String,
        locatie: String
    },
    importanta: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Low'
    }
}, {
    timestamps: true
});

// Index pentru căutări rapide
historySchema.index({ dataPrincipala: -1 });
historySchema.index({ tipEntitate: 1, idEntitate: 1 });

// Metodă pentru adăugarea unei intrări în istoric
historySchema.statics.logModificare = async function(
    tipEntitate,
    idEntitate,
    tipActiune,
    modificari,
    utilizator,
    detalii,
    dateAditionale = {}
) {
    return await this.create({
        tipEntitate,
        idEntitate,
        tipActiune,
        modificariCampuri: modificari,
        utilizator,
        detalii,
        dateAditionale,
        importanta: dateAditionale.importanta || 'Low'
    });
};

// Metodă pentru obținerea istoricului unei entități
historySchema.statics.getIstoricEntitate = async function(tipEntitate, idEntitate) {
    return await this.find({
        tipEntitate,
        idEntitate
    })
    .sort({ dataPrincipala: -1 })
    .populate('utilizator', 'nume email')
    .exec();
};

// Metodă pentru rapoarte de activitate
historySchema.statics.getRaportActivitate = async function(startDate, endDate, filters = {}) {
    const query = {
        dataPrincipala: {
            $gte: startDate,
            $lte: endDate
        }
    };

    if (filters.tipEntitate) query.tipEntitate = filters.tipEntitate;
    if (filters.tipActiune) query.tipActiune = filters.tipActiune;
    if (filters.utilizator) query.utilizator = filters.utilizator;

    return await this.aggregate([
        { $match: query },
        { $group: {
            _id: {
                tip: "$tipEntitate",
                actiune: "$tipActiune",
                data: { $dateToString: { format: "%Y-%m-%d", date: "$dataPrincipala" } }
            },
            count: { $sum: 1 }
        }},
        { $sort: { "_id.data": -1 } }
    ]);
};

const History = mongoose.model('History', historySchema);

module.exports = History;