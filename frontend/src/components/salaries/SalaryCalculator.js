import React, { useState, useEffect } from 'react';
import { driversAPI, salariesAPI } from '../../services/api';
import { formatDate, calculateDays } from '../../utils/dateUtils';
import FormInput from '../shared/forms/FormInput';
import Select from '../shared/forms/Select';
import Button from '../shared/buttons/Button';
import DeducereModal from './modals/DeducereModal';
import AvansModal from './modals/AvansModal';

const SalaryCalculator = () => {
    const [drivers, setDrivers] = useState([]);
    const [selectedDriver, setSelectedDriver] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [salaryData, setSalaryData] = useState({
        salariuBaza: 0,
        diurna: {
            zile: 0,
            suma: 0,
            perioade: []
        },
        bonusuri: [],
        deduceri: [],
        avansuri: [],
        totalDeduceri: 0,
        totalAvansuri: 0,
        totalBonusuri: 0,
        totalPlataRON: 0,
        totalPlataEUR: 0
    });

    const [isDeducereModalOpen, setIsDeducereModalOpen] = useState(false);
    const [isAvansModalOpen, setIsAvansModalOpen] = useState(false);

    useEffect(() => {
        loadDrivers();
    }, []);

    useEffect(() => {
        if (selectedDriver) {
            calculateSalary();
        }
    }, [selectedDriver, selectedMonth, selectedYear]);

    const loadDrivers = async () => {
        try {
            const response = await driversAPI.getAll();
            setDrivers(response.data);
        } catch (error) {
            console.error('Error loading drivers:', error);
            setError('Eroare la încărcarea șoferilor');
        }
    };

    const calculateSalary = async () => {
        try {
            setLoading(true);
            setError(null);

            // 1. Încarcă datele șoferului
            const driverResponse = await driversAPI.getById(selectedDriver);
            const driver = driverResponse.data;

            // 2. Determină perioada de calcul
            const startDate = new Date(selectedYear, selectedMonth - 1, 1);
            const endDate = new Date(selectedYear, selectedMonth, 0);
            let effectiveEndDate = endDate;

            // Ajustează perioada pentru șoferii inactivi
            if (!driver.activ && driver.dataIncheiereContract) {
                const contractEndDate = new Date(driver.dataIncheiereContract);
                if (contractEndDate < endDate) {
                    effectiveEndDate = contractEndDate;
                }
            }

            // 3. Încarcă perioadele pentru diurnă
            const perioadeResponse = await driversAPI.getPerioade(selectedDriver, {
                dataStart: startDate.toISOString(),
                dataFinal: effectiveEndDate.toISOString()
            });

            // 4. Calculează diurna
            const perioade = perioadeResponse.data.filter(p => p.status === 'Plecat');
            const zileDiurna = perioade.reduce((total, perioada) => {
                return total + calculateDays(perioada.dataStart, perioada.dataFinal);
            }, 0);
            const sumaDiurna = zileDiurna * (driver.diurnaZi || 70);

            // 5. Încarcă/creează salariul pentru luna curentă
            let salary = await loadOrCreateSalary(driver, startDate);

            // 6. Calculează totalurile
            const totalDeduceri = salary.deduceri.reduce((sum, d) => sum + d.suma, 0);
            const totalAvansuri = salary.avansuri.reduce((sum, a) => sum + a.suma, 0);
            const totalBonusuri = salary.bonusuri.reduce((sum, b) => sum + b.suma, 0);

            // 7. Calculează salariul final
            const salariuBazaAjustat = driver.activ ? 
                driver.salariuBaza : 
                calculateProRataSalary(driver.salariuBaza, startDate, effectiveEndDate);

            const totalPlataRON = salariuBazaAjustat + totalBonusuri - totalDeduceri - totalAvansuri;

            // 8. Actualizează state-ul
            setSalaryData({
                salariuBaza: salariuBazaAjustat,
                diurna: {
                    zile: zileDiurna,
                    suma: sumaDiurna,
                    perioade
                },
                bonusuri: salary.bonusuri,
                deduceri: salary.deduceri,
                avansuri: salary.avansuri,
                totalDeduceri,
                totalAvansuri,
                totalBonusuri,
                totalPlataRON,
                totalPlataEUR: sumaDiurna
            });

            // 9. Actualizează salariul în baza de date
            await salariesAPI.update(salary._id, {
                salariuBaza: salariuBazaAjustat,
                diurna: sumaDiurna,
                zileLucrate: zileDiurna,
                totalPlataRON,
                totalPlataEUR: sumaDiurna
            });

        } catch (error) {
            console.error('Error calculating salary:', error);
            setError('Eroare la calculul salariului');
        } finally {
            setLoading(false);
        }
    };

    const loadOrCreateSalary = async (driver, startDate) => {
        const salariesResponse = await salariesAPI.getByDriver(selectedDriver);
        let salary = salariesResponse.data.find(s => 
            new Date(s.luna).getMonth() === startDate.getMonth() &&
            new Date(s.luna).getFullYear() === startDate.getFullYear()
        );

        if (!salary) {
            const newSalaryResponse = await salariesAPI.create({
                sofer: selectedDriver,
                luna: startDate,
                salariuBaza: driver.salariuBaza,
                status: 'Draft'
            });
            salary = newSalaryResponse.data;
        }

        return salary;
    };

    const calculateProRataSalary = (salariuBaza, startDate, endDate) => {
        const totalDays = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();
        const workedDays = Math.min(endDate.getDate(), totalDays);
        return Math.round((salariuBaza / totalDays) * workedDays);
    };

    const handleAddDeducere = async (deducereData) => {
        try {
            await salariesAPI.addDeducere(selectedDriver, {
                ...deducereData,
                luna: new Date(selectedYear, selectedMonth - 1)
            });
            await calculateSalary();
            setIsDeducereModalOpen(false);
        } catch (error) {
            console.error('Error adding deducere:', error);
            setError('Eroare la adăugarea deducerii');
        }
    };

    const handleAddAvans = async (avansData) => {
        try {
            await salariesAPI.addAvans(selectedDriver, {
                ...avansData,
                luna: new Date(selectedYear, selectedMonth - 1)
            });
            await calculateSalary();
            setIsAvansModalOpen(false);
        } catch (error) {
            console.error('Error adding avans:', error);
            setError('Eroare la adăugarea avansului');
        }
    };

    const handleFinalizeSalary = async () => {
        try {
            await salariesAPI.finalize(selectedDriver, {
                luna: new Date(selectedYear, selectedMonth - 1)
            });
            await calculateSalary();
        } catch (error) {
            console.error('Error finalizing salary:', error);
            setError('Eroare la finalizarea salariului');
        }
    };

    return (
        <div className="space-y-6">
            {/* Controale selecție */}
            <div className="bg-white p-4 rounded-lg shadow">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Select
                        label="Șofer"
                        value={selectedDriver}
                        onChange={(e) => setSelectedDriver(e.target.value)}
                        options={drivers.map(d => ({
                            value: d._id,
                            label: `${d.nume} ${!d.activ ? '(Inactiv)' : ''}`
                        }))}
                    />
                    
                    <Select
                        label="Luna"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                        options={[
                            { value: 1, label: "Ianuarie" },
                            { value: 2, label: "Februarie" },
                            { value: 3, label: "Martie" },
                            { value: 4, label: "Aprilie" },
                            { value: 5, label: "Mai" },
                            { value: 6, label: "Iunie" },
                            { value: 7, label: "Iulie" },
                            { value: 8, label: "August" },
                            { value: 9, label: "Septembrie" },
                            { value: 10, label: "Octombrie" },
                            { value: 11, label: "Noiembrie" },
                            { value: 12, label: "Decembrie" }
                        ]}
                    />
                    
                    <FormInput
                        type="number"
                        label="An"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        min={2000}
                        max={2100}
                    />
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {loading ? (
                <div className="text-center py-8">Se calculează...</div>
            ) : selectedDriver && (
                <>
                    {/* Sumar salariu */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-lg shadow">
                            <p className="text-sm text-gray-500">Salariu Bază</p>
                            <p className="text-2xl font-bold">{salaryData.salariuBaza} RON</p>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg shadow">
                            <p className="text-sm text-gray-500">Diurnă ({salaryData.diurna.zile} zile)</p>
                            <p className="text-2xl font-bold">{salaryData.diurna.suma} EUR</p>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow">
                            <p className="text-sm text-gray-500">Total de Plată</p>
                            <p className="text-2xl font-bold text-green-600">
                                {salaryData.totalPlataRON} RON + {salaryData.totalPlataEUR} EUR
                            </p>
                        </div>
                    </div>

                    {/* Perioade diurnă */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-medium mb-4">Perioade Diurnă</h3>
                        {salaryData.diurna.perioade.map((perioada, index) => (
                            <div key={index} className="flex justify-between border-b py-2">
                                <div>
                                    <p className="font-medium">
                                        {formatDate(perioada.dataStart)} - {formatDate(perioada.dataFinal)}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {calculateDays(perioada.dataStart, perioada.dataFinal)} zile - {perioada.zonaCurse}
                                    </p>
                                </div>
                                <p className="font-medium">
                                    {calculateDays(perioada.dataStart, perioada.dataFinal) * (perioada.diurnaZi || 70)} EUR
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Deduceri și avansuri */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Deduceri */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium">Deduceri</h3>
                                <Button 
                                    variant="secondary"
                                    onClick={() => setIsDeducereModalOpen(true)}
                                >
                                    Adaugă Deducere
                                </Button>
                            </div>
                            {salaryData.deduceri.map((deducere, index) => (
                                <div key={index} className="flex justify-between border-b py-2">
                                    <div>
                                        <p className="font-medium">{deducere.tip}</p>
                                        <p className="text-sm text-gray-500">{deducere.descriere}</p>
                                    </div>
                                    <p className="font-medium text-red-600">-{deducere.suma} RON</p>
                                </div>
                            ))}
                            <div className="mt-4 pt-2 border-t">
                                <div className="flex justify-between">
                                    <p className="font-medium">Total Deduceri</p>
                                    <p className="font-medium text-red-600">
                                        -{salaryData.totalDeduceri} RON
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Avansuri */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium">Avansuri</h3>
                                <Button 
                                    variant="secondary"
                                    onClick={() => setIsAvansModalOpen(true)}
                                >
                                    Adaugă Avans
                                </Button>
                            </div>
                            {salaryData.avansuri.map((avans, index) => (
                                <div key={index} className="flex justify-between border-b py-2">
                                    <div>
                                    <p className="font-medium">Avans din {formatDate(avans.data)}</p>
                                        <p className="text-sm text-gray-500">{avans.descriere}</p>
                                    </div>
                                    <p className="font-medium text-blue-600">-{avans.suma} RON</p>
                                </div>
                            ))}
                            <div className="mt-4 pt-2 border-t">
                                <div className="flex justify-between">
                                    <p className="font-medium">Total Avansuri</p>
                                    <p className="font-medium text-blue-600">
                                        -{salaryData.totalAvansuri} RON
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Butoane acțiuni */}
                    <div className="flex justify-end space-x-4">
                        <Button
                            variant="primary"
                            onClick={handleFinalizeSalary}
                        >
                            Finalizează Calcul
                        </Button>
                    </div>

                    {/* Modale */}
                    <DeducereModal
                        isOpen={isDeducereModalOpen}
                        onClose={() => setIsDeducereModalOpen(false)}
                        onSubmit={handleAddDeducere}
                    />
                    
                    <AvansModal
                        isOpen={isAvansModalOpen}
                        onClose={() => setIsAvansModalOpen(false)}
                        onSubmit={handleAddAvans}
                    />
                </>
            )}
        </div>
    );
};

export default SalaryCalculator;