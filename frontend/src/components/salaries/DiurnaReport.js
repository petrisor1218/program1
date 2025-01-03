import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import FormInput from '../shared/forms/FormInput';
import Button from '../shared/buttons/Button';
import Select from '../shared/forms/Select';
import { formatDate } from '../../utils/dateUtils';

const DiurnaReport = () => {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [drivers, setDrivers] = useState([]);
    const [filters, setFilters] = useState({
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
        driverId: '',
        includeInactive: false
    });

    useEffect(() => {
        loadDrivers();
    }, []);

    const loadDrivers = async () => {
        try {
            const response = await api.get('/drivers', {
                params: { includeInactive: true }
            });
            setDrivers(response.data);
        } catch (error) {
            console.error('Error loading drivers:', error);
        }
    };

    const generateReport = async () => {
        try {
            setLoading(true);
            const response = await api.get('/reports/diurna', { params: filters });
            setReport(response.data);
        } catch (error) {
            console.error('Error generating report:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateTotals = () => {
        if (!report?.entries.length) return { zile: 0, suma: 0 };
        return report.entries.reduce((acc, entry) => ({
            zile: acc.zile + entry.totalZile,
            suma: acc.suma + entry.totalDiurna
        }), { zile: 0, suma: 0 });
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <FormInput
                        label="Data Start"
                        type="date"
                        value={filters.startDate}
                        onChange={e => setFilters({...filters, startDate: e.target.value})}
                    />
                    <FormInput
                        label="Data Final"
                        type="date"
                        value={filters.endDate}
                        onChange={e => setFilters({...filters, endDate: e.target.value})}
                    />
                    <Select
                        label="Șofer"
                        value={filters.driverId}
                        onChange={e => setFilters({...filters, driverId: e.target.value})}
                    >
                        <option value="">Toți șoferii</option>
                        {drivers.map(driver => (
                            <option key={driver._id} value={driver._id}>
                                {driver.nume} {!driver.activ && '(Inactiv)'}
                            </option>
                        ))}
                    </Select>
                    <div className="flex items-center mt-8">
                        <label className="inline-flex items-center">
                            <input
                                type="checkbox"
                                className="form-checkbox h-5 w-5 text-blue-600"
                                checked={filters.includeInactive}
                                onChange={e => setFilters({...filters, includeInactive: e.target.checked})}
                            />
                            <span className="ml-2">Include șoferi inactivi</span>
                        </label>
                    </div>
                </div>
                <div className="mt-4">
                    <Button 
                        onClick={generateReport} 
                        disabled={loading}
                        variant="primary"
                    >
                        {loading ? 'Se generează...' : 'Generează Raport'}
                    </Button>
                </div>
            </div>

            {report && (
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Raport Diurnă</h3>
                        <div className="text-sm text-gray-500">
                            {formatDate(filters.startDate)} - {formatDate(filters.endDate)}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Șofer
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Total Zile
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Total Diurnă (EUR)
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Medie/Zi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {report.entries.map((entry, index) => (
                                    <tr key={index} className={!entry.activ ? 'bg-gray-50' : ''}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {entry.sofer.nume}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                entry.activ ? 
                                                'bg-green-100 text-green-800' : 
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {entry.activ ? 'Activ' : 'Inactiv'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {entry.totalZile}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                                            {entry.totalDiurna}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {(entry.totalDiurna / entry.totalZile || 0).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="bg-gray-50 font-medium">
                                    <td colSpan="2" className="px-6 py-4">
                                        Total
                                    </td>
                                    <td className="px-6 py-4">
                                        {calculateTotals().zile}
                                    </td>
                                    <td className="px-6 py-4">
                                        {calculateTotals().suma}
                                    </td>
                                    <td className="px-6 py-4">
                                        {(calculateTotals().suma / calculateTotals().zile || 0).toFixed(2)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DiurnaReport;