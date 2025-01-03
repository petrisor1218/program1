const mongoose = require('mongoose');

// Schema pentru salarii
const salariuSchema = new mongoose.Schema({
  data: { type: Date, default: Date.now, index: true },
  suma: { type: Number, required: true, min: 0 },
  tip: { type: String, enum: ['salariu', 'diurna'], required: true },
  detalii: String,
  moneda: { type: String, enum: ['RON', 'EUR'], default: 'RON' },
}, { _id: false });

// Schema pentru amenzi
const amendaSchema = new mongoose.Schema({
  data: { type: Date, default: Date.now, index: true },
  suma: { type: Number, required: true, min: 0 },
  motiv: { type: String, required: [true, 'Motivul este obligatoriu'] },
  moneda: { type: String, default: 'EUR' },
}, { _id: false });

// Schema pentru avansuri
const avansSchema = new mongoose.Schema({
  data: { type: Date, default: Date.now, index: true },
  suma: { type: Number, required: true, min: 0 },
  rataLunara: { type: Number, required: true, min: 0 },
  platit: { type: Boolean, default: false },
}, { _id: false });

// Schema pentru service
const serviceSchema = new mongoose.Schema({
  id: { type: String, required: true },
  date: { type: Date, required: true },
  km: { type: Number, required: true, min: 0 },
  type: { type: String, required: true },
  details: String,
  cost: { type: Number, required: true, min: 0 },
  provider: String,
  nextServiceKm: { type: Number, min: 0 },
  urgency: { type: String, default: 'normal' },
  componentsServiced: [{ 
    name: String,
    details: String
  }]
}, { _id: false });

const vehicleSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  nume: { type: String, required: true, trim: true, index: true },
  tip: { type: String, required: true, enum: ['camioane', 'trailere'], index: true },
  kmCurent: { type: Number, default: 0, min: 0 },
  dataAchizitie: Date,
  dataAngajare: { type: Date, index: true },
  salariuBaza: { type: Number, default: 0, min: 0 },
  diurnaZilnica: { type: Number, default: 0, min: 0 },
  zileDiurna: { type: Number, default: 0, min: 0 },
  totalDiurna: { type: Number, default: 0, min: 0 },
  sumaRamasa: { type: Number, default: 0, min: 0 },
  activ: { type: Boolean, default: true, index: true },
  salarii: [salariuSchema],
  amenzi: [amendaSchema],
  avansuri: [avansSchema],
  serviceHistory: [serviceSchema],
  // Câmpuri noi pentru costuri și service
  totalServiceCosts: { type: Number, default: 0, min: 0 },
  lastServiceKm: { type: Number, default: 0, min: 0 },
  lastServiceDate: { type: Date },
  nextServiceKm: { type: Number, min: 0 },
  // Restul câmpurilor existente
  documente: {
    ITP: String,
    RCA: String,
    CopieConforma: String,
    RevizieTaho: String,
    ExpirareLicenta: String,
  },
  restante: {
    rate: { type: Number, default: 0, min: 0 },
    amenzi: { type: Number, default: 0, min: 0 },
  },
  created: { type: Date, default: Date.now, index: true },
  lastUpdated: { type: Date, default: Date.now, index: true },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Middleware pentru actualizarea automată a costurilor și datelor de service
vehicleSchema.pre('save', function(next) {
  // Actualizare timestamp
  this.lastUpdated = new Date();

  // Calculare totaluri service
  if (this.serviceHistory && this.serviceHistory.length > 0) {
    // Calculare costuri totale
    this.totalServiceCosts = this.serviceHistory.reduce(
      (sum, entry) => sum + (Number(entry.cost) || 0), 
      0
    );

    // Ultimul service
    const lastService = this.serviceHistory[this.serviceHistory.length - 1];
    this.lastServiceKm = lastService.km;
    this.lastServiceDate = lastService.date;
    this.nextServiceKm = lastService.nextServiceKm;
  }

  next();
});

// Middleware pentru actualizarea automată a timestamp-urilor
vehicleSchema.pre('save', function (next) {
  this.lastUpdated = new Date();
  next();
});

// Virtual pentru vechimea șoferului
vehicleSchema.virtual('vechime').get(function () {
  return this.dataAngajare ? Math.floor((new Date() - this.dataAngajare) / (1000 * 60 * 60 * 24)) : 0;
});

// Metode de instanță
vehicleSchema.methods.calculeazaSumaRamasa = function () {
  const totalAmenzi = this.amenzi.reduce((sum, amenda) => sum + (amenda.suma || 0), 0);
  const totalAvansuri = this.avansuri.reduce((sum, avans) => sum + (avans.suma || 0), 0);
  this.sumaRamasa = Math.max(0, this.totalDiurna - totalAmenzi - (this.rataLunara || 0) - totalAvansuri);
  return this.sumaRamasa;
};

// Export model
const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicle;