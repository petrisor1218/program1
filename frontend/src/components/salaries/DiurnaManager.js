// C:\Users\Administrator\OneDrive\Documente\GitHub\salarizare\modern-backend\frontend\src\components\salaries\DiurnaManager.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Button from '../shared/buttons/Button';
import FormInput from '../shared/forms/FormInput';
import { formatDateForInput, calculateDays } from '../../utils/dateUtils';

const DiurnaManager = ({ driverId }) => {
    const [diurne, setDiurne] = useState([]);
    const [driverDetails, setDriverDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        dataStart: '',
        dataFinal: '',
        sumaDiurna: 70, // Valoare implicită
        moneda: 'EUR',
        observatii: ''
    });

    useEffect(() => {
        if (driverId) {
            loadDiurne();
            loadDriverDetails();
        }
    }, [driverId]);

    const loadDriverDetails = async () => {
        try {
            const response = await api.get(`/drivers/${driverId}`);
            setDriverDetails(response.data);
        } catch (error) {
            console.error('Error loading driver details:', error);
        }
    };

    const loadDiurne = async () => {
        try {
            const response = await api.get(`/holidays/${driverId}/diurna`);
            setDiurne(response.data);
        } finally {
            setLoading(false);
        }
    };

    const validateDates = () => {
        const startDate = new Date(formData.dataStart);
        const endDate = new Date(formData.dataFinal);

        // Verifică dacă șoferul este inactiv și data este după ultima sosire
        if (driverDetails && !driverDetails.activ && driverDetails.dataUltimaSosire) {
            const dataUltimaSosire = new Date(driverDetails.dataUltimaSosire);
            if (endDate > dataUltimaSosire) {
                return 'Nu se poate adăuga diurnă după data ultimei sosiri pentru un șofer inactiv';
            }
        }

        // Verifică suprapunerile cu alte perioade
        const hasOverlap = diurne.some(diurna => {
            const diurnaStart = new Date(diurna.dataStart);
            const diurnaEnd = new Date(diurna.dataFinal);
            return (startDate <= diurnaEnd && endDate >= diurnaStart);
        });

        if (hasOverlap) {
            return 'Există deja o diurnă înregistrată pentru această perioadă';
        }

        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationError = validateDates();
        if (validationError) {
            alert(validationError);
            return;
        }

        try {
            setLoading(true);
            await api.post(`/holidays/${driverId}/diurna`, formData);
            await loadDiurne();
            setFormData({
                dataStart: '',
                dataFinal: '',
                sumaDiurna: 70,
                moneda: 'EUR',
                observatii: ''
            });
        } catch (error) {
            console.error('Error saving diurna:', error);
            alert('Eroare la salvarea diurnei');
        } finally {
            setLoading(false);
        }
    };

    const calculateTotal = () => {
        return diurne.reduce((total, diurna) => {
            if (diurna.moneda === 'EUR') {
                return total + diurna.sumaDiurna * calculateDays(diurna.dataStart, diurna.dataFinal);
            }
            return total;
        }, 0);
    };

    if (loading) {
        return <div>Se încarcă...</div>;
    }

    return (
        <div className="space-y-6">
            {driverDetails && !driverDetails.activ && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <p className="text-yellow-700">
                        Șofer inactiv - Diurna poate fi adăugată doar până la data: {' '}
                        {formatDateForInput(driverDetails.dataUltimaSosire)}
                    </p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                        label="Data Start"
                        type="date"
                        value={formData.dataStart}
                        onChange={e => setFormData({...formData, dataStart: e.target.value})}
                        required
                    />
                    <FormInput
                        label="Data Final"
                        type="date"
                        value={formData.dataFinal}
                        onChange={e => setFormData({...formData, dataFinal: e.target.value})}
                        required
                    />
                    <FormInput
                        label="Sumă Diurnă/Zi"
                        type="number"
                        value={formData.sumaDiurna}
                        onChange={e => setFormData({...formData, sumaDiurna: parseFloat(e.target.value)})}
                        required
                    />
                    <FormInput
                        label="Observații"
                        value={formData.observatii}
                        onChange={e => setFormData({...formData, observatii: e.target.value})}
                    />
                </div>
                <div className="mt-4">
                    <Button type="submit" disabled={loading}>
                        Adaugă Diurnă
                    </Button>
                </div>
            </form>

            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Istoric Diurne</h3>
                    <div className="text-2xl font-bold text-green-600">
                        Total: {calculateTotal()} EUR
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Perioada
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Zile
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Sumă/Zi
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Total
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Observații
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {diurne.map((diurna, index) => {
                                const zile = calculateDays(diurna.dataStart, diurna.dataFinal);
                                return (
                                    <tr key={index}>
                                        <td className="px-6 py-4">
                                            {formatDateForInput(diurna.dataStart)} - {formatDateForInput(diurna.dataFinal)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {zile}
                                        </td>
                                        <td className="px-6 py-4">
                                            {diurna.sumaDiurna} {diurna.moneda}
                                        </td>
                                        <td className="px-6 py-4 font-medium">
                                            {diurna.sumaDiurna * zile} {diurna.moneda}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {diurna.observatii || '-'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DiurnaManager;