const mongoose = require('mongoose');

const deducereSchema = new mongoose.Schema({
    tip: {
        type: String,
        enum: ['AMENDA', 'AVANS'],
        required: true
    },
    suma: {
        type: Number,
        required: true,
        min: 0
    },
    moneda: {
        type: String,
        enum: ['RON', 'EUR'],
        required: true
    },
    referinta: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'deduceri.tip'
    }
}, { _id: false });

const bonusSchema = new mongoose.Schema({
    tip: {
        type: String,
        required: true
    },
    suma: {
        type: Number,
        required: true,
        min: 0
    },
    moneda: {
        type: String,
        enum: ['RON', 'EUR'],
        required: true
    },
    descriere: String
}, { _id: false });

const salarySchema = new mongoose.Schema({
    sofer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        required: true,
        index: true
    },
    luna: {
        type: Date,
        required: true,
        index: true
    },
    tipPlata: {
        type: String,
        enum: ['SALARIU', 'DIURNA_15', 'DIURNA_30'],
        required: true
    },
    perioadaStart: {
        type: Date,
        required: true
    },
    perioadaFinal: {
        type: Date,
        required: true
    },
    salariuBaza: {
        type: Number,
        required: function() {
            return this.tipPlata === 'SALARIU';
        },
        min: 0
    },
    diurna: {
        type: Number,
        required: function() {
            return this.tipPlata.startsWith('DIURNA');
        },
        min: 0
    },
    bonusuri: [bonusSchema],
    deduceri: [deducereSchema],
    zileLucrate: {
        type: Number,
        required: true,
        min: 0
    },
    sumaBruta: {
        type: Number,
        required: true,
        min: 0
    },
    sumaFinala: {
        type: Number,
        required: true
    },
    moneda: {
        type: String,
        enum: ['RON', 'EUR'],
        required: true
    },
    observatii: String,
    status: {
        type: String,
        enum: ['Draft', 'Calculat', 'Aprobat', 'Platit'],
        default: 'Draft'
    },
    dataPlata: Date,
    istoricCalcule: [{
        data: Date,
        sumaBruta: Number,
        sumaFinala: Number,
        detaliiCalcul: String
    }]
}, {
    timestamps: true
});

// Indexuri pentru performanță
salarySchema.index({ sofer: 1, luna: 1, tipPlata: 1 }, { unique: true });
salarySchema.index({ status: 1 });
salarySchema.index({ 'deduceri.referinta': 1 });

// Middleware pentru calculul automat al sumelor
salarySchema.pre('save', function(next) {
    // Calculează suma brută
    if (this.tipPlata === 'SALARIU') {
        this.sumaBruta = this.salariuBaza;
    } else {
        this.sumaBruta = this.diurna;
    }

    // Adaugă bonusuri
    const totalBonusuri = this.bonusuri.reduce((sum, bonus) => {
        if (bonus.moneda === this.moneda) {
            return sum + bonus.suma;
        }
        // Aici ar trebui adăugată logica de conversie valutară
        return sum;
    }, 0);

    // Scade deduceri
    const totalDeduceri = this.deduceri.reduce((sum, deducere) => {
        if (deducere.moneda === this.moneda) {
            return sum + deducere.suma;
        }
        // Aici ar trebui adăugată logica de conversie valutară
        return sum;
    }, 0);

    // Calculează suma finală
    this.sumaFinala = this.sumaBruta + totalBonusuri - totalDeduceri;

    // Adaugă la istoric
    this.istoricCalcule.push({
        data: new Date(),
        sumaBruta: this.sumaBruta,
        sumaFinala: this.sumaFinala,
        detaliiCalcul: `Calcul: ${this.sumaBruta} + ${totalBonusuri} - ${totalDeduceri}`
    });

    next();
});

// Metodă pentru calculul și actualizarea diurnei
salarySchema.methods.calculeazaDiurnaAutomata = async function() {
    const Driver = mongoose.model('Driver');
    const driver = await Driver.findById(this.sofer);
    
    if (!driver) throw new Error('Șofer negăsit');

    // Calculează diurna pentru perioada specificată
    const diurnaCalculata = await driver.calculeazaDiurnaPerioada(
        this.perioadaStart,
        this.perioadaFinal
    );

    this.diurna = diurnaCalculata;
    this.status = 'Calculat';

    return this.save();
};

// Metodă pentru aplicarea deducerilor automate
salarySchema.methods.aplicaDeduceriAutomate = async function() {
    const Driver = mongoose.model('Driver');
    const driver = await Driver.findById(this.sofer);

    if (!driver) throw new Error('Șofer negăsit');

    // Aplică deduceri din avansuri
    for (const avans of driver.avansuri) {
        if (avans.status === 'ACTIV' && avans.sumaRamasa > 0) {
            const sumaDeRedus = Math.min(avans.rataLunara, avans.sumaRamasa);
            
            this.deduceri.push({
                tip: 'AVANS',
                suma: sumaDeRedus,
                moneda: avans.moneda,
                referinta: avans._id
            });

            avans.sumaRamasa -= sumaDeRedus;
            if (avans.sumaRamasa <= 0) {
                avans.status = 'ACHITAT';
            }
        }
    }

    await driver.save();
    return this.save();
};

// Metodă pentru verificarea dacă se poate face plata
salarySchema.methods.poateFiPlatit = function() {
    return this.status === 'Aprobat' && !this.dataPlata;
};

// Metodă pentru verificarea dacă se poate recalcula
salarySchema.methods.poateFiRecalculat = function() {
    return this.status !== 'Platit';
};

const Salary = mongoose.model('Salary', salarySchema);

module.exports = Salary;