import React, { useState, useEffect } from 'react';
import { driversAPI } from '../../services/api';
import { formatDate, calculateDays } from '../../utils/dateUtils';
import Button from '../shared/buttons/Button';
import FormInput from '../shared/forms/FormInput';

const DriverDetails = ({ driverId }) => {
    const [driver, setDriver] = useState(null);
    const [perioade, setPerioade] = useState([]);
    const [calculDiurna, setCalculDiurna] = useState({
        lunaCurenta: 0,
        totalAn: 0,
        zileInTara: 0,
        zilePlecat: 0
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (driverId) {
            loadAllData();
        }
    }, [driverId]);

    const loadAllData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                loadDriverData(),
                loadPerioade(),
                loadCalculDiurna()
            ]);
            setError(null);
        } catch (error) {
            console.error('Error loading data:', error);
            setError('Eroare la încărcarea datelor');
        } finally {
            setLoading(false);
        }
    };

    const loadDriverData = async () => {
        const response = await driversAPI.getById(driverId);
        setDriver(response.data);
    };

    const loadPerioade = async () => {
        const response = await driversAPI.getPerioade(driverId);
        setPerioade(response.data);
    };

    const loadCalculDiurna = async () => {
        const response = await driversAPI.getSalariu(driverId, {
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear()
        });
        setCalculDiurna(response.data);
    };

    const handleAdaugaPerioada = async (data) => {
        try {
            setLoading(true);
            await driversAPI.addPerioada(driverId, data);
            await loadAllData();
            setError(null);
        } catch (error) {
            console.error('Error adding perioada:', error);
            setError('Eroare la adăugarea perioadei');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                <p className="text-red-700">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Informații de bază */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-bold mb-4">{driver?.nume}</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <InfoCard
                        label="Status"
                        value={driver?.status}
                    />
                    <InfoCard
                        label="Vehicul"
                        value={driver?.vehiculAsignat?.nume || 'Neasignat'}
                    />
                    <InfoCard
                        label="Zonă Curse"
                        value={driver?.detaliiAmazon?.zonaCurse}
                    />
                    <InfoCard
                        label="ID Amazon"
                        value={driver?.detaliiAmazon?.idSofer}
                    />
                </div>
            </div>

            {/* Calcul Diurnă */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium mb-4">Calcul Diurnă</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <InfoCard
                        label="Diurnă Luna Curentă"
                        value={`${calculDiurna.lunaCurenta} EUR`}
                    />
                    <InfoCard
                        label="Total Diurnă An"
                        value={`${calculDiurna.totalAn} EUR`}
                    />
                    <InfoCard
                        label="Zile în Țară"
                        value={calculDiurna.zileInTara}
                    />
                    <InfoCard
                        label="Zile Plecat"
                        value={calculDiurna.zilePlecat}
                    />
                </div>
            </div>

            {/* Perioade */}
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Perioade</h3>
                    <Button 
                        variant="primary"
                        onClick={() => handleAdaugaPerioada()}
                        disabled={loading}
                    >
                        Adaugă Perioadă
                    </Button>
                </div>
                <div className="space-y-4">
                    {perioade.map((perioada) => (
                        <div 
                            key={perioada._id}
                            className="border-l-4 border-blue-500 pl-4 py-2"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-medium">
                                        {formatDate(perioada.dataStart)} - {formatDate(perioada.dataFinal)}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {perioada.status} - {calculateDays(perioada.dataStart, perioada.dataFinal)} zile
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium">
                                        {perioada.status === 'Plecat' ? 
                                            `${perioada.diurna} EUR` : '-'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Documente */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium mb-4">Documente</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <DocumentCard
                        label="Permis Conducere"
                        dataExpirare={driver?.permisConducere?.dataExpirare}
                        serie={driver?.permisConducere?.serie}
                        numar={driver?.permisConducere?.numar}
                    />
                    <DocumentCard
                        label="Fișă Medicală"
                        dataExpirare={driver?.documente?.fisMedical?.dataExpirare}
                    />
                    <DocumentCard
                        label="Aviz Psihologic"
                        dataExpirare={driver?.documente?.avizPsihologic?.dataExpirare}
                    />
                    <DocumentCard
                        label="Atestat Profesional"
                        dataExpirare={driver?.documente?.atestatProfesional?.dataExpirare}
                        serie={driver?.documente?.atestatProfesional?.serie}
                        numar={driver?.documente?.atestatProfesional?.numar}
                    />
                    <DocumentCard
                        label="Card Tahograf"
                        dataExpirare={driver?.documente?.cardTahograf?.dataExpirare}
                        serie={driver?.documente?.cardTahograf?.serie}
                    />
                </div>
            </div>
        </div>
    );
};

const InfoCard = ({ label, value }) => (
    <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-medium">{value}</p>
    </div>
);

const DocumentCard = ({ label, dataExpirare, serie, numar }) => {
    const isExpired = dataExpirare && new Date(dataExpirare) < new Date();
    const isExpiringSoon = dataExpirare && 
        new Date(dataExpirare) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    return (
        <div className={`p-4 rounded ${
            isExpired ? 'bg-red-50' :
            isExpiringSoon ? 'bg-yellow-50' :
            'bg-green-50'
        }`}>
            <p className="font-medium">{label}</p>
            {serie && numar && (
                <p className="text-sm">
                    {serie} {numar}
                </p>
            )}
            <p className={`text-sm ${
                isExpired ? 'text-red-600' :
                isExpiringSoon ? 'text-yellow-600' :
                'text-green-600'
            }`}>
                Expiră: {formatDate(dataExpirare)}
            </p>
        </div>
    );
};

export default DriverDetails;