const app = require('./app');
const cron = require('node-cron');
const SalaryService = require('./services/SalaryService');  // calea corectă către serviciu

const PORT = process.env.PORT || 5000;

// Funcție pentru a verifica dacă este penultima zi a lunii
const isPenultimateDayOfMonth = () => {
    const today = new Date();
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    return today.getDate() === lastDay - 1;
};

// Rulează în fiecare zi la ora 10:00 dimineața
cron.schedule('0 10 * * *', async () => {
    const today = new Date();
    const isDay14 = today.getDate() === 14;
    
    if (isDay14 || isPenultimateDayOfMonth()) {
        console.log('=================================================');
        console.log(`[${new Date().toISOString()}] ÎNCEPERE CALCUL AUTOMAT SALARII`);
        console.log(`Tip calcul: ${isDay14 ? 'Diurnă prima jumătate' : 'Salariu și diurnă final'}`);
        
        try {
            await SalaryService.processAutomaticPayments();
            console.log(`[${new Date().toISOString()}] Calculul s-a finalizat cu succes`);
            console.log('Lista de sarcini completate:');
            console.log('- Calcul diurnă');
            console.log('- Aplicare deduceri automate');
            console.log('- Salvare în baza de date');
        } catch (error) {
            console.error(`[${new Date().toISOString()}] EROARE la procesarea automată:`, error);
        }
        
        console.log('=================================================');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Procesare automată programată pentru ora 10:00 în zilele de 14 și penultima zi a lunii');
});