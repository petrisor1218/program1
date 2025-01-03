const mongoose = require('mongoose');

const plataSchema = new mongoose.Schema({
    data: {
        type: Date,
        required: true
    },
    suma: {
        type: Number,
        required: true,
        min: 0
    },
    metodaPlata: {
        type: String,
        enum: ['Cash', 'Transfer', 'RetinereSalariu', 'RetinereDiurna'],
        required: true
    },
    documentPlata: String,
    deducereAutomata: {
        activa: Boolean,
        rataLunara: Number,
        dataPrimaRetinere: Date,
        sumaRamasa: Number
    }
}, { _id: false });

const documentSchema = new mongoose.Schema({
    tip: {
        type: String,
        enum: ['ProcesVerbal', 'DovadaPlata', 'Contestatie', 'AlteDocumente'],
        required: true
    },
    url: String,
    dataIncarcare: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

const fineSchema = new mongoose.Schema({
    sofer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        required: true,
        index: true
    },
    vehicul: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: true,
        index: true
    },
    dataAmenda: {
        type: Date,
        required: true,
        default: Date.now,
        index: true
    },
    sumaTotala: {
        type: Number,
        required: true,
        min: 0
    },
    moneda: {
        type: String,
        enum: ['RON', 'EUR'],
        default: 'RON'
    },
    tipAmenda: {
        type: String,
        enum: ['Viteza', 'Parcare', 'Tahograf', 'Documente', 'Tehnic', 'Altele'],
        required: true
    },
    detaliiAmenda: {
        locatie: String,
        numarProcesVerbal: String,
        organEmitent: String,
        articolLegal: String,
        descriereDetaliata: String
    },
    statusPlata: {
        type: String,
        enum: ['Neplatita', 'InCursPlata', 'Platita', 'Contestata'],
        default: 'Neplatita',
        index: true
    },
    plati: [plataSchema],
    termeneImportante: {
        dataScadenta: Date,
        dataLimitaContestatie: Date,
        dataReducere: Date
    },
    documente: [documentSchema],
    contestatie: {
        status: {
            type: String,
            enum: ['NeIntrodusa', 'InCurs', 'Admisa', 'Respinsa'],
            default: 'NeIntrodusa'
        },
        dataDepunere: Date,
        numarDosar: String,
        instanta: String,
        rezultat: String,
        dataRezolutie: Date
    },
    deducereAutomata: {
        activa: {
            type: Boolean,
            default: false
        },
        tipDeducere: {
            type: String,
            enum: ['SALARIU', 'DIURNA'],
            required: function() {
                return this.deducereAutomata.activa;
            }
        },
        rataLunara: {
            type: Number,
            required: function() {
                return this.deducereAutomata.activa;
            },
            min: 0
        },
        ziDeducere: {
            type: Number,
            min: 1,
            max: 31,
            default: 15
        },
        sumaRamasa: Number,
        dataUltimaDeducere: Date
    },
    notificari: {
        trimise: [{
            tip: String,
            data: Date,
            catre: String,
            status: String
        }],
        urmatoareaNotificare: Date
    }
}, {
    timestamps: true
});

// Indexuri pentru performanță
fineSchema.index({ 'termeneImportante.dataScadenta': 1 });
fineSchema.index({ 'statusPlata': 1, 'dataAmenda': -1 });
fineSchema.index({ 'deducereAutomata.activa': 1, 'deducereAutomata.dataUltimaDeducere': 1 });

// Middleware pentru actualizarea sumei rămase și statusului
fineSchema.pre('save', function(next) {
    // Calculează suma plătită
    const sumaPlata = this.plati.reduce((total, plata) => total + plata.suma, 0);
    
    // Actualizează suma rămasă pentru deducere automată
    if (this.deducereAutomata.activa) {
        this.deducereAutomata.sumaRamasa = this.sumaTotala - sumaPlata;
    }

    // Actualizează statusul plății
    if (sumaPlata >= this.sumaTotala) {
        this.statusPlata = 'Platita';
        this.deducereAutomata.activa = false;
    } else if (sumaPlata > 0) {
        this.statusPlata = 'InCursPlata';
    }

    next();
});

// Metodă pentru adăugarea unei plăți
fineSchema.methods.adaugaPlata = async function(plataData) {
    this.plati.push(plataData);
    
    // Actualizează suma rămasă pentru deducere automată
    if (this.deducereAutomata.activa) {
        const sumaPlata = this.plati.reduce((total, plata) => total + plata.suma, 0);
        this.deducereAutomata.sumaRamasa = this.sumaTotala - sumaPlata;
    }

    return this.save();
};

// Metodă pentru activarea deducerii automate
fineSchema.methods.activeazaDeducereAutomata = function(tipDeducere, rataLunara, ziDeducere = 15) {
    this.deducereAutomata = {
        activa: true,
        tipDeducere,
        rataLunara,
        ziDeducere,
        sumaRamasa: this.sumaTotala - this.plati.reduce((total, plata) => total + plata.suma, 0),
        dataUltimaDeducere: null
    };
};

// Metodă pentru calcul rată lunară recomandată
fineSchema.methods.calculeazaRataLunaraRecomandata = function(luniDorite = 3) {
    const sumaRamasa = this.sumaTotala - this.plati.reduce((total, plata) => total + plata.suma, 0);
    return Math.ceil(sumaRamasa / luniDorite);
};

// Metodă statică pentru raportare
fineSchema.statics.getRaportAmenzi = async function(startDate, endDate, filters = {}) {
    const match = {
        dataAmenda: { $gte: startDate, $lte: endDate }
    };

    if (filters.sofer) match.sofer = mongoose.Types.ObjectId(filters.sofer);
    if (filters.vehicul) match.vehicul = mongoose.Types.ObjectId(filters.vehicul);
    if (filters.statusPlata) match.statusPlata = filters.statusPlata;

    return await this.aggregate([
        { $match: match },
        { $group: {
            _id: {
                sofer: "$sofer",
                tipAmenda: "$tipAmenda"
            },
            totalAmenzi: { $sum: 1 },
            sumaTotal: { $sum: "$sumaTotala" }
        }},
        { $lookup: {
            from: 'drivers',
            localField: '_id.sofer',
            foreignField: '_id',
            as: 'soferInfo'
        }}
    ]);
};

const Fine = mongoose.model('Fine', fineSchema);

module.exports = Fine;