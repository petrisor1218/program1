// C:\Users\Administrator\OneDrive\Documente\GitHub\salarizare\modern-backend\frontend\src\components\vehicles\VehicleCostsAnalytics.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatDate } from '../../utils/dateUtils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const VehicleCostsAnalytics = ({ vehicleId }) => {
    const [costsData, setCostsData] = useState({
        sumarCosturi: {
            total: 0,
            carburant: 0,
            service: 0,
            asigurari: 0,
            taxe: 0,
            altele: 0
        },
        istoricLunar: [],
        previziuni: {
            lunaUrmatoare: 0,
            urmatoarele3Luni: 0,
            urmatoarele6Luni: 0
        },
        detaliiCosturi: []
    });

    const [selectedPeriod, setSelectedPeriod] = useState('12'); // luni

    useEffect(() => {
        if (vehicleId) loadCostsData();
    }, [vehicleId, selectedPeriod]);

    const loadCostsData = async () => {
        try {
            const response = await api.get(`/vehicles/${vehicleId}/costs-analysis`, {
                params: { months: selectedPeriod }
            });
            setCostsData(response.data);
        } catch (error) {
            console.error('Error loading costs data:', error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Sumar Costuri */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <CostCard
                    title="Total"
                    value={costsData.sumarCosturi.total}
                    color="blue"
                />
                <CostCard
                    title="Carburant"
                    value={costsData.sumarCosturi.carburant}
                    color="green"
                />
                <CostCard
                    title="Service"
                    value={costsData.sumarCosturi.service}
                    color="yellow"
                />
                <CostCard
                    title="Asigurări"
                    value={costsData.sumarCosturi.asigurari}
                    color="purple"
                />
                <CostCard
                    title="Taxe"
                    value={costsData.sumarCosturi.taxe}
                    color="red"
                />
                <CostCard
                    title="Altele"
                    value={costsData.sumarCosturi.altele}
                    color="gray"
                />
            </div>

            {/* Grafic Evoluție */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium mb-4">Evoluție Costuri</h3>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={costsData.istoricLunar}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="luna" />
                            <YAxis />
                            <Tooltip />
                            <Area 
                                type="monotone" 
                                dataKey="carburant" 
                                stackId="1"
                                stroke="#059669" 
                                fill="#059669" 
                            />
                            <Area 
                                type="monotone" 
                                dataKey="service" 
                                stackId="1"
                                stroke="#EAB308" 
                                fill="#EAB308" 
                            />
                            <Area 
                                type="monotone" 
                                dataKey="asigurari" 
                                stackId="1"
                                stroke="#7C3AED" 
                                fill="#7C3AED" 
                            />
                            <Area 
                                type="monotone" 
                                dataKey="taxe" 
                                stackId="1"
                                stroke="#DC2626" 
                                fill="#DC2626" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Previziuni */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium mb-4">Previziuni Costuri</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded">
                        <p className="text-sm text-blue-600">Luna Următoare</p>
                        <p className="text-2xl font-bold text-blue-800">
                            {costsData.previziuni.lunaUrmatoare} RON
                        </p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded">
                        <p className="text-sm text-blue-600">Următoarele 3 Luni</p>
                        <p className="text-2xl font-bold text-blue-800">
                            {costsData.previziuni.urmatoarele3Luni} RON
                        </p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded">
                        <p className="text-sm text-blue-600">Următoarele 6 Luni</p>
                        <p className="text-2xl font-bold text-blue-800">
                            {costsData.previziuni.urmatoarele6Luni} RON
                        </p>
                    </div>
                </div>
            </div>

            {/* Detalii Costuri */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium mb-4">Detalii Costuri</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Data
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Categorie
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Descriere
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Cost
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {costsData.detaliiCosturi.map((cost, index) => (
                                <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {formatDate(cost.data)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                            cost.categorie === 'carburant' ? 'bg-green-100 text-green-800' :
                                            cost.categorie === 'service' ? 'bg-yellow-100 text-yellow-800' :
                                            cost.categorie === 'asigurari' ? 'bg-purple-100 text-purple-800' :
                                            cost.categorie === 'taxe' ? 'bg-red-100 text-red-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {cost.categorie}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {cost.descriere}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {cost.suma} RON
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const CostCard = ({ title, value, color }) => {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        yellow: 'bg-yellow-50 text-yellow-600',
        purple: 'bg-purple-50 text-purple-600',
        red: 'bg-red-50 text-red-600',
        gray: 'bg-gray-50 text-gray-600'
    };

    return (
        <div className={`p-4 rounded-lg ${colorClasses[color]}`}>
            <p className="text-sm">{title}</p>
            <p className="text-xl font-bold">{value} RON</p>
        </div>
    );
};

export default VehicleCostsAnalytics;