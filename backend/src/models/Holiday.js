const mongoose = require('mongoose');

const diurnaSchema = new mongoose.Schema({
    dataStart: {
        type: Date,
        required: true
    },
    dataFinal: {
        type: Date,
        required: true
    },
    zileLucrate: {
        type: Number,
        required: true,
        min: 1
    },
    sumaDiurna: {
        type: Number,
        required: true,
        min: 0
    },
    moneda: {
        type: String,
        enum: ['EUR', 'RON'],
        default: 'EUR'
    },
    statusCalcul: {
        type: String,
        enum: ['CALCULAT', 'PLATIT'],
        default: 'CALCULAT'
    },
    deduceri: [{
        tip: String,
        suma: Number,
        referinta: mongoose.Schema.Types.ObjectId
    }],
    observatii: String
}, { _id: false });

const holidaySchema = new mongoose.Schema({
    sofer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        required: true,
        index: true
    },
    tipConcediu: {
        type: String,
        enum: ['Odihna', 'Medical', 'Neplatit', 'Special', 'Intre Curse'],
        required: true
    },
    dataStart: {
        type: Date,
        required: true,
        index: true
    },
    dataFinal: {
        type: Date,
        required: true,
        index: true
    },
    zileTotale: {
        type: Number,
        required: true,
        min: 1
    },
    status: {
        type: String,
        enum: ['Programat', 'In Desfasurare', 'Finalizat', 'Anulat'],
        default: 'Programat'
    },
    afecteazaSalariu: {
        type: Boolean,
        default: function() {
            return this.tipConcediu === 'Neplatit';
        }
    },
    istoricDiurna: [diurnaSchema],
    documente: [{
        tip: String,
        url: String,
        dataIncarcare: {
            type: Date,
            default: Date.now
        }
    }],
    motiv: {
        type: String,
        required: true
    },
    aprobatDe: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    observatii: String
}, {
    timestamps: true
});

// Indexuri pentru căutări eficiente
holidaySchema.index({ sofer: 1, dataStart: 1, dataFinal: 1 });
holidaySchema.index({ status: 1 });

// Middleware pentru calculul automat al zilelor
holidaySchema.pre('save', function(next) {
    if (this.dataStart && this.dataFinal) {
        const diffTime = Math.abs(this.dataFinal - this.dataStart);
        this.zileTotale = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }
    next();
});

// Middleware pentru verificarea și actualizarea statusului
holidaySchema.pre('save', function(next) {
    const currentDate = new Date();
    
    if (currentDate < this.dataStart) {
        this.status = 'Programat';
    } else if (currentDate >= this.dataStart && currentDate <= this.dataFinal) {
        this.status = 'In Desfasurare';
    } else if (currentDate > this.dataFinal) {
        this.status = 'Finalizat';
    }
    
    next();
});

// Metodă pentru verificarea suprapunerilor
holidaySchema.methods.verificaSuprapunere = async function() {
    return await this.constructor.findOne({
        sofer: this.sofer,
        _id: { $ne: this._id },
        status: { $ne: 'Anulat' },
        $or: [
            {
                dataStart: { $lte: this.dataFinal },
                dataFinal: { $gte: this.dataStart }
            }
        ]
    });
};

// Metodă pentru adăugarea diurnei
holidaySchema.methods.adaugaDiurna = async function(perioadaStart, perioadaFinal, sumaPeZi = 70) {
    const zileLucrate = Math.ceil((perioadaFinal - perioadaStart) / (1000 * 60 * 60 * 24));
    const sumaDiurna = zileLucrate * sumaPeZi;

    this.istoricDiurna.push({
        dataStart: perioadaStart,
        dataFinal: perioadaFinal,
        zileLucrate,
        sumaDiurna,
        moneda: 'EUR'
    });

    return this.save();
};

// Metodă pentru calculul zilelor în țară într-o perioadă
holidaySchema.statics.calculeazaZileInTara = async function(soferId, dataStart, dataFinal) {
    const perioade = await this.find({
        sofer: soferId,
        status: { $ne: 'Anulat' },
        dataStart: { $lte: dataFinal },
        dataFinal: { $gte: dataStart }
    });

    return perioade.reduce((total, perioada) => {
        const start = Math.max(perioada.dataStart, dataStart);
        const final = Math.min(perioada.dataFinal, dataFinal);
        const zile = Math.ceil((final - start) / (1000 * 60 * 60 * 24));
        return total + zile;
    }, 0);
};

// Metodă pentru calculul total diurnă într-o perioadă
holidaySchema.statics.calculeazaTotalDiurna = async function(soferId, dataStart, dataFinal) {
    const perioade = await this.find({
        sofer: soferId,
        'istoricDiurna': { $exists: true, $ne: [] },
        dataStart: { $lte: dataFinal },
        dataFinal: { $gte: dataStart }
    });

    return perioade.reduce((total, perioada) => {
        return total + perioada.istoricDiurna.reduce((sum, diurna) => {
            // Verifică dacă perioada de diurnă se suprapune cu intervalul cerut
            const diurnaStart = new Date(Math.max(diurna.dataStart, dataStart));
            const diurnaFinal = new Date(Math.min(diurna.dataFinal, dataFinal));
            
            if (diurnaStart <= diurnaFinal) {
                const zileSuperior = Math.ceil((diurnaFinal - diurnaStart) / (1000 * 60 * 60 * 24));
                return sum + (zileSuperior * (diurna.sumaDiurna / diurna.zileLucrate));
            }
            return sum;
        }, 0);
    }, 0);
};

// Metodă pentru generarea rapoartelor
holidaySchema.statics.genereazaRaport = async function(criterii = {}) {
    const match = {};
    
    if (criterii.soferId) match.sofer = mongoose.Types.ObjectId(criterii.soferId);
    if (criterii.dataStart) match.dataStart = { $gte: criterii.dataStart };
    if (criterii.dataFinal) match.dataFinal = { $lte: criterii.dataFinal };
    if (criterii.tipConcediu) match.tipConcediu = criterii.tipConcediu;
    if (criterii.status) match.status = criterii.status;

    return await this.aggregate([
        { $match: match },
        { $lookup: {
            from: 'drivers',
            localField: 'sofer',
            foreignField: '_id',
            as: 'soferInfo'
        }},
        { $unwind: '$soferInfo' },
        { $group: {
            _id: {
                sofer: '$sofer',
                tipConcediu: '$tipConcediu'
            },
            totalZile: { $sum: '$zileTotale' },
            perioade: { $push: {
                dataStart: '$dataStart',
                dataFinal: '$dataFinal',
                zileTotale: '$zileTotale',
                status: '$status'
            }},
            numeConcedii: { $first: '$soferInfo.nume' }
        }},
        { $sort: { 'numeConcedii': 1 } }
    ]);
};

const Holiday = mongoose.model('Holiday', holidaySchema);

module.exports = Holiday;