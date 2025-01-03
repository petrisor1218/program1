const Driver = require('../models/Driver');
const Salary = require('../models/Salary');
const Fine = require('../models/Fine');
const History = require('../models/History');

class SalaryService {
    static async processAutomaticPayments() {
        const currentDate = new Date();
        const day = currentDate.getDate();
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();

        // Procesare la mijlocul lunii (15) sau sfârșitul lunii (30/31)
        if (day === 14) {  // Cu o zi înainte de 15
            await this.processDiurna(currentDate, true); // prima jumătate
        } 
        // Cu o zi înainte de sfârșitul lunii
        else if (day === new Date(year, month, 0).getDate() - 1) {
            await this.processDiurna(currentDate, false); // a doua jumătate
            await this.processMonthlySalaries(currentDate); // salarii
        }
    }

    static async processDiurna(currentDate, isMidMonth) {
        const drivers = await Driver.find({ 
            activ: true, 
            status: { $in: ['Plecat', 'In Tara'] }
        });

        for (const driver of drivers) {
            try {
                // Determină perioada de calcul
                const perioadaStart = isMidMonth ? 
                    new Date(currentDate.getFullYear(), currentDate.getMonth(), 1) :
                    new Date(currentDate.getFullYear(), currentDate.getMonth(), 16);
                
                const perioadaFinal = isMidMonth ?
                    new Date(currentDate.getFullYear(), currentDate.getMonth(), 15) :
                    currentDate;

                // Calculează diurna pentru perioada curentă
                const diurnaCalculata = await driver.calculeazaDiurnaPerioada(perioadaStart, perioadaFinal);

                // Creează înregistrarea pentru diurnă
                const salary = new Salary({
                    sofer: driver._id,
                    luna: currentDate,
                    tipPlata: isMidMonth ? 'DIURNA_15' : 'DIURNA_30',
                    perioadaStart,
                    perioadaFinal,
                    diurna: diurnaCalculata,
                    moneda: 'EUR',
                    zileLucrate: Math.ceil((perioadaFinal - perioadaStart) / (1000 * 60 * 60 * 24)),
                    status: 'Draft'
                });

                // Aplică deducerile automate
                await salary.aplicaDeduceriAutomate();

                // Salvează și loghează în istoric
                const savedSalary = await salary.save();
                await History.logModificare(
                    'Salary',
                    savedSalary._id,
                    'Creare',
                    [],
                    null,
                    `Calcul automat diurnă ${isMidMonth ? 'prima' : 'a doua'} jumătate a lunii`
                );

            } catch (error) {
                console.error(`Error processing diurna for driver ${driver._id}:`, error);
            }
        }
    }

    static async processMonthlySalaries(currentDate) {
        const drivers = await Driver.find({ activ: true });

        for (const driver of drivers) {
            try {
                // Calculează zilele lucrate (exclude concediu fără plată)
                const zileLucrate = await driver.calculeazaZileLucrate(
                    currentDate.getMonth() + 1,
                    currentDate.getFullYear()
                );

                // Calculează salariul proporțional cu zilele lucrate
                const salariuCalculat = (driver.salariuBaza / 30) * zileLucrate;

                // Creează înregistrarea de salariu
                const salary = new Salary({
                    sofer: driver._id,
                    luna: currentDate,
                    tipPlata: 'SALARIU',
                    perioadaStart: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
                    perioadaFinal: currentDate,
                    salariuBaza: salariuCalculat,
                    zileLucrate,
                    moneda: 'RON',
                    status: 'Draft'
                });

                // Aplică deducerile automate
                await salary.aplicaDeduceriAutomate();

                // Salvează și loghează în istoric
                const savedSalary = await salary.save();
                await History.logModificare(
                    'Salary',
                    savedSalary._id,
                    'Creare',
                    [],
                    null,
                    'Calcul automat salariu lunar'
                );

            } catch (error) {
                console.error(`Error processing salary for driver ${driver._id}:`, error);
            }
        }
    }
}

module.exports = SalaryService;