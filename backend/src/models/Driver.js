const mongoose = require('mongoose');

// Schema pentru perioadele de activitate
const perioadaActivitateSchema = new mongoose.Schema({
    dataStart: { 
        type: Date,
        required: true 
    },
    dataFinal: Date,
    status: {
        type: String,
        enum: ['Plecat', 'In Tara'],
        required: true
    },
    zonaCurse: {
        type: String,
        required: function() {
            return this.status === 'Plecat';
        }
    },
    diurnaZi: {
        type: Number,
        default: 70
    },
    ultimulCalcul: Date,
    sumaDiurnaCalculata: Number
});

const avansSchema = new mongoose.Schema({
    suma: {
        type: Number,
        required: true
    },
    dataAcordare: {
        type: Date,
        default: Date.now
    },
    rataLunara: {
        type: Number,
        required: true
    },
    moneda: {
        type: String,
        enum: ['RON', 'EUR'],
        required: true
    },
    sumaRamasa: Number,
    rateRamase: Number,
    status: {
        type: String,
        enum: ['ACTIV', 'ACHITAT'],
        default: 'ACTIV'
    }
});

// Schema pentru salarii șofer
const driverSalarySchema = new mongoose.Schema({
    data: { 
        type: Date,
        default: Date.now,
        required: true 
    },
    salariuBaza: { 
        type: Number,
        required: true,
        min: 0 
    },
    diurna: { 
        type: Number,
        default: 0,
        min: 0 
    },
    bonusuri: { 
        type: Number,
        default: 0,
        min: 0 
    },
    deduceri: { 
        type: Number,
        default: 0,
        min: 0 
    },
    moneda: { 
        type: String,
        enum: ['RON', 'EUR'],
        default: 'RON' 
    }
}, { _id: false });

// Schema principală pentru șofer
const driverSchema = new mongoose.Schema({
    nume: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    cnp: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    dataAngajare: {
        type: Date,
        required: true,
        index: true
    },
    dataIncheiereContract: {
        type: Date
    },
    motivDemisie: {
        type: String
    },
    dataUltimaSosire: {
        type: Date
    },
    dataNasterii: {
        type: Date,
        required: true
    },
    permisConducere: {
        serie: String,
        numar: String,
        dataExpirare: Date,
        categorii: [String]
    },
    contact: {
        telefon: String,
        email: String,
        adresa: String
    },
    vehiculAsignat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle'
    },
    status: {
        type: String,
        enum: ['Activ', 'Plecat', 'In Tara', 'Concediu', 'Suspendat', 'Inactiv'],
        default: 'Activ',
        index: true
    },
    documente: {
        contractMunca: String,
        fisMedical: {
            data: Date,
            dataExpirare: Date
        },
        avizPsihologic: {
            data: Date,
            dataExpirare: Date
        }
    },
    salariuBaza: {
        type: Number,
        required: true,
        default: 0
    },
    diurnaZi: {
        type: Number,
        required: true,
        default: 70
    },
    perioadeActivitate: [perioadaActivitateSchema],
    avansuri: [avansSchema],
    salarii: [driverSalarySchema],
    concediuFaraPlata: [{
        dataStart: Date,
        dataFinal: Date,
        motiv: String
    }],
    istoricVehicule: [{
        vehicul: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vehicle'
        },
        dataStart: Date,
        dataStop: Date,
        motiv: String
    }],
    activ: {
        type: Boolean,
        default: true,
        index: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Metode pentru calculul diurnei
driverSchema.methods.calculeazaDiurnaPerioada = function(dataStart, dataFinal) {
    const perioadeValide = this.perioadeActivitate.filter(perioada => 
        perioada.status === 'Plecat' &&
        perioada.dataStart <= dataFinal &&
        (perioada.dataFinal >= dataStart || !perioada.dataFinal)
    );

    return perioadeValide.reduce((total, perioada) => {
        const startCalcul = new Date(Math.max(perioada.dataStart, dataStart));
        const finalCalcul = perioada.dataFinal ? 
            new Date(Math.min(perioada.dataFinal, dataFinal)) : 
            new Date(dataFinal);

        const zileLucrate = Math.ceil((finalCalcul - startCalcul) / (1000 * 60 * 60 * 24));
        return total + (zileLucrate * perioada.diurnaZi);
    }, 0);
};

// Metodă pentru actualizarea avansurilor
driverSchema.methods.actualizeazaAvansuri = function() {
    this.avansuri.forEach(avans => {
        if (avans.status === 'ACTIV') {
            const platitPanaAcum = avans.suma - avans.sumaRamasa;
            avans.rateRamase = Math.ceil(avans.sumaRamasa / avans.rataLunara);
            
            if (avans.sumaRamasa <= 0) {
                avans.status = 'ACHITAT';
            }
        }
    });
};

// Virtual pentru calculul vechimii
driverSchema.virtual('vechime').get(function() {
    if (!this.dataAngajare) return 0;
    const endDate = this.dataIncheiereContract || new Date();
    return Math.floor((endDate - this.dataAngajare) / (1000 * 60 * 60 * 24));
});

// Metodă pentru calculul zilelor lucrate într-o lună
driverSchema.methods.calculeazaZileLucrate = function(luna, an) {
    const dataStart = new Date(an, luna - 1, 1);
    const dataFinal = new Date(an, luna, 0);

    // Exclude zilele de concediu fără plată
    const zileConcediu = this.concediuFaraPlata.reduce((total, concediu) => {
        if (concediu.dataStart <= dataFinal && concediu.dataFinal >= dataStart) {
            const startConcediu = new Date(Math.max(concediu.dataStart, dataStart));
            const finalConcediu = new Date(Math.min(concediu.dataFinal, dataFinal));
            return total + Math.ceil((finalConcediu - startConcediu) / (1000 * 60 * 60 * 24));
        }
        return total;
    }, 0);

    // Calculează zilele totale în lună minus concediul
    const zileTotaleLuna = dataFinal.getDate();
    return zileTotaleLuna - zileConcediu;
};

const Driver = mongoose.model('Driver', driverSchema);

module.exports = Driver;